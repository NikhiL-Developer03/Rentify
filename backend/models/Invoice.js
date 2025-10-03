// models/Invoice.js
const { sql, poolPromise } = require('../config/db');

// Create a new invoice
const create = async (invoiceData) => {
  try {
    const pool = await poolPromise;
    const { bookingId, invoiceNumber, amount, tax, pdfPath, status = 'pending' } = invoiceData;
    
    const result = await pool.request()
      .input('bookingId', sql.Int, bookingId)
      .input('invoiceNumber', sql.NVarChar(50), invoiceNumber)
      .input('amount', sql.Decimal(10, 2), amount)
      .input('tax', sql.Decimal(10, 2), tax)
      .input('status', sql.NVarChar(50), status)
      .input('pdfPath', sql.NVarChar(500), pdfPath)
      .query(`
        INSERT INTO dbo.Invoices (BookingId, InvoiceNumber, Amount, Tax, Status, PdfPath)
        OUTPUT INSERTED.*
        VALUES (@bookingId, @invoiceNumber, @amount, @tax, @status, @pdfPath)
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Find invoice by ID
const findById = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          i.Id,
          i.BookingId,
          ISNULL(i.InvoiceNumber, '') as InvoiceNumber,
          ISNULL(i.Amount, 0) as Amount,
          ISNULL(i.Amount, 0) as TotalAmount,
          ISNULL(i.Tax, 0) as Tax,
          ISNULL(i.Status, 'pending') as Status,
          ISNULL(i.PdfPath, '') as PdfPath,
          i.CreatedAt,
          i.UpdatedAt,
          b.UserId,
          b.CarId,
          b.StartDate,
          b.EndDate,
          ISNULL(b.TotalAmount, 0) as BookingAmount,
          ISNULL(u.Name, 'Unknown') as UserName,
          ISNULL(u.Email, '') as UserEmail,
          ISNULL(u.Phone, '') as UserPhone,
          ISNULL(c.RegistrationNumber, '') as RegistrationNumber,
          ISNULL(c.Make, '') as Make,
          ISNULL(c.Model, '') as Model,
          ISNULL(c.BasePricePerDay, 0) as BasePricePerDay
        FROM dbo.Invoices i
        INNER JOIN dbo.Bookings b ON i.BookingId = b.Id
        INNER JOIN dbo.Users u ON b.UserId = u.Id
        INNER JOIN dbo.Cars c ON b.CarId = c.Id
        WHERE i.Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Find invoice by booking ID - optimized to use IX_Invoices_BookingId index
const findByBookingId = async (bookingId) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('bookingId', sql.Int, bookingId)
      .query(`
        SELECT ISNULL(Id, 0) as Id, 
               ISNULL(BookingId, 0) as BookingId, 
               ISNULL(InvoiceNumber, '') as InvoiceNumber, 
               ISNULL(Amount, 0) as Amount, 
               ISNULL(Tax, 0) as Tax, 
               ISNULL(Status, 'pending') as Status, 
               ISNULL(PdfPath, '') as PdfPath, 
               CreatedAt, 
               UpdatedAt
        FROM dbo.Invoices 
        WHERE BookingId = @bookingId
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Generate invoice number
const generateInvoiceNumber = async (cityCode = 'GEN') => {
  try {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get count of invoices for today
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT COUNT(*) as count 
        FROM dbo.Invoices 
        WHERE CAST(CreatedAt AS DATE) = CAST(GETDATE() AS DATE)
      `);
    
    const sequence = String(result.recordset[0].count + 1).padStart(4, '0');
    return `INV-${cityCode}-${year}${month}${day}-${sequence}`;
  } catch (error) {
    throw error;
  }
};

// Get all invoices (admin)
const getAll = async (filters = {}) => {
  try {
    const pool = await poolPromise;
    let query = `
      SELECT 
        i.Id,
        i.BookingId,
        ISNULL(i.InvoiceNumber, '') as InvoiceNumber,
        ISNULL(i.Amount, 0) as Amount,
        ISNULL(i.Amount, 0) as TotalAmount,
        ISNULL(i.Tax, 0) as Tax,
        ISNULL(i.Status, 'pending') as Status,
        ISNULL(i.PdfPath, '') as PdfPath,
        i.CreatedAt,
        i.UpdatedAt,
        b.UserId,
        b.StartDate,
        b.EndDate,
        ISNULL(b.TotalAmount, 0) as BookingAmount,
        ISNULL(u.Name, 'Unknown') as UserName,
        ISNULL(u.Email, '') as UserEmail,
        ISNULL(u.Phone, '') as UserPhone,
        ISNULL(c.RegistrationNumber, '') as RegistrationNumber,
        ISNULL(c.Make, '') as Make,
        ISNULL(c.Model, '') as Model,
        ISNULL(c.BasePricePerDay, 0) as BasePricePerDay
      FROM dbo.Invoices i
      INNER JOIN dbo.Bookings b ON i.BookingId = b.Id
      INNER JOIN dbo.Users u ON b.UserId = u.Id
      INNER JOIN dbo.Cars c ON b.CarId = c.Id
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    if (filters.userId) {
      query += ' AND b.UserId = @userId';
      request.input('userId', sql.Int, filters.userId);
    }
    
    if (filters.month && filters.year) {
      query += ' AND YEAR(i.CreatedAt) = @year AND MONTH(i.CreatedAt) = @month';
      request.input('year', sql.Int, filters.year);
      request.input('month', sql.Int, filters.month);
    }
    
    query += ' ORDER BY i.CreatedAt DESC';
    
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

// Update invoice status
const updateStatus = async (id, status) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar(50), status)
      .query(`
        UPDATE dbo.Invoices 
        SET Status = @status, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Get detailed invoice information
const getFullInvoiceDetails = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          i.Id,
          i.BookingId,
          ISNULL(i.InvoiceNumber, '') as InvoiceNumber,
          ISNULL(i.Amount, 0) as Amount,
          ISNULL(i.Amount, 0) as TotalAmount,
          ISNULL(i.Tax, 0) as Tax,
          ISNULL(i.Status, 'pending') as Status,
          ISNULL(i.PdfPath, '') as PdfPath,
          i.CreatedAt,
          i.UpdatedAt,
          b.UserId,
          b.CarId,
          b.StartDate,
          b.EndDate,
          ISNULL(b.TotalAmount, 0) as BookingAmount,
          ISNULL(u.Name, 'Unknown') as UserName,
          ISNULL(u.Email, '') as UserEmail,
          ISNULL(u.Phone, '') as UserPhone,
          ISNULL(c.RegistrationNumber, '') as RegistrationNumber,
          ISNULL(c.Make, '') as Make,
          ISNULL(c.Model, '') as Model,
          ISNULL(c.Year, '') as Year,
          ISNULL(c.BasePricePerDay, 0) as BasePricePerDay,
          ISNULL(c.Color, '') as Color,
          DATEDIFF(DAY, b.StartDate, b.EndDate) + 1 as TotalDays
        FROM dbo.Invoices i
        INNER JOIN dbo.Bookings b ON i.BookingId = b.Id
        INNER JOIN dbo.Users u ON b.UserId = u.Id
        INNER JOIN dbo.Cars c ON b.CarId = c.Id
        WHERE i.Id = @id
      `);
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    return result.recordset[0];
  } catch (error) {
    console.error('Error getting full invoice details:', error);
    throw error;
  }
};

// Delete invoice
const deleteInvoice = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.Invoices WHERE Id = @id');
    
    return result.rowsAffected[0] > 0;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  findById,
  findByBookingId,
  generateInvoiceNumber,
  getAll,
  getFullInvoiceDetails,
  updateStatus,
  delete: deleteInvoice
};