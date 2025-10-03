// models/Review.js
const { sql, poolPromise } = require('../config/db');

// Create a new review
const create = async (reviewData) => {
  try {
    const pool = await poolPromise;
    const { bookingId, rating, comment } = reviewData;
    
    const result = await pool.request()
      .input('bookingId', sql.Int, bookingId)
      .input('rating', sql.Int, rating)
      .input('comment', sql.NVarChar(1000), comment)
      .query(`
        INSERT INTO dbo.Reviews (BookingId, Rating, Comment)
        OUTPUT INSERTED.*
        VALUES (@bookingId, @rating, @comment)
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Get reviews by car ID
const getByCarId = async (carId) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('carId', sql.Int, carId)
      .query(`
        SELECT 
          r.*,
          u.Name as UserName,
          b.StartDate,
          b.EndDate
        FROM dbo.Reviews r
        INNER JOIN dbo.Bookings b ON r.BookingId = b.Id
        INNER JOIN dbo.Users u ON b.UserId = u.Id
        WHERE b.CarId = @carId
        ORDER BY r.CreatedAt DESC
      `);
    
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

// Find review by booking ID
const findByBookingId = async (bookingId) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('bookingId', sql.Int, bookingId)
      .query(`
        SELECT 
          r.*,
          u.Name as UserName,
          b.CarId,
          c.Make,
          c.Model,
          c.RegistrationNumber
        FROM dbo.Reviews r
        INNER JOIN dbo.Bookings b ON r.BookingId = b.Id
        INNER JOIN dbo.Users u ON b.UserId = u.Id
        INNER JOIN dbo.Cars c ON b.CarId = c.Id
        WHERE r.BookingId = @bookingId
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Find review by ID
const findById = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          r.*,
          u.Name as UserName,
          b.CarId,
          c.Make,
          c.Model,
          c.RegistrationNumber
        FROM dbo.Reviews r
        INNER JOIN dbo.Bookings b ON r.BookingId = b.Id
        INNER JOIN dbo.Users u ON b.UserId = u.Id
        INNER JOIN dbo.Cars c ON b.CarId = c.Id
        WHERE r.Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Get car rating statistics
const getCarRatingStats = async (carId) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('carId', sql.Int, carId)
      .query(`
        SELECT 
          COUNT(*) as TotalReviews,
          AVG(CAST(r.Rating as FLOAT)) as AverageRating,
          COUNT(CASE WHEN r.Rating = 5 THEN 1 END) as FiveStars,
          COUNT(CASE WHEN r.Rating = 4 THEN 1 END) as FourStars,
          COUNT(CASE WHEN r.Rating = 3 THEN 1 END) as ThreeStars,
          COUNT(CASE WHEN r.Rating = 2 THEN 1 END) as TwoStars,
          COUNT(CASE WHEN r.Rating = 1 THEN 1 END) as OneStar
        FROM dbo.Reviews r
        INNER JOIN dbo.Bookings b ON r.BookingId = b.Id
        WHERE b.CarId = @carId
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Get all reviews (admin)
const getAll = async (filters = {}) => {
  try {
    const pool = await poolPromise;
    let query = `
      SELECT 
        r.*,
        u.Name as UserName,
        u.Email as UserEmail,
        b.CarId,
        c.Make,
        c.Model,
        c.RegistrationNumber,
        l.City
      FROM dbo.Reviews r
      INNER JOIN dbo.Bookings b ON r.BookingId = b.Id
      INNER JOIN dbo.Users u ON b.UserId = u.Id
      INNER JOIN dbo.Cars c ON b.CarId = c.Id
      INNER JOIN dbo.Locations l ON c.LocationId = l.Id
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    if (filters.carId) {
      query += ' AND b.CarId = @carId';
      request.input('carId', sql.Int, filters.carId);
    }
    
    if (filters.rating) {
      query += ' AND r.Rating = @rating';
      request.input('rating', sql.Int, filters.rating);
    }
    
    if (filters.city) {
      query += ' AND l.City = @city';
      request.input('city', sql.NVarChar(100), filters.city);
    }
    
    query += ' ORDER BY r.CreatedAt DESC';
    
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

// Update review
const update = async (id, updates) => {
  try {
    const pool = await poolPromise;
    const { rating, comment } = updates;
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('rating', sql.Int, rating)
      .input('comment', sql.NVarChar(1000), comment)
      .query(`
        UPDATE dbo.Reviews 
        SET Rating = @rating, Comment = @comment
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Delete review
const deleteReview = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.Reviews WHERE Id = @id');
    
    return result.rowsAffected[0] > 0;
  } catch (error) {
    throw error;
  }
};

// Check if user can review (booking must be completed)
const canUserReview = async (bookingId, userId) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('bookingId', sql.Int, bookingId)
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          CASE 
            WHEN b.Status = 'completed' AND b.UserId = @userId 
            AND NOT EXISTS (SELECT 1 FROM dbo.Reviews WHERE BookingId = @bookingId)
            THEN 1 
            ELSE 0 
          END as CanReview
        FROM dbo.Bookings b
        WHERE b.Id = @bookingId
      `);
    
    return result.recordset[0]?.CanReview === 1;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  getByCarId,
  findByBookingId,
  findById,
  getCarRatingStats,
  getAll,
  update,
  delete: deleteReview,
  canUserReview
};