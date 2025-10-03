// controllers/adminController.js
const Car = require('../models/Car');
const CarImage = require('../models/CarImage');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Location = require('../models/Location');
const MaintenanceHistory = require('../models/MaintenanceHistory');
const { sql, poolPromise } = require('../config/db');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

// Car Management
const createCar = async (req, res) => {
  try {
    const {
      registration_number,
      make,
      model,
      year,
      category,
      seats,
      transmission,
      fuel_type,
      base_price_per_day,
      location_id
    } = req.body;
    
    // Validate required fields
    if (!registration_number || !make || !model || !year || !base_price_per_day || !location_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if location exists
    const location = await Location.findById(location_id);
    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location ID'
      });
    }
    
    const car = await Car.create({
      registrationNumber: registration_number,
      make,
      model,
      year: parseInt(year),
      category,
      seats: parseInt(seats),
      transmission,
      fuelType: fuel_type,
      basePricePerDay: parseFloat(base_price_per_day),
      locationId: location_id
    });
    
    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: car
    });
  } catch (error) {
    console.error('Create car error:', error);
    
    if (error.message.includes('UNIQUE KEY constraint')) {
      return res.status(400).json({
        success: false,
        message: 'Registration number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create car',
      error: error.message
    });
  }
};

const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }
    
    // Convert field names
    const carUpdates = {
      registrationNumber: updates.registration_number || car.RegistrationNumber,
      make: updates.make || car.Make,
      model: updates.model || car.Model,
      year: updates.year ? parseInt(updates.year) : car.Year,
      category: updates.category || car.Category,
      seats: updates.seats ? parseInt(updates.seats) : car.Seats,
      transmission: updates.transmission || car.Transmission,
      fuelType: updates.fuel_type || car.FuelType,
      basePricePerDay: updates.base_price_per_day ? parseFloat(updates.base_price_per_day) : car.BasePricePerDay,
      locationId: updates.location_id || car.LocationId,
      available: updates.available !== undefined ? updates.available : car.Available
    };
    
    const updatedCar = await Car.update(id, carUpdates);
    
    res.json({
      success: true,
      message: 'Car updated successfully',
      data: updatedCar
    });
  } catch (error) {
    console.error('Update car error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update car',
      error: error.message
    });
  }
};

const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if car has active bookings
    const activeBookings = await Booking.getAll({ carId: id });
    const hasActiveBookings = activeBookings.some(booking => 
      booking.Status === 'pending' || booking.Status === 'confirmed'
    );
    
    if (hasActiveBookings) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete car with active bookings'
      });
    }
    
    // Delete car images from filesystem
    const images = await CarImage.getByCarId(id);
    for (const image of images) {
      try {
        const imagePath = path.join(__dirname, '..', image.FilePath);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.error('Error deleting image file:', err);
      }
    }
    
    const deleted = await Car.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Car deleted successfully'
    });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete car',
      error: error.message
    });
  }
};

const getAllCars = async (req, res) => {
  try {
    const cars = await Car.getAll();
    
    res.json({
      success: true,
      message: 'Cars retrieved successfully',
      data: cars
    });
  } catch (error) {
    console.error('Get all cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cars',
      error: error.message
    });
  }
};

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
    
    res.json({
      success: true,
      message: 'Car retrieved successfully',
      data: car
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

// Car Image Management
const uploadCarImages = async (req, res) => {
  try {
    const { carId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }
    
    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }
    
    const uploadedImages = [];
    
    for (const file of req.files) {
      const imageData = {
        carId: parseInt(carId),
        filePath: `/uploads/cars/${file.filename}`,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        altText: `${car.Make} ${car.Model} - ${file.originalname}`
      };
      
      const image = await CarImage.create(imageData);
      uploadedImages.push({
        id: image.Id,
        url: imageData.filePath,
        fileName: imageData.fileName,
        altText: imageData.altText
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Images uploaded successfully',
      data: uploadedImages
    });
  } catch (error) {
    console.error('Upload car images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

// Booking Management
const getAllBookings = async (req, res) => {
  try {
    const filters = {
      city: req.query.city,
      status: req.query.status,
      userId: req.query.user_id
    };
    
    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });
    
    const bookings = await Booking.getAll(filters);
    
    res.json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
      filters
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      error: error.message
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }
    
    const updatedBooking = await Booking.updateStatus(id, status);
    
    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// User Management
const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
};

// Activate a user
const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if already active
    if (user.IsActive) {
      return res.status(400).json({
        success: false,
        message: 'User is already active'
      });
    }
    
    // Activate user
    const activatedUser = await User.activateUser(id);
    
    res.json({
      success: true,
      message: 'User activated successfully',
      data: activatedUser
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: error.message
    });
  }
};

// Deactivate a user
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if already inactive
    if (!user.IsActive) {
      return res.status(400).json({
        success: false,
        message: 'User is already inactive'
      });
    }
    
    // Deactivate user
    const deactivatedUser = await User.deactivateUser(id);
    
    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: deactivatedUser
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
      error: error.message
    });
  }
};

const toggleUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;
    
    // Check if user exists
    const existingUser = await User.findById(parseInt(id));
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from removing their own admin status
    if (parseInt(id) === req.user.id && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin privileges'
      });
    }
    
    let updatedUser;
    if (isAdmin) {
      updatedUser = await User.makeAdmin(parseInt(id));
    } else {
      // Remove admin status by updating IsAdmin to false
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, parseInt(id))
        .query(`
          UPDATE dbo.Users 
          SET IsAdmin = 0, UpdatedAt = GETDATE()
          OUTPUT INSERTED.*
          WHERE Id = @id
        `);
      updatedUser = result.recordset[0];
    }
    
    // Remove password hash from response
    const { PasswordHash, ...userWithoutPassword } = updatedUser;
    
    res.json({
      success: true,
      message: `User ${isAdmin ? 'promoted to admin' : 'removed from admin'} successfully`,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Toggle user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await User.findById(parseInt(id));
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    // Check if user has active bookings
    const pool = await poolPromise;
    const bookingCheck = await pool.request()
      .input('userId', sql.Int, parseInt(id))
      .query(`
        SELECT COUNT(*) as activeBookings 
        FROM dbo.Bookings 
        WHERE UserId = @userId AND Status IN ('confirmed', 'ongoing')
      `);
    
    if (bookingCheck.recordset[0].activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active bookings. Please cancel or complete their bookings first.'
      });
    }
    
    // Delete the user
    const deleted = await User.delete(parseInt(id));
    
    if (deleted) {
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// Location Management
const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.getAll();
    
    res.json({
      success: true,
      message: 'Locations retrieved successfully',
      data: locations
    });
  } catch (error) {
    console.error('Get all locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve locations',
      error: error.message
    });
  }
};

const createLocation = async (req, res) => {
  try {
    const { city, state, pincode, address } = req.body;
    
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City is required'
      });
    }
    
    const location = await Location.create({
      city,
      state,
      pincode,
      address
    });
    
    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: location
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create location',
      error: error.message
    });
  }
};

// Delete car image
const deleteCarImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    // Get image details
    const image = await CarImage.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Delete image file from filesystem
    try {
      const imagePath = path.join(__dirname, '..', image.FilePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (err) {
      console.error('Error deleting image file:', err);
    }
    
    // Delete image record from database
    const deleted = await CarImage.delete(imageId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Car image deleted successfully'
    });
  } catch (error) {
    console.error('Delete car image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete car image',
      error: error.message
    });
  }
};

// Maintenance Management
const addMaintenance = async (req, res) => {
  try {
    const { 
      car_id, 
      maintenance_type,  // Will map to 'type' in database
      description, 
      cost
    } = req.body;
    const recordedBy = req.user.id;
    
    // Validate required fields
    if (!car_id || !maintenance_type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Car ID, maintenance type, and description are required'
      });
    }
    
    // Check if car exists
    const car = await Car.findById(car_id);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }
    
    // Create maintenance record
    const maintenance = await MaintenanceHistory.create({
      carId: car_id,
      recordedBy,
      type: maintenance_type,  // Using 'type' to match database
      description,
      cost: cost ? parseFloat(cost) : 0
    });
    
    res.status(201).json({
      success: true,
      message: 'Maintenance record added successfully',
      data: maintenance
    });
  } catch (error) {
    console.error('Add maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add maintenance record',
      error: error.message
    });
  }
};

