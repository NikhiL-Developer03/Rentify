// routers/reviewRoutes.js
const express = require('express');
const {
  createReview,
  getCarReviews,
  getAllReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/car/:carId', getCarReviews);

// Protected routes
router.post('/:bookingId', authenticateToken, createReview);
router.put('/:id', authenticateToken, updateReview);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllReviews);
router.delete('/:id', authenticateToken, requireAdmin, deleteReview);

module.exports = router;