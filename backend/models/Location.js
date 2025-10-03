// models/Location.js
const { sql, poolPromise } = require('../config/db');

// Create a new location
const create = async (locationData) => {
  try {
    const pool = await poolPromise;
    const { city, state, pincode, address } = locationData;
    
    const result = await pool.request()
      .input('city', sql.NVarChar(100), city)
      .input('state', sql.NVarChar(100), state)
      .input('pincode', sql.NVarChar(10), pincode)
      .input('address', sql.NVarChar(500), address)
      .query(`
        INSERT INTO dbo.Locations (City, State, Pincode, Address)
        OUTPUT INSERTED.*
        VALUES (@city, @state, @pincode, @address)
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Get all locations
const getAll = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM dbo.Locations ORDER BY City');
    
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

// Find location by ID
const findById = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM dbo.Locations WHERE Id = @id');
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Find location by city
const findByCity = async (city) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('city', sql.NVarChar(100), city)
      .query('SELECT * FROM dbo.Locations WHERE City = @city');
    
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

// Update location
const update = async (id, updates) => {
  try {
    const pool = await poolPromise;
    const { city, state, pincode, address } = updates;
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('city', sql.NVarChar(100), city)
      .input('state', sql.NVarChar(100), state)
      .input('pincode', sql.NVarChar(10), pincode)
      .input('address', sql.NVarChar(500), address)
      .query(`
        UPDATE dbo.Locations 
        SET City = @city, State = @state, Pincode = @pincode, Address = @address
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Delete location
const deleteLocation = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.Locations WHERE Id = @id');
    
    return result.rowsAffected[0] > 0;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  getAll,
  findById,
  findByCity,
  update,
  delete: deleteLocation
};