const getCarMaintenance = async (req, res) => {
  try {
    const { carId } = req.params;
    
    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }
    
    const maintenance = await MaintenanceHistory.getByCarId(carId);
    
    res.json({
      success: true,
      message: 'Car maintenance history retrieved successfully',
      data: maintenance
    });
  } catch (error) {
    console.error('Get car maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve car maintenance history',
      error: error.message
    });
  }
};

const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      maintenance_type,  // Will map to 'type' in database 
      description, 
      cost
    } = req.body;
    
    // Validate required fields
    if (!maintenance_type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Maintenance type and description are required'
      });
    }
    
    const maintenance = await MaintenanceHistory.update(id, {
      type: maintenance_type,  // Using 'type' to match database
      description,
      cost: cost ? parseFloat(cost) : 0
    });
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: maintenance
    });
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update maintenance record',
      error: error.message
    });
  }
};

const deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await MaintenanceHistory.delete(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Maintenance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete maintenance record',
      error: error.message
    });
  }
};

// Comprehensive Reports with Date Range Support
const getBookingsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date parameters are required'
      });
    }

    const pool = await poolPromise;
    
    // Get monthly bookings aggregation
    const monthlyBookingsResult = await pool.request()
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query(`
        SELECT 
          MONTH(CreatedAt) as month,
          YEAR(CreatedAt) as year,
          COUNT(*) as bookings,
          COUNT(CASE WHEN Status = 'completed' THEN 1 END) as completedBookings,
          COUNT(CASE WHEN Status = 'cancelled' THEN 1 END) as cancelledBookings,
          COUNT(CASE WHEN Status = 'pending' THEN 1 END) as pendingBookings
        FROM dbo.Bookings 
        WHERE CAST(CreatedAt AS DATE) >= @startDate AND CAST(CreatedAt AS DATE) <= @endDate
        GROUP BY YEAR(CreatedAt), MONTH(CreatedAt)
        ORDER BY YEAR(CreatedAt), MONTH(CreatedAt)
      `);

    // Get car category statistics
    const carCategoryResult = await pool.request()
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query(`
        SELECT 
          c.Category as category,
          COUNT(DISTINCT c.Id) as totalCars,
          COUNT(b.Id) as totalBookings,
          SUM(CASE WHEN b.Status = 'completed' THEN b.TotalAmount ELSE 0 END) as totalRevenue,
          CASE 
            WHEN COUNT(DISTINCT c.Id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN b.Status IN ('confirmed', 'completed') THEN c.Id END) * 100.0 / COUNT(DISTINCT c.Id))
            ELSE 0 
          END as utilization
        FROM dbo.Cars c
        LEFT JOIN dbo.Bookings b ON c.Id = b.CarId 
          AND CAST(b.CreatedAt AS DATE) >= @startDate AND CAST(b.CreatedAt AS DATE) <= @endDate
        GROUP BY c.Category
        ORDER BY SUM(CASE WHEN b.Status = 'completed' THEN b.TotalAmount ELSE 0 END) DESC
      `);

    // Get user statistics
    const userStatsResult = await pool.request()
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query(`
        SELECT 
          (SELECT COUNT(*) FROM dbo.Users) as totalUsers,
          (SELECT COUNT(*) FROM dbo.Users WHERE CAST(CreatedAt AS DATE) >= @startDate AND CAST(CreatedAt AS DATE) <= @endDate) as newUsers,
          (SELECT COUNT(DISTINCT UserId) FROM dbo.Bookings WHERE CAST(CreatedAt AS DATE) >= @startDate AND CAST(CreatedAt AS DATE) <= @endDate) as activeUsers
      `);

    // Get booking statistics
    const bookingStatsResult = await pool.request()
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query(`
        SELECT 
          COUNT(*) as totalBookings,
          COUNT(CASE WHEN Status = 'completed' THEN 1 END) as completedBookings,
          COUNT(CASE WHEN Status = 'cancelled' THEN 1 END) as cancelledBookings,
          COUNT(CASE WHEN Status = 'pending' THEN 1 END) as pendingBookings,
          COUNT(CASE WHEN Status = 'confirmed' THEN 1 END) as confirmedBookings,
          AVG(DATEDIFF(day, StartDate, EndDate)) as avgRentalDays
        FROM dbo.Bookings 
        WHERE CAST(CreatedAt AS DATE) >= @startDate AND CAST(CreatedAt AS DATE) <= @endDate
      `);

    res.json({
      success: true,
      message: 'Bookings report retrieved successfully',
      data: {
        period: { startDate, endDate },
        monthlyBookings: monthlyBookingsResult.recordset || [],
        carCategoryStats: carCategoryResult.recordset || [],
        userStats: userStatsResult.recordset[0] || {},
        bookingStats: bookingStatsResult.recordset[0] || {}
      }
    });
  } catch (error) {
    console.error('Get bookings report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings report',
      error: error.message
    });
  }
};

