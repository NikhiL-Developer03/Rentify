// routers/locationRoutes.js
const express = require('express');
const Location = require('../models/Location');

const router = express.Router();

// Get all locations (public endpoint)
const getLocations = async (req, res) => {
  try {
    const locations = await Location.getAll();
    
    res.json({
      success: true,
      message: 'Locations retrieved successfully',
      data: locations
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve locations',
      error: error.message
    });
  }
};

router.get('/', getLocations);

module.exports = router;