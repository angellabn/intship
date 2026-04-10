const express = require('express');
const bcrypt  = require('bcryptjs');
const db      = require('../db/connection');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const router  = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customers
// Admin: all customers | Customer: own profile only
// Query: ?search=rahul&status=active|inactive&page=1&limit=15
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Non-admin: return own profile
    if (!req.user.isAdmin) {
      const [rows] = await db.query(
        'SELECT user_id, first_name, last_name, email, phone, created_at, updated_at, status FROM users WHERE user_id = ?',
        [req.user.id]
      );
      return res.json({ success: true, data: rows });
    }

    const { search, status, page = 1, limit = 15 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conds  = [];
    const params = [];

    if (search) {
      conds.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (status === 'active')   { conds.push('status = TRUE');  }
    if (status === 'inactive') { conds.push('status = FALSE'); }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

    const [rows] = await db.query(
      `SELECT user_id, first_name, last_name, email, phone, created_at, updated_at, status
       FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM users ${where}`, params
    );

    res.json({
      success: true,
      data: rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), total_pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/customers/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Customers can only view themselves
    if (!req.user.isAdmin && req.user.id !== parseInt(req.params.id))
      return res.status(403).json({ success: false, message: 'Access denied.' });

    const [rows] = await db.query(
      'SELECT user_id, first_name, last_name, email, phone, created_at, updated_at, status FROM users WHERE user_id = ?',
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Customer not found.' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/customers  — admin manually adds a customer
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;
    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({ success: false, message: 'first_name, last_name, email, password required.' });

    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length)
      return res.status(409).json({ success: false, message: 'Email already exists.' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone || null, hashed]
    );

    res.status(201).json({ success: true, message: 'Customer added successfully.', user_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/customers/:id  — update customer details
// Admin can update anyone; customer can update only themselves (no status change)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const isOwn = req.user.id === parseInt(req.params.id);
    if (!req.user.isAdmin && !isOwn)
      return res.status(403).json({ success: false, message: 'Access denied.' });

    const [existing] = await db.query('SELECT * FROM users WHERE user_id = ?', [req.params.id]);
    if (!existing.length)
      return res.status(404).json({ success: false, message: 'Customer not found.' });

    const { first_name, last_name, email, phone, status } = req.body;

    // Customers cannot change their own status
    const newStatus = req.user.isAdmin && status !== undefined ? Boolean(status) : existing[0].status;

    await db.query(
      `UPDATE users SET
         first_name = COALESCE(?, first_name),
         last_name  = COALESCE(?, last_name),
         email      = COALESCE(?, email),
         phone      = COALESCE(?, phone),
         status     = ?
       WHERE user_id = ?`,
      [first_name || null, last_name || null, email || null, phone || null, newStatus, req.params.id]
    );

    res.json({ success: true, message: 'Customer updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/customers/:id  — soft deactivate (status = FALSE)
// Admin only
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [req.params.id]);
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Customer not found.' });

    if (!rows[0].status)
      return res.status(409).json({ success: false, message: 'Customer account is already inactive.' });

    await db.query('UPDATE users SET status = FALSE WHERE user_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Customer account deactivated (soft delete).' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/customers/:id/reactivate  — restore deactivated account
// Admin only
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/reactivate', authMiddleware, adminOnly, async (req, res) => {
  try {
    await db.query('UPDATE users SET status = TRUE WHERE user_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Customer account reactivated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