const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date parameters are required'
      });
    }

    const pool = await poolPromise;
    
    // Get monthly revenue data
    const monthlyRevenueResult = await pool.request()
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query(`
        SELECT 
          MONTH(CreatedAt) as month,
          YEAR(CreatedAt) as year,
          SUM(CASE WHEN Status = 'completed' THEN TotalAmount ELSE 0 END) as revenue,
          COUNT(CASE WHEN Status = 'completed' THEN 1 END) as completedBookings,
          AVG(CASE WHEN Status = 'completed' THEN TotalAmount ELSE NULL END) as avgRevenue
        FROM dbo.Bookings 
        WHERE CAST(CreatedAt AS DATE) >= @startDate AND CAST(CreatedAt AS DATE) <= @endDate
        GROUP BY YEAR(CreatedAt), MONTH(CreatedAt)
        ORDER BY YEAR(CreatedAt), MONTH(CreatedAt)
      `);

    // Get city-wise statistics with growth calculation
    const cityWiseResult = await pool.request()
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query(`
        WITH CurrentPeriod AS (
          SELECT 
            l.City as city,
            COUNT(*) as totalBookings,
            SUM(CASE WHEN b.Status = 'completed' THEN b.TotalAmount ELSE 0 END) as totalRevenue,
            AVG(CASE WHEN b.Status = 'completed' THEN b.TotalAmount ELSE NULL END) as avgBookingValue
          FROM dbo.Bookings b
          INNER JOIN dbo.Cars c ON b.CarId = c.Id
          INNER JOIN dbo.Locations l ON c.LocationId = l.Id
          WHERE CAST(b.CreatedAt AS DATE) >= @startDate AND CAST(b.CreatedAt AS DATE) <= @endDate
          GROUP BY l.City
        ),
        PreviousPeriod AS (
          SELECT 
            l.City as city,
            SUM(CASE WHEN b.Status = 'completed' THEN b.TotalAmount ELSE 0 END) as prevRevenue
          FROM dbo.Bookings b
          INNER JOIN dbo.Cars c ON b.CarId = c.Id
          INNER JOIN dbo.Locations l ON c.LocationId = l.Id
          WHERE CAST(b.CreatedAt AS DATE) >= DATEADD(day, -DATEDIFF(day, @startDate, @endDate), @startDate) 
            AND CAST(b.CreatedAt AS DATE) < @startDate
          GROUP BY l.City
        )
        SELECT 
          cp.city,
          cp.totalBookings,
          cp.totalRevenue,
          ISNULL(cp.avgBookingValue, 0) as avgBookingValue,
          CASE 
            WHEN pp.prevRevenue > 0 AND cp.totalRevenue > 0 
            THEN ((cp.totalRevenue - pp.prevRevenue) / pp.prevRevenue) * 100
            ELSE 0 
          END as growth
        FROM CurrentPeriod cp
        LEFT JOIN PreviousPeriod pp ON cp.city = pp.city
        ORDER BY cp.totalRevenue DESC
      `);

    // Get overall revenue statistics with growth
    const revenueStatsResult = await pool.request()
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query(`
        WITH CurrentPeriod AS (
          SELECT 
            SUM(CASE WHEN Status = 'completed' THEN TotalAmount ELSE 0 END) as totalRevenue,
            AVG(CASE WHEN Status = 'completed' THEN TotalAmount ELSE NULL END) as avgBookingValue,
            COUNT(CASE WHEN Status = 'completed' THEN 1 END) as completedBookings
          FROM dbo.Bookings 
          WHERE CAST(CreatedAt AS DATE) >= @startDate AND CAST(CreatedAt AS DATE) <= @endDate
        ),
        PreviousPeriod AS (
          SELECT 
            SUM(CASE WHEN Status = 'completed' THEN TotalAmount ELSE 0 END) as prevRevenue
          FROM dbo.Bookings 
          WHERE CAST(CreatedAt AS DATE) >= DATEADD(day, -DATEDIFF(day, @startDate, @endDate), @startDate) 
            AND CAST(CreatedAt AS DATE) < @startDate
        )
        SELECT 
          cp.totalRevenue,
          cp.avgBookingValue,
          cp.completedBookings,
          CASE 
            WHEN pp.prevRevenue > 0 AND cp.totalRevenue > 0 
            THEN ((cp.totalRevenue - pp.prevRevenue) / pp.prevRevenue) * 100
            ELSE 0 
          END as growthPercentage
        FROM CurrentPeriod cp
        CROSS JOIN PreviousPeriod pp
      `);

    res.json({
      success: true,
      message: 'Revenue report retrieved successfully',
      data: {
        period: { startDate, endDate },
        monthlyRevenue: monthlyRevenueResult.recordset || [],
        cityWiseStats: cityWiseResult.recordset || [],
        revenueStats: revenueStatsResult.recordset[0] || {}
      }
    });
  } catch (error) {
    console.error('Get revenue report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve revenue report',
      error: error.message
    });
  }
};

