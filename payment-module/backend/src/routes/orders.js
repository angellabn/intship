const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { customer_name, customer_email, total_amount } = req.body;
  if (!customer_name || !customer_email || !total_amount)
    return res.status(400).json({ error: 'All fields required' });

  const [result] = await db.query(
    'INSERT INTO orders (customer_name, customer_email, total_amount) VALUES (?,?,?)',
    [customer_name, customer_email, total_amount]
  );
  res.status(201).json({ order_id: result.insertId, message: 'Order created' });
});

// Admin can update order status (to Cancelled/Returned to allow refund)
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const allowed = ['Pending', 'Completed', 'Cancelled', 'Returned'];
  if (!allowed.includes(status))
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });

  await db.query('UPDATE orders SET order_status = ? WHERE order_id = ?', [status, req.params.id]);
  res.json({ message: 'Order status updated' });
});

module.exports = router;
