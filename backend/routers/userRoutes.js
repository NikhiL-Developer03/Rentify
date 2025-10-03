// routers/userRoutes.js
const express = require('express');
const { getUserBookings } = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// User-specific routes
router.get('/:id/bookings', authenticateToken, getUserBookings);

module.exports = router;