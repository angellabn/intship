require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const authRoutes     = require('./routes/auth');
const customerRoutes = require('./routes/customers');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth',      authRoutes);
app.use('/api/customers', customerRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'OK', module: 'Customer Management' }));

app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n🚀  Customer Management Module → http://localhost:${PORT}`);
});
