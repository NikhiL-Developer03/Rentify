// routers/carRoutes.js
const express = require('express');
const { getCars, getCarById, checkAvailability } = require('../controllers/carController');
const { getCarReviews } = require('../controllers/reviewController');

const router = express.Router();

// Public routes
router.get('/', getCars);
router.get('/:id', getCarById);
router.get('/:id/availability', checkAvailability);
router.get('/:id/reviews', getCarReviews);

module.exports = router;