// controllers/carController.js
const Car = require('../models/Car');
const CarImage = require('../models/CarImage');
const path = require('path');

// Get cars with filters (public endpoint)
const getCars = async (req, res) => {
  try {
    const filters = {
      city: req.query.city,
      category: req.query.category,
      minPrice: req.query.min_price ? parseFloat(req.query.min_price) : null,
      maxPrice: req.query.max_price ? parseFloat(req.query.max_price) : null,
      startDate: req.query.start_date,
      endDate: req.query.end_date
    };

    // Remove null/undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === null || filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    const cars = await Car.search(filters);
    
    // Get images for each car
    const carsWithImages = await Promise.all(
      cars.map(async (car) => {
        const images = await CarImage.getByCarId(car.Id);
        return {
          ...car,
          images: images.map(img => ({
            id: img.Id,
            url: `/uploads/cars/${path.basename(img.FilePath)}`,
            altText: img.AltText
          }))
        };
      })
    );

    res.json({
      success: true,
      message: 'Cars retrieved successfully',
      data: carsWithImages,
      filters: filters
    });
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cars',
      error: error.message
    });
  }
};

// Get car by ID (public endpoint)
const getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);
    
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Get car images
    const images = await CarImage.getByCarId(car.Id);
    
    res.json({
      success: true,
      message: 'Car retrieved successfully',
      data: {
        ...car,
        images: images.map(img => ({
          id: img.Id,
          url: `/uploads/cars/${path.basename(img.FilePath)}`,
          altText: img.AltText
        }))
      }
    });
  } catch (error) {
    console.error('Get car by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve car',
      error: error.message
    });
  }
};

// Check car availability (public endpoint)
const checkAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const isAvailable = await Car.checkAvailability(id, start_date, end_date);
    
    res.json({
      success: true,
      message: 'Availability checked',
      data: {
        carId: id,
        startDate: start_date,
        endDate: end_date,
        available: isAvailable
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
};

module.exports = {
  getCars,
  getCarById,
  checkAvailability
};