// Excel Export Functions
const exportBookingsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date parameters are required'
      });
    }

    const pool = await poolPromise;
    
    // Get detailed bookings data for export
    const bookingsResult = await pool.request()
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query(`
        SELECT 
          b.Id as BookingId,
          'BK-' + CAST(b.Id as VARCHAR) as BookingReference,
          u.Name as CustomerName,
          u.Email as CustomerEmail,
          c.Make + ' ' + c.Model as CarDetails,
          c.RegistrationNumber,
          l.City,
          b.StartDate,
          b.EndDate,
          DATEDIFF(day, b.StartDate, b.EndDate) as RentalDays,
          b.TotalAmount,
          b.Status,
          b.CreatedAt
        FROM dbo.Bookings b
        INNER JOIN dbo.Users u ON b.UserId = u.Id
        INNER JOIN dbo.Cars c ON b.CarId = c.Id
        INNER JOIN dbo.Locations l ON c.LocationId = l.Id
  WHERE CAST(b.CreatedAt AS DATE) >= @startDate AND CAST(b.CreatedAt AS DATE) <= @endDate
        ORDER BY b.CreatedAt DESC
      `);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bookings Report');

    // Add headers
    worksheet.columns = [
      { header: 'Booking ID', key: 'BookingId', width: 15 },
      { header: 'Booking Reference', key: 'BookingReference', width: 20 },
      { header: 'Customer Name', key: 'CustomerName', width: 25 },
      { header: 'Customer Email', key: 'CustomerEmail', width: 30 },
      { header: 'Car Details', key: 'CarDetails', width: 25 },
      { header: 'Registration Number', key: 'RegistrationNumber', width: 20 },
      { header: 'City', key: 'City', width: 15 },
      { header: 'Start Date', key: 'StartDate', width: 15 },
      { header: 'End Date', key: 'EndDate', width: 15 },
      { header: 'Rental Days', key: 'RentalDays', width: 12 },
      { header: 'Total Amount', key: 'TotalAmount', width: 15 },
      { header: 'Status', key: 'Status', width: 12 },
      { header: 'Created At', key: 'CreatedAt', width: 20 }
    ];

    // Add data
    bookingsResult.recordset.forEach(booking => {
      worksheet.addRow({
        ...booking,
        StartDate: booking.StartDate ? booking.StartDate.toISOString().split('T')[0] : '',
        EndDate: booking.EndDate ? booking.EndDate.toISOString().split('T')[0] : '',
        CreatedAt: booking.CreatedAt ? booking.CreatedAt.toISOString() : ''
      });
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F3FF' }
    };

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=bookings-report-${startDate}-to-${endDate}.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export bookings report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export bookings report',
      error: error.message
    });
  }
};

const exportRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date parameters are required'
      });
    }

    const pool = await poolPromise;
    
    // Get detailed revenue data for export
    const revenueResult = await pool.request()
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query(`
        SELECT 
          YEAR(b.CreatedAt) as Year,
          MONTH(b.CreatedAt) as Month,
          l.City,
          c.Category,
          COUNT(*) as TotalBookings,
          COUNT(CASE WHEN b.Status = 'completed' THEN 1 END) as CompletedBookings,
          SUM(CASE WHEN b.Status = 'completed' THEN b.TotalAmount ELSE 0 END) as TotalRevenue,
          AVG(CASE WHEN b.Status = 'completed' THEN b.TotalAmount ELSE NULL END) as AvgBookingValue
        FROM dbo.Bookings b
        INNER JOIN dbo.Cars c ON b.CarId = c.Id
        INNER JOIN dbo.Locations l ON c.LocationId = l.Id
  WHERE CAST(b.CreatedAt AS DATE) >= @startDate AND CAST(b.CreatedAt AS DATE) <= @endDate
        GROUP BY YEAR(b.CreatedAt), MONTH(b.CreatedAt), l.City, c.Category
        ORDER BY Year, Month, City, Category
      `);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Revenue Report');

    // Add headers
    worksheet.columns = [
      { header: 'Year', key: 'Year', width: 10 },
      { header: 'Month', key: 'Month', width: 10 },
      { header: 'City', key: 'City', width: 15 },
      { header: 'Car Category', key: 'Category', width: 15 },
      { header: 'Total Bookings', key: 'TotalBookings', width: 15 },
      { header: 'Completed Bookings', key: 'CompletedBookings', width: 18 },
      { header: 'Total Revenue', key: 'TotalRevenue', width: 15 },
      { header: 'Avg Booking Value', key: 'AvgBookingValue', width: 18 }
    ];

    // Add data
    revenueResult.recordset.forEach(revenue => {
      worksheet.addRow({
        ...revenue,
        TotalRevenue: revenue.TotalRevenue || 0,
        AvgBookingValue: revenue.AvgBookingValue || 0
      });
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F3FF' }
    };

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=revenue-report-${startDate}-to-${endDate}.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export revenue report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export revenue report',
      error: error.message
    });
  }
};

