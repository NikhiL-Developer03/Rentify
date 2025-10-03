// models/Car.js
const { sql, poolPromise } = require('../config/db');

// Create a new car
const create = async (carData) => {
  try {
    const pool = await poolPromise;
    const {
      registrationNumber,
      make,
      model,
      year,
      category,
      seats,
      transmission,
      fuelType,
      basePricePerDay,
      locationId,
      available = true
    } = carData;
    
    const result = await pool.request()
      .input('registrationNumber', sql.NVarChar(20), registrationNumber)
      .input('make', sql.NVarChar(100), make)
      .input('model', sql.NVarChar(100), model)
      .input('year', sql.Int, year)
      .input('category', sql.NVarChar(50), category)
      .input('seats', sql.Int, seats)
      .input('transmission', sql.NVarChar(20), transmission)
      .input('fuelType', sql.NVarChar(20), fuelType)
      .input('basePricePerDay', sql.Decimal(10, 2), basePricePerDay)
      .input('locationId', sql.Int, locationId)
      .input('available', sql.Bit, available)
      .query(`
        INSERT INTO dbo.Cars (RegistrationNumber, Make, Model, Year, Category, Seats, Transmission, FuelType, BasePricePerDay, LocationId, Available)
        OUTPUT INSERTED.*
        VALUES (@registrationNumber, @make, @model, @year, @category, @seats, @transmission, @fuelType, @basePricePerDay, @locationId, @available)
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Search cars with filters
const search = async (filters) => {
  try {
    const pool = await poolPromise;
    let query = `
      SELECT 
        c.*,
        l.City,
        l.State,
        l.Address
      FROM dbo.Cars c
      INNER JOIN dbo.Locations l ON c.LocationId = l.Id
      WHERE c.Available = 1
    `;
    
    const request = pool.request();
    
    // Add filters
    if (filters.city) {
      query += ' AND l.City = @city';
      request.input('city', sql.NVarChar(100), filters.city);
    }
    
    if (filters.category) {
      query += ' AND c.Category = @category';
      request.input('category', sql.NVarChar(50), filters.category);
    }
    
    if (filters.minPrice) {
      query += ' AND c.BasePricePerDay >= @minPrice';
      request.input('minPrice', sql.Decimal(10, 2), filters.minPrice);
    }
    
    if (filters.maxPrice) {
      query += ' AND c.BasePricePerDay <= @maxPrice';
      request.input('maxPrice', sql.Decimal(10, 2), filters.maxPrice);
    }
    
    // Check availability for specific dates - optimized to use IX_Bookings_CarDates index
    if (filters.startDate && filters.endDate) {
      query += `
        AND NOT EXISTS (
          SELECT 1 FROM dbo.Bookings b
          WHERE b.CarId = c.Id 
          AND b.Status IN ('pending', 'confirmed')
          AND b.StartDate <= @endDate 
          AND b.EndDate >= @startDate
        )
      `;
      request.input('startDate', sql.Date, filters.startDate);
      request.input('endDate', sql.Date, filters.endDate);
    }
    
    query += ' ORDER BY c.BasePricePerDay';
    
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

// Get car by ID with location details
const findById = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          c.*,
          l.City,
          l.State,
          l.Address
        FROM dbo.Cars c
        INNER JOIN dbo.Locations l ON c.LocationId = l.Id
        WHERE c.Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Get all cars (admin)
const getAll = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT 
          c.*,
          l.City,
          l.State,
          l.Address
        FROM dbo.Cars c
        INNER JOIN dbo.Locations l ON c.LocationId = l.Id
        ORDER BY c.CreatedAt DESC
      `);
    
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

// Update car
const update = async (id, updates) => {
  try {
    const pool = await poolPromise;
    const {
      registrationNumber,
      make,
      model,
      year,
      category,
      seats,
      transmission,
      fuelType,
      basePricePerDay,
      locationId,
      available
    } = updates;
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('registrationNumber', sql.NVarChar(20), registrationNumber)
      .input('make', sql.NVarChar(100), make)
      .input('model', sql.NVarChar(100), model)
      .input('year', sql.Int, year)
      .input('category', sql.NVarChar(50), category)
      .input('seats', sql.Int, seats)
      .input('transmission', sql.NVarChar(20), transmission)
      .input('fuelType', sql.NVarChar(20), fuelType)
      .input('basePricePerDay', sql.Decimal(10, 2), basePricePerDay)
      .input('locationId', sql.Int, locationId)
      .input('available', sql.Bit, available)
      .query(`
        UPDATE dbo.Cars 
        SET RegistrationNumber = @registrationNumber,
            Make = @make,
            Model = @model,
            Year = @year,
            Category = @category,
            Seats = @seats,
            Transmission = @transmission,
            FuelType = @fuelType,
            BasePricePerDay = @basePricePerDay,
            LocationId = @locationId,
            Available = @available
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Delete car
const deleteCar = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.Cars WHERE Id = @id');
    
    return result.rowsAffected[0] > 0;
  } catch (error) {
    throw error;
  }
};

// Check car availability for specific dates - optimized to use IX_Bookings_CarDates index
const checkAvailability = async (carId, startDate, endDate) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('carId', sql.Int, carId)
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query(`
        SELECT COUNT(*) as conflictCount
        FROM dbo.Bookings
        WHERE CarId = @carId
        AND StartDate <= @endDate 
        AND EndDate >= @startDate
        AND Status IN ('pending', 'confirmed')
      `);
    
    return result.recordset[0].conflictCount === 0;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  search,
  findById,
  getAll,
  update,
  delete: deleteCar,
  checkAvailability
};