const db = require('../config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// ── GET /api/payments ──────────────────────────────────────────────────────
const getAllPayments = async (req, res) => {
  try {
    const { status, method, from, to, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let where = [];
    let params = [];

    if (status)  { where.push('p.payment_status = ?');  params.push(status); }
    if (method)  { where.push('p.payment_method = ?');  params.push(method); }
    if (from)    { where.push('p.created_at >= ?');     params.push(from); }
    if (to)      { where.push('p.created_at <= ?');     params.push(to + ' 23:59:59'); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [rows] = await db.query(
      `SELECT p.*, o.customer_name, o.customer_email
       FROM payments p
       JOIN orders o ON p.order_id = o.order_id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM payments p ${whereClause}`,
      params
    );

    res.json({ payments: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// ── GET /api/payments/:id ──────────────────────────────────────────────────
const getPaymentById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, o.customer_name, o.customer_email, o.order_status
       FROM payments p
       JOIN orders o ON p.order_id = o.order_id
       WHERE p.payment_id = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Payment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
};

// ── GET /api/payments/order/:orderId ──────────────────────────────────────
const getPaymentsByOrder = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC',
      [req.params.orderId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments for order' });
  }
};

// ── POST /api/payments/process ─────────────────────────────────────────────
const processPayment = async (req, res) => {
  const { order_id, amount, payment_method, card_token } = req.body;

  if (!order_id || !amount || !payment_method) {
    return res.status(400).json({ error: 'order_id, amount, and payment_method are required' });
  }

  // Verify order exists
  const [orders] = await db.query('SELECT * FROM orders WHERE order_id = ?', [order_id]);
  if (!orders.length) return res.status(404).json({ error: 'Order not found' });

  let transaction_ref = null;
  let payment_status = 'Paid';

  try {
    // Attempt Stripe charge (if card token provided and Stripe key is real)
    if (payment_method === 'Credit Card' && card_token && process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
      const charge = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // cents
        currency: 'usd',
        payment_method: card_token,
        confirm: true,
        metadata: { order_id: String(order_id) },
      });
      transaction_ref = charge.id;
      payment_status = charge.status === 'succeeded' ? 'Paid' : 'Failed';
    } else {
      // Mock transaction reference for demo / non-Stripe methods
      transaction_ref = `${payment_method.substring(0,2).toUpperCase()}_${Date.now()}`;
    }

    const [result] = await db.query(
      `INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_ref)
       VALUES (?, ?, ?, ?, ?)`,
      [order_id, amount, payment_method, payment_status, transaction_ref]
    );

    // Update order status
    await db.query("UPDATE orders SET order_status = 'Completed' WHERE order_id = ?", [order_id]);

    res.status(201).json({
      payment_id: result.insertId,
      status: payment_status,
      transaction_ref,
      message: `Payment ${payment_status.toLowerCase()} successfully`,
    });
  } catch (err) {
    // Log failed payment
    await db.query(
      `INSERT INTO payments (order_id, amount, payment_method, payment_status)
       VALUES (?, ?, ?, 'Failed')`,
      [order_id, amount, payment_method]
    );
    console.error(err);
    res.status(402).json({ error: 'Payment failed', detail: err.message });
  }
};

// ── POST /api/payments/:id/refund ──────────────────────────────────────────
const refundPayment = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, o.order_status FROM payments p
       JOIN orders o ON p.order_id = o.order_id
       WHERE p.payment_id = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Payment not found' });

    const payment = rows[0];

    if (payment.payment_status === 'Refunded') {
      return res.status(409).json({ error: 'Payment has already been refunded' });
    }

    if (payment.payment_status !== 'Paid') {
      return res.status(422).json({ error: 'Only paid transactions can be refunded' });
    }

    if (!['Cancelled', 'Returned'].includes(payment.order_status)) {
      return res.status(422).json({ error: 'Order must be Cancelled or Returned to issue a refund' });
    }

    // Attempt Stripe refund if real key
    if (payment.transaction_ref && payment.transaction_ref.startsWith('pi_') &&
        process.env.STRIPE_SECRET_KEY !== 'sk_test_placeholder') {
      await stripe.refunds.create({ payment_intent: payment.transaction_ref });
    }

    await db.query(
      "UPDATE payments SET payment_status = 'Refunded' WHERE payment_id = ?",
      [req.params.id]
    );

    res.json({ message: 'Refund issued successfully', payment_id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Refund failed', detail: err.message });
  }
};

// ── GET /api/payments/stats ────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [[totals]] = await db.query(`
      SELECT
        COUNT(*) as total_transactions,
        SUM(CASE WHEN payment_status = 'Paid'     THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN payment_status = 'Refunded' THEN amount ELSE 0 END) as total_refunded,
        SUM(CASE WHEN payment_status = 'Failed'   THEN 1     ELSE 0 END) as failed_count
      FROM payments
    `);

    const [byMethod] = await db.query(`
      SELECT payment_method, COUNT(*) as count, SUM(amount) as total
      FROM payments WHERE payment_status = 'Paid'
      GROUP BY payment_method
    `);

    res.json({ ...totals, by_method: byMethod });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  getPaymentsByOrder,
  processPayment,
  refundPayment,
  getStats,
};