// Test endpoint to check database data
const testDatabaseData = async (req, res) => {
  try {
    const pool = await poolPromise;
    
    // Check total counts
    const countsResult = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM dbo.Users) as totalUsers,
        (SELECT COUNT(*) FROM dbo.Cars) as totalCars,
        (SELECT COUNT(*) FROM dbo.Bookings) as totalBookings,
        (SELECT COUNT(*) FROM dbo.Locations) as totalLocations
    `);
    
    // Check recent bookings with details
    const recentBookingsResult = await pool.request().query(`
      SELECT TOP 10
        b.Id,
        b.Status,
        b.TotalAmount,
        b.StartDate,
        b.EndDate,
        b.CreatedAt,
        u.Name as UserName,
        c.Make + ' ' + c.Model as CarDetails
      FROM dbo.Bookings b
      LEFT JOIN dbo.Users u ON b.UserId = u.Id
      LEFT JOIN dbo.Cars c ON b.CarId = c.Id
      ORDER BY b.CreatedAt DESC
    `);
    
    // Check date range of bookings
    const dateRangeResult = await pool.request().query(`
      SELECT 
        MIN(CreatedAt) as firstBooking,
        MAX(CreatedAt) as lastBooking,
        COUNT(*) as totalBookings,
        COUNT(CASE WHEN Status = 'completed' THEN 1 END) as completedBookings,
        COUNT(CASE WHEN Status = 'pending' THEN 1 END) as pendingBookings,
        COUNT(CASE WHEN Status = 'cancelled' THEN 1 END) as cancelledBookings
      FROM dbo.Bookings
    `);
    
    // Check sample booking statuses
    const statusResult = await pool.request().query(`
      SELECT 
        Status,
        COUNT(*) as count,
        SUM(TotalAmount) as totalAmount
      FROM dbo.Bookings
      GROUP BY Status
    `);
    
    res.json({
      success: true,
      data: {
        counts: countsResult.recordset[0],
        recentBookings: recentBookingsResult.recordset,
        dateRange: dateRangeResult.recordset[0],
        statusBreakdown: statusResult.recordset
      }
    });
    
  } catch (error) {
    console.error('Test database data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test data',
      error: error.message
    });
  }
};

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const pool = await poolPromise;
    
    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Parallel queries for better performance
    const [carsResult, bookingsResult, usersResult, revenueResult] = await Promise.all([
      // Total active cars
      pool.request().query(`
        SELECT 
          COUNT(*) as totalCars,
          COUNT(CASE WHEN Available = 1 THEN 1 END) as availableCars,
          COUNT(CASE WHEN Available = 0 THEN 1 END) as unavailableCars
        FROM dbo.Cars
      `),
      
      // Current month bookings
      pool.request()
        .input('startDate', sql.Date, startOfMonth)
        .input('endDate', sql.Date, endOfMonth)
        .query(`
          SELECT 
            COUNT(*) as totalBookings,
            COUNT(CASE WHEN Status = 'completed' THEN 1 END) as completedBookings,
            COUNT(CASE WHEN Status = 'pending' THEN 1 END) as pendingBookings,
            COUNT(CASE WHEN Status = 'confirmed' THEN 1 END) as confirmedBookings,
            COUNT(CASE WHEN Status = 'cancelled' THEN 1 END) as cancelledBookings
          FROM dbo.Bookings 
          WHERE CAST(CreatedAt AS DATE) >= @startDate AND CAST(CreatedAt AS DATE) <= @endDate
        `),
      
      // User statistics
      pool.request()
        .input('startDate', sql.Date, startOfMonth)
        .query(`
          SELECT 
            COUNT(*) as totalUsers,
            COUNT(CASE WHEN CAST(CreatedAt AS DATE) >= @startDate THEN 1 END) as newUsers,
            COUNT(CASE WHEN IsAdmin = 1 THEN 1 END) as adminUsers
          FROM dbo.Users
        `),
      
      // Current month revenue
      pool.request()
        .input('startDate', sql.Date, startOfMonth)
        .input('endDate', sql.Date, endOfMonth)
        .query(`
          SELECT 
            SUM(CASE WHEN Status = 'completed' THEN TotalAmount ELSE 0 END) as monthlyRevenue,
            AVG(CASE WHEN Status = 'completed' THEN TotalAmount ELSE NULL END) as avgBookingValue,
            COUNT(CASE WHEN Status = 'completed' THEN 1 END) as completedBookingsForRevenue
          FROM dbo.Bookings 
          WHERE CAST(CreatedAt AS DATE) >= @startDate AND CAST(CreatedAt AS DATE) <= @endDate
        `)
    ]);

    const stats = {
      totalCars: carsResult.recordset[0].totalCars || 0,
      availableCars: carsResult.recordset[0].availableCars || 0,
      unavailableCars: carsResult.recordset[0].unavailableCars || 0,
      totalBookings: bookingsResult.recordset[0].totalBookings || 0,
      totalUsers: usersResult.recordset[0].totalUsers || 0,
      monthlyRevenue: revenueResult.recordset[0].monthlyRevenue || 0,
      
      // Additional metrics
      completedBookings: bookingsResult.recordset[0].completedBookings || 0,
      pendingBookings: bookingsResult.recordset[0].pendingBookings || 0,
      confirmedBookings: bookingsResult.recordset[0].confirmedBookings || 0,
      cancelledBookings: bookingsResult.recordset[0].cancelledBookings || 0,
      newUsers: usersResult.recordset[0].newUsers || 0,
      adminUsers: usersResult.recordset[0].adminUsers || 0,
      avgBookingValue: revenueResult.recordset[0].avgBookingValue || 0,
      completedBookingsForRevenue: revenueResult.recordset[0].completedBookingsForRevenue || 0
    };

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Recent Activity Feed
const getRecentActivity = async (req, res) => {
  try {
    const pool = await poolPromise;
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent activities from multiple sources
    const result = await pool.request()
      .input('limit', sql.Int, limit)
      .query(`
        SELECT TOP (@limit) * FROM (
          -- Recent bookings
          SELECT 
            'booking' as activityType,
            'New booking created: ' + u.Name + ' - ' + c.Make + ' ' + c.Model as description,
            b.CreatedAt as activityTime,
            'Calendar' as icon,
            'blue' as color
          FROM dbo.Bookings b
          INNER JOIN dbo.Users u ON b.UserId = u.Id
          INNER JOIN dbo.Cars c ON b.CarId = c.Id
          WHERE b.CreatedAt >= DATEADD(day, -7, GETDATE())
          
          UNION ALL
          
          -- Recent car additions (last 7 days)
          SELECT 
            'car' as activityType,
            'New car added: ' + Make + ' ' + Model + ' (' + RegistrationNumber + ')' as description,
            CreatedAt as activityTime,
            'Car' as icon,
            'green' as color
          FROM dbo.Cars
          WHERE CreatedAt >= DATEADD(day, -7, GETDATE())
          
          UNION ALL
          
          -- Recent user registrations
          SELECT 
            'user' as activityType,
            'New user registered: ' + Name as description,
            CreatedAt as activityTime,
            'Users' as icon,
            'purple' as color
          FROM dbo.Users
          WHERE CreatedAt >= DATEADD(day, -7, GETDATE()) AND IsAdmin = 0
          
          UNION ALL
          
          -- Recent maintenance logs
          SELECT 
            'maintenance' as activityType,
            'Maintenance logged: ' + c.Make + ' ' + c.Model + ' - ' + mh.Type as description,
            mh.CreatedAt as activityTime,
            'Wrench' as icon,
            'orange' as color
          FROM dbo.MaintenanceHistory mh
          INNER JOIN dbo.Cars c ON mh.CarId = c.Id
          WHERE mh.CreatedAt >= DATEADD(day, -7, GETDATE())
        ) AS CombinedActivities
        ORDER BY activityTime DESC
      `);
    
    res.json({
      success: true,
      message: 'Recent activity retrieved successfully',
      data: result.recordset
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message
    });
  }
};

module.exports = {
  // Car management
  createCar,
  updateCar,
  deleteCar,
  getAllCars,
  getCarById,
  uploadCarImages,
  deleteCarImage,
  
  // Booking management
  getAllBookings,
  updateBookingStatus,
  
  // User management
  getAllUsers,
  toggleUserRole,
  deleteUser,
  activateUser,
  deactivateUser,
  
  // Location management
  getAllLocations,
  createLocation,
  
  // Maintenance management
  addMaintenance,
  getCarMaintenance,
  updateMaintenance,
  deleteMaintenance,
  
  // Reporting
  getBookingsReport,
  getRevenueReport,
  exportBookingsReport,
  exportRevenueReport,
  
  // Dashboard
  getDashboardStats,
  getRecentActivity,
  
  // Test endpoint
  testDatabaseData
};