// models/Payment.js
const { sql, poolPromise } = require('../config/db');

// Create a new payment
const create = async (paymentData) => {
  try {
    const pool = await poolPromise;
    const { bookingId, provider, providerPaymentId, amount, status, paidAt } = paymentData;
    
    const result = await pool.request()
      .input('bookingId', sql.Int, bookingId)
      .input('provider', sql.NVarChar(50), provider)
      .input('providerPaymentId', sql.NVarChar(255), providerPaymentId)
      .input('amount', sql.Decimal(10, 2), amount)
      .input('status', sql.NVarChar(20), status)
      .input('paidAt', sql.DateTime2, paidAt)
      .query(`
        INSERT INTO dbo.Payments (BookingId, Provider, ProviderPaymentId, Amount, Status, PaidAt)
        OUTPUT INSERTED.*
        VALUES (@bookingId, @provider, @providerPaymentId, @amount, @status, @paidAt)
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Find payment by ID
const findById = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          p.*,
          b.UserId,
          b.TotalAmount as BookingAmount,
          u.Name as UserName,
          u.Email as UserEmail
        FROM dbo.Payments p
        INNER JOIN dbo.Bookings b ON p.BookingId = b.Id
        INNER JOIN dbo.Users u ON b.UserId = u.Id
        WHERE p.Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Find payments by booking ID
const findByBookingId = async (bookingId) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('bookingId', sql.Int, bookingId)
      .query('SELECT * FROM dbo.Payments WHERE BookingId = @bookingId ORDER BY PaidAt DESC');
    
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

// Update payment status
const updateStatus = async (id, status, paidAt = null) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar(20), status)
      .input('paidAt', sql.DateTime2, paidAt)
      .query(`
        UPDATE dbo.Payments 
        SET Status = @status, PaidAt = @paidAt
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Get all payments (admin)
const getAll = async (filters = {}) => {
  try {
    const pool = await poolPromise;
    let query = `
      SELECT 
        p.*,
        b.UserId,
        u.Name as UserName,
        u.Email as UserEmail,
        c.RegistrationNumber,
        c.Make,
        c.Model
      FROM dbo.Payments p
      INNER JOIN dbo.Bookings b ON p.BookingId = b.Id
      INNER JOIN dbo.Users u ON b.UserId = u.Id
      INNER JOIN dbo.Cars c ON b.CarId = c.Id
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    if (filters.status) {
      query += ' AND p.Status = @status';
      request.input('status', sql.NVarChar(20), filters.status);
    }
    
    if (filters.provider) {
      query += ' AND p.Provider = @provider';
      request.input('provider', sql.NVarChar(50), filters.provider);
    }
    
    query += ' ORDER BY p.PaidAt DESC';
    
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  findById,
  findByBookingId,
  updateStatus,
  getAll
};