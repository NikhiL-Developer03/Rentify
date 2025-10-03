// routers/bookingRoutes.js
const express = require('express');
const {
  createBooking,
  getBookingById,
  getUserBookings,
  getMyBookings,
  cancelBooking,
  completeBooking
} = require('../controllers/bookingController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All booking routes require authentication
router.use(authenticateToken);

// Booking routes
router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/complete', requireAdmin, completeBooking);

module.exports = router;