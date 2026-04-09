const express = require('express');
const db      = require('../db/connection');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router  = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders  — list orders
//   Admin: all orders  |  Customer: their own orders only
//   Query params: ?status=Pending&search=john&page=1&limit=20
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let conditions = [];
    let params     = [];

    // Customers see only their own orders
    if (req.user.role === 'customer') {
      conditions.push('o.customer_id = ?');
      params.push(req.user.id);
    }

    if (status) {
      conditions.push('o.order_status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(u.name LIKE ? OR o.shipping_address LIKE ? OR o.user_id LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [rows] = await db.query(`
      SELECT o.user_id AS order_id, u.name AS customer_name, u.email,
             o.total_amount, o.order_status, o.shipping_address,
             o.created_at, o.updated_at, o.status
      FROM orders o
      JOIN users u ON u.id = o.customer_id
      ${where}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [[{ total }]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM orders o
      JOIN users u ON u.id = o.customer_id
      ${where}
    `, params);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/:id  — single order with items
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.user_id AS order_id, u.name AS customer_name, u.email,
             o.total_amount, o.order_status, o.shipping_address,
             o.created_at, o.updated_at, o.status
      FROM orders o
      JOIN users u ON u.id = o.customer_id
      WHERE o.user_id = ?
    `, [req.params.id]);

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Order not found.' });

    const order = rows[0];

    // Customers can only view their own
    if (req.user.role === 'customer' && order.email !== req.user.email)
      return res.status(403).json({ success: false, message: 'Access denied.' });

    const [items] = await db.query(`
      SELECT oi.id, p.name AS product_name, oi.quantity, oi.unit_price,
             (oi.quantity * oi.unit_price) AS subtotal
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({ success: true, data: { ...order, items } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders  — place new order
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { shipping_address, items } = req.body;
    const customer_id = req.user.id;

    if (!shipping_address || !items || items.length === 0)
      return res.status(400).json({ success: false, message: 'shipping_address and items[] are required.' });

    // Fetch product prices from DB (never trust client-sent prices)
    let total_amount = 0;
    const enrichedItems = [];

    for (const item of items) {
      const [[product]] = await conn.query(
        'SELECT id, name, price, stock FROM products WHERE id = ?',
        [item.product_id]
      );
      if (!product)
        return res.status(404).json({ success: false, message: `Product ${item.product_id} not found.` });
      if (product.stock < item.quantity)
        return res.status(409).json({ success: false, message: `Insufficient stock for "${product.name}".` });

      total_amount += product.price * item.quantity;
      enrichedItems.push({ product_id: product.id, quantity: item.quantity, unit_price: product.price });
    }

    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      'INSERT INTO orders (customer_id, total_amount, shipping_address) VALUES (?, ?, ?)',
      [customer_id, total_amount.toFixed(2), shipping_address]
    );
    const order_id = orderResult.insertId;

    for (const item of enrichedItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [order_id, item.product_id, item.quantity, item.unit_price]
      );
      // Deduct stock
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order_id,
      total_amount: parseFloat(total_amount.toFixed(2)),
      order_status: 'Pending'
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/status  — update order status (admin only)
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/status', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { order_status } = req.body;
    const allowed = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

    if (!order_status || !allowed.includes(order_status))
      return res.status(400).json({ success: false, message: `order_status must be one of: ${allowed.join(', ')}` });

    const [rows] = await db.query('SELECT * FROM orders WHERE user_id = ?', [req.params.id]);
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Order not found.' });

    const statusBool = order_status !== 'Cancelled';
    await db.query(
      'UPDATE orders SET order_status = ?, status = ? WHERE user_id = ?',
      [order_status, statusBool, req.params.id]
    );

    res.json({ success: true, message: `Order status updated to "${order_status}".` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/orders/:id  — cancel order (soft delete)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders WHERE user_id = ?', [req.params.id]);
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Order not found.' });

    const order = rows[0];

    // Customers can only cancel their own orders
    if (req.user.role === 'customer' && order.customer_id !== req.user.id)
      return res.status(403).json({ success: false, message: 'Access denied.' });

    if (order.order_status === 'Shipped' || order.order_status === 'Delivered')
      return res.status(409).json({ success: false, message: 'Cannot cancel an order that has already been shipped or delivered.' });

    if (order.order_status === 'Cancelled')
      return res.status(409).json({ success: false, message: 'Order is already cancelled.' });

    // Soft delete — just update status fields
    await db.query(
      "UPDATE orders SET order_status = 'Cancelled', status = FALSE WHERE user_id = ?",
      [req.params.id]
    );

    res.json({ success: true, message: 'Order cancelled successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/products/list  — list products (for placing orders)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/products/list', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, description, price, stock FROM products ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
