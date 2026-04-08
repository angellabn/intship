const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend/public'));

// ── Database Connection ──────────────────────────────────────────────────────
const db = mysql.createConnection({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'product_management',
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    // process.exit(1);
  }
  console.log('✅ Connected to MySQL database');
});

// ── Helper ───────────────────────────────────────────────────────────────────
const query = (sql, params) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)))
  );

// ── ROUTES ───────────────────────────────────────────────────────────────────

// GET /api/categories — list all categories
app.get('/api/categories', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM categories ORDER BY category_name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products — list all products (with category name + optional filters)
app.get('/api/products', async (req, res) => {
  try {
    const { search, status, category_id } = req.query;
    let sql = `
      SELECT p.*, c.category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (p.product_name LIKE ? OR p.SKU LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status !== undefined && status !== '') {
      sql += ' AND p.status = ?';
      params.push(status === 'true' || status === '1' ? 1 : 0);
    }
    if (category_id) {
      sql += ' AND p.category_id = ?';
      params.push(category_id);
    }
    sql += ' ORDER BY p.created_at DESC';

    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id — get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const rows = await query(
      `SELECT p.*, c.category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE p.product_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products — add new product
app.post('/api/products', async (req, res) => {
  try {
    const { product_name, description, price, SKU, category_id, inventory_count, status } = req.body;

    if (!product_name || !price || !SKU) {
      return res.status(400).json({ error: 'product_name, price, and SKU are required' });
    }

    // Check SKU uniqueness
    const existing = await query('SELECT product_id FROM products WHERE SKU = ?', [SKU]);
    if (existing.length) return res.status(409).json({ error: 'SKU already exists' });

    const result = await query(
      `INSERT INTO products (product_name, description, price, SKU, category_id, inventory_count, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [product_name, description || '', price, SKU, category_id || null, inventory_count || 0, status !== false ? 1 : 0]
    );
    const newProduct = await query('SELECT * FROM products WHERE product_id = ?', [result.insertId]);
    res.status(201).json({ message: 'Product added successfully', product: newProduct[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id — update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { product_name, description, price, SKU, category_id, inventory_count, status } = req.body;
    const { id } = req.params;

    const exists = await query('SELECT product_id FROM products WHERE product_id = ?', [id]);
    if (!exists.length) return res.status(404).json({ error: 'Product not found' });

    // Check SKU uniqueness (exclude current product)
    if (SKU) {
      const skuCheck = await query('SELECT product_id FROM products WHERE SKU = ? AND product_id != ?', [SKU, id]);
      if (skuCheck.length) return res.status(409).json({ error: 'SKU already used by another product' });
    }

    await query(
      `UPDATE products SET
        product_name    = COALESCE(?, product_name),
        description     = COALESCE(?, description),
        price           = COALESCE(?, price),
        SKU             = COALESCE(?, SKU),
        category_id     = COALESCE(?, category_id),
        inventory_count = COALESCE(?, inventory_count),
        status          = COALESCE(?, status),
        updated_at      = CURRENT_TIMESTAMP
       WHERE product_id = ?`,
      [product_name, description, price, SKU, category_id, inventory_count,
       status !== undefined ? (status ? 1 : 0) : null, id]
    );

    const updated = await query('SELECT * FROM products WHERE product_id = ?', [id]);
    res.json({ message: 'Product updated successfully', product: updated[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/products/:id/status — toggle active/inactive (soft delete)
app.patch('/api/products/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const exists = await query('SELECT product_id FROM products WHERE product_id = ?', [id]);
    if (!exists.length) return res.status(404).json({ error: 'Product not found' });

    await query('UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?',
      [status ? 1 : 0, id]);

    res.json({ message: `Product ${status ? 'activated' : 'deactivated'} successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id — hard delete
app.delete('/api/products/:id', async (req, res) => {
  try {
    const exists = await query('SELECT product_id FROM products WHERE product_id = ?', [req.params.id]);
    if (!exists.length) return res.status(404).json({ error: 'Product not found' });

    await query('DELETE FROM products WHERE product_id = ?', [req.params.id]);
    res.json({ message: 'Product deleted permanently' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats — dashboard summary
app.get('/api/stats', async (req, res) => {
  try {
    const [total]    = await query('SELECT COUNT(*) AS count FROM products');
    const [active]   = await query('SELECT COUNT(*) AS count FROM products WHERE status = 1');
    const [inactive] = await query('SELECT COUNT(*) AS count FROM products WHERE status = 0');
    const [lowStock] = await query('SELECT COUNT(*) AS count FROM products WHERE inventory_count <= 5 AND status = 1');
    res.json({
      total:    total.count,
      active:   active.count,
      inactive: inactive.count,
      lowStock: lowStock.count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
