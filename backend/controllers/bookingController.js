// controllers/bookingController.js
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const CarImage = require('../models/CarImage');
const Invoice = require('../models/Invoice');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { car_id, start_date, end_date, payment_method } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!car_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Car ID, start date, and end date are required'
      });
    }
    
    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }
    
    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }
    
    // Check if car exists and is available
    const car = await Car.findById(car_id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }
    
    if (!car.Available) {
      return res.status(400).json({
        success: false,
        message: 'Car is not available'
      });
    }
    
    // Check for booking conflicts
    const hasConflict = await Booking.hasConflict(car_id, start_date, end_date);
    if (hasConflict) {
      return res.status(400).json({
        success: false,
        message: 'Car is not available for the selected dates'
      });
    }
    
    // Calculate total amount
    const totalAmount = Booking.calculateTotalAmount(car.BasePricePerDay, start_date, end_date);
    
    // Create booking
    const booking = await Booking.create({
      userId,
      carId: car_id,
      startDate: start_date,
      endDate: end_date,
      totalAmount,
      status: 'pending'
    });
    
    // Get booking with details
    const bookingDetails = await Booking.findById(booking.Id);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking_id: booking.Id,
        status: booking.Status,
        total_amount: booking.TotalAmount,
        start_date: booking.StartDate,
        end_date: booking.EndDate,
        days: booking.Days,
        car: {
          id: car.Id,
          make: car.Make,
          model: car.Model,
          registration: car.RegistrationNumber
        },
        payment_method: payment_method || 'pending'
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
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
    
    res.json({
      success: true,
      message: 'Booking retrieved successfully',
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking',
      error: error.message
    });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is accessing their own bookings or is admin
    if (parseInt(id) !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const bookings = await Booking.getByUserId(id);
    
    // Transform the data structure for frontend compatibility
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      Car: {
        Id: booking.CarId,
        Make: booking.Make,
        Model: booking.Model,
        Year: booking.Year,
        RegistrationNumber: booking.RegistrationNumber,
        BasePricePerDay: booking.BasePricePerDay,
        City: booking.City,
        State: booking.State,
        images: booking.images || []
      }
    }));
    
    res.json({
      success: true,
      message: 'User bookings retrieved successfully',
      data: formattedBookings
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user bookings',
      error: error.message
    });
  }
};

// Get current user's bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.getByUserId(req.user.id);
    
    // Transform the data structure for frontend compatibility
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      Car: {
        Id: booking.CarId,
        Make: booking.Make,
        Model: booking.Model,
        Year: booking.Year,
        RegistrationNumber: booking.RegistrationNumber,
        BasePricePerDay: booking.BasePricePerDay,
        City: booking.City,
        State: booking.State,
        images: booking.images || []
      }
    }));
    
    res.json({
      success: true,
      message: 'Your bookings retrieved successfully',
      data: formattedBookings
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your bookings',
      error: error.message
    });
  }
};

// Cancel booking (user can cancel their own pending bookings)
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns this booking
    if (booking.UserId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Check if booking can be cancelled
    if (booking.Status === 'cancelled' || booking.Status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${booking.Status} booking`
      });
    }
    
    // Update booking status
    const updatedBooking = await Booking.updateStatus(id, 'cancelled');
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

// Complete booking (admin only)
const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if booking can be completed
    if (booking.Status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete cancelled booking'
      });
    }
    
    if (booking.Status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already completed'
      });
    }
    
    // Update booking status
    const updatedBooking = await Booking.updateStatus(id, 'completed');
    
    // Automatically generate invoice for the completed booking
    try {
      // Import Invoice model
      const Invoice = require('../models/Invoice');
      
      // Check if invoice already exists for this booking
      const existingInvoice = await Invoice.findByBookingId(id);
      
      if (!existingInvoice) {
        // Generate invoice number
        const cityCode = booking.City ? booking.City.substring(0, 3).toUpperCase() : 'GEN';
        const invoiceNumber = await Invoice.generateInvoiceNumber(cityCode);
        
        // Calculate tax (18% GST)
        const taxRate = 0.18;
        const tax = booking.TotalAmount * taxRate;
        const totalWithTax = booking.TotalAmount + tax;
        
        // Create invoice
        await Invoice.create({
          bookingId: parseInt(id),
          invoiceNumber,
          amount: totalWithTax,
          tax: tax,
          pdfPath: `/uploads/invoices/${invoiceNumber}.pdf`
        });
        
        // Invoice successfully generated
      } else {
        // Invoice already exists for this booking
      }
    } catch (invoiceError) {
      // Don't fail the booking completion if invoice generation fails
      console.error('Error generating invoice:', invoiceError);
    }
    
    res.json({
      success: true,
      message: 'Booking completed successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete booking',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  getUserBookings,
  getMyBookings,
  cancelBooking,
  completeBooking
};