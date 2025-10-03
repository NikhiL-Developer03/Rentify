// controllers/reviewController.js
const Review = require('../models/Review');
const Booking = require('../models/Booking');

// Create a review for a booking
const createReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    if (booking.UserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own bookings'
      });
    }
    
    // Check if booking is completed
    if (booking.Status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed bookings'
      });
    }
    
    // Check if review already exists
    const existingReview = await Review.findByBookingId(bookingId);
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }
    
    // Create review
    const review = await Review.create({
      bookingId: parseInt(bookingId),
      rating: parseInt(rating),
      comment: comment || ''
    });
    
    // Get review with details
    const reviewDetails = await Review.findById(review.Id);
    
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: reviewDetails
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
};

// Get reviews for a car
const getCarReviews = async (req, res) => {
  try {
    const { carId } = req.params;
    
    const reviews = await Review.getByCarId(carId);
    const stats = await Review.getCarRatingStats(carId);
    
    res.json({
      success: true,
      message: 'Car reviews retrieved successfully',
      data: {
        reviews,
        statistics: {
          totalReviews: stats.TotalReviews || 0,
          averageRating: parseFloat(stats.AverageRating) || 0,
          ratingDistribution: {
            5: stats.FiveStars || 0,
            4: stats.FourStars || 0,
            3: stats.ThreeStars || 0,
            2: stats.TwoStars || 0,
            1: stats.OneStar || 0
          }
        }
      }
    });
  } catch (error) {
    console.error('Get car reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve car reviews',
      error: error.message
    });
  }
};

// Get all reviews (admin)
const getAllReviews = async (req, res) => {
  try {
    const filters = {
      carId: req.query.car_id,
      rating: req.query.rating,
      city: req.query.city
    };
    
    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });
    
    const reviews = await Review.getAll(filters);
    
    res.json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: reviews,
      filters
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews',
      error: error.message
    });
  }
};

// Update review (user can update their own review)
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Get review details to check ownership
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if booking belongs to user (unless admin)
    const booking = await Booking.findById(review.BookingId);
    if (booking.UserId !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }
    
    // Update review
    const updatedReview = await Review.update(id, {
      rating: rating || review.Rating,
      comment: comment !== undefined ? comment : review.Comment
    });
    
    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

// Delete review (admin only)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Review.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

module.exports = {
  createReview,
  getCarReviews,
  getAllReviews,
  updateReview,
  deleteReview
};