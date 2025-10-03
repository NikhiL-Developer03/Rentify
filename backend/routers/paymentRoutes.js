// routers/paymentRoutes.js
const express = require('express');
const {
  registerPayment,
  getPayment,
  getBookingPayments,
  updatePaymentStatus,
  getAllPayments
} = require('../controllers/paymentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All payment routes require authentication
router.use(authenticateToken);

// Payment routes
router.post('/', registerPayment);
router.get('/:id', getPayment);
router.get('/booking/:bookingId', getBookingPayments);

// Admin routes
router.get('/', requireAdmin, getAllPayments);
router.put('/:id/status', requireAdmin, updatePaymentStatus);

module.exports = router;