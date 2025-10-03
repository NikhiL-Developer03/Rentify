// models/Booking.js
const { sql, poolPromise } = require('../config/db');

// Create a new booking
const create = async (bookingData) => {
  try {
    const pool = await poolPromise;
    const { userId, carId, startDate, endDate, totalAmount, status = 'pending' } = bookingData;
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('carId', sql.Int, carId)
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .input('totalAmount', sql.Decimal(10, 2), totalAmount)
      .input('status', sql.NVarChar(20), status)
      .query(`
        INSERT INTO dbo.Bookings (UserId, CarId, StartDate, EndDate, TotalAmount, Status)
        OUTPUT INSERTED.*
        VALUES (@userId, @carId, @startDate, @endDate, @totalAmount, @status)
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Get booking by ID with related data
const findById = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          b.*,
          u.Name as UserName,
          u.Email as UserEmail,
          u.Phone as UserPhone,
          c.RegistrationNumber,
          c.Make,
          c.Model,
          c.Year,
          l.City,
          l.State
        FROM dbo.Bookings b
        INNER JOIN dbo.Users u ON b.UserId = u.Id
        INNER JOIN dbo.Cars c ON b.CarId = c.Id
        INNER JOIN dbo.Locations l ON c.LocationId = l.Id
        WHERE b.Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Get bookings by user ID (fast version without images initially)
const getByUserId = async (userId) => {
  try {
    const pool = await poolPromise;
    
    // Fast query without images first
    const bookingResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          b.*,
          c.RegistrationNumber,
          c.Make,
          c.Model,
          c.Year,
          c.BasePricePerDay,
          l.City,
          l.State
        FROM dbo.Bookings b
        INNER JOIN dbo.Cars c ON b.CarId = c.Id
        INNER JOIN dbo.Locations l ON c.LocationId = l.Id
        WHERE b.UserId = @userId
        ORDER BY b.CreatedAt DESC
      `);
    
    const bookings = bookingResult.recordset;
    
    if (bookings.length === 0) {
      return [];
    }
    
    // Get car IDs for image query
    const carIds = [...new Set(bookings.map(b => b.CarId))];
    
    // Single query to get all images for all cars
    const imageQuery = carIds.map((_, index) => `@carId${index}`).join(',');
    const imageRequest = pool.request();
    
    carIds.forEach((carId, index) => {
      imageRequest.input(`carId${index}`, sql.Int, carId);
    });
    
    const imageResult = await imageRequest.query(`
      SELECT CarId, Id, FilePath, AltText 
      FROM dbo.CarImages
      WHERE CarId IN (${imageQuery})
      ORDER BY CarId, Id
    `);
    
    // Group images by car ID
    const imagesByCarId = {};
    imageResult.recordset.forEach(img => {
      if (!imagesByCarId[img.CarId]) {
        imagesByCarId[img.CarId] = [];
      }
      imagesByCarId[img.CarId].push({
        id: img.Id,
        url: `/uploads/cars/${img.FilePath.split('\\').pop()}`,
        altText: img.AltText
      });
    });
    
    // Combine bookings with their images
    return bookings.map(booking => ({
      ...booking,
      images: imagesByCarId[booking.CarId] || []
    }));
    
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get all bookings (admin) with filters
const getAll = async (filters = {}) => {
  try {
    const pool = await poolPromise;
    let query = `
      SELECT 
        b.*,
        u.Name as UserName,
        u.Email as UserEmail,
        u.Phone as UserPhone,
        c.RegistrationNumber,
        c.Make,
        c.Model,
        l.City,
        l.State
      FROM dbo.Bookings b
      INNER JOIN dbo.Users u ON b.UserId = u.Id
      INNER JOIN dbo.Cars c ON b.CarId = c.Id
      INNER JOIN dbo.Locations l ON c.LocationId = l.Id
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    if (filters.city) {
      query += ' AND l.City = @city';
      request.input('city', sql.NVarChar(100), filters.city);
    }
    
    if (filters.status) {
      query += ' AND b.Status = @status';
      request.input('status', sql.NVarChar(20), filters.status);
    }
    
    if (filters.userId) {
      query += ' AND b.UserId = @userId';
      request.input('userId', sql.Int, filters.userId);
    }
    
    query += ' ORDER BY b.CreatedAt DESC';
    
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

// Update booking status
const updateStatus = async (id, status) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar(20), status)
      .query(`
        UPDATE dbo.Bookings 
        SET Status = @status
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Calculate total amount based on car price and days
const calculateTotalAmount = (basePricePerDay, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return basePricePerDay * days;
};

// Check for booking conflicts
const hasConflict = async (carId, startDate, endDate, excludeBookingId = null) => {
  try {
    const pool = await poolPromise;
    let query = `
      SELECT COUNT(*) as conflictCount
      FROM dbo.Bookings 
      WHERE CarId = @carId
      AND Status IN ('pending', 'confirmed')
      AND (StartDate <= @endDate AND EndDate >= @startDate)
    `;
    
    const request = pool.request()
      .input('carId', sql.Int, carId)
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate);
    
    if (excludeBookingId) {
      query += ' AND Id != @excludeBookingId';
      request.input('excludeBookingId', sql.Int, excludeBookingId);
    }
    
    const result = await request.query(query);
    return result.recordset[0].conflictCount > 0;
  } catch (error) {
    throw error;
  }
};

// Delete booking
const deleteBooking = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.Bookings WHERE Id = @id');
    
    return result.rowsAffected[0] > 0;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  findById,
  getByUserId,
  getAll,
  updateStatus,
  calculateTotalAmount,
  hasConflict,
  delete: deleteBooking
};