// controllers/paymentController.js
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// Register payment (integration stub for MVP)
const registerPayment = async (req, res) => {
  try {
    const { 
      booking_id, 
      provider = 'Manual', 
      provider_payment_id, 
      amount, 
      status = 'pending' 
    } = req.body;
    
    // Validate required fields
    if (!booking_id || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and amount are required'
      });
    }
    
    // Check if booking exists
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns this booking (unless admin)
    if (booking.UserId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Create payment record
    const payment = await Payment.create({
      bookingId: booking_id,
      provider,
      providerPaymentId: provider_payment_id,
      amount: parseFloat(amount),
      status,
      paidAt: status === 'succeeded' ? new Date() : null
    });
    
    // If payment is successful, update booking status
    if (status === 'succeeded' && booking.Status === 'pending') {
      await Booking.updateStatus(booking_id, 'confirmed');
    }
    
    // Get payment with details
    const paymentDetails = await Payment.findById(payment.Id);
    
    res.status(201).json({
      success: true,
      message: 'Payment registered successfully',
      data: paymentDetails
    });
  } catch (error) {
    console.error('Register payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register payment',
      error: error.message
    });
  }
};

// Get payment by ID
const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if user owns this payment (unless admin)
    if (payment.UserId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      message: 'Payment retrieved successfully',
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment',
      error: error.message
    });
  }
};

// Get payments by booking ID
const getBookingPayments = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns this booking (unless admin)
    if (booking.UserId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const payments = await Payment.findByBookingId(bookingId);
    
    res.json({
      success: true,
      message: 'Booking payments retrieved successfully',
      data: payments
    });
  } catch (error) {
    console.error('Get booking payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking payments',
      error: error.message
    });
  }
};

// Update payment status (admin only)
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'succeeded', 'failed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }
    
    const paidAt = status === 'succeeded' ? new Date() : null;
    const updatedPayment = await Payment.updateStatus(id, status, paidAt);
    
    if (!updatedPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: updatedPayment
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

// Get all payments (admin)
const getAllPayments = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      provider: req.query.provider
    };
    
    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });
    
    const payments = await Payment.getAll(filters);
    
    res.json({
      success: true,
      message: 'Payments retrieved successfully',
      data: payments,
      filters
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payments',
      error: error.message
    });
  }
};

module.exports = {
  registerPayment,
  getPayment,
  getBookingPayments,
  updatePaymentStatus,
  getAllPayments
};