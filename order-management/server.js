require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const authRoutes   = require('./routes/auth');
const orderRoutes  = require('./routes/orders');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/orders', orderRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Order Management Module is running.' });
});

// ── Serve frontend for all other routes (SPA) ────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Order Management Module running at http://localhost:${PORT}`);
  console.log(`📦  API base: http://localhost:${PORT}/api`);
  console.log(`🔑  Login:    POST /api/auth/login\n`);
});
