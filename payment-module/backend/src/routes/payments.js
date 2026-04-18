const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllPayments,
  getPaymentById,
  getPaymentsByOrder,
  processPayment,
  refundPayment,
  getStats,
} = require('../controllers/paymentController');

// Public (or user-level) routes
router.post('/process', processPayment);

// Admin-protected routes
router.get('/',                  auth, getAllPayments);
router.get('/stats',             auth, getStats);
router.get('/order/:orderId',    auth, getPaymentsByOrder);
router.get('/:id',               auth, getPaymentById);
router.post('/:id/refund',       auth, refundPayment);

module.exports = router;
