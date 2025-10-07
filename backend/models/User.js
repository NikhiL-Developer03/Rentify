// models/User.js
const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcrypt');

// Create a new user
const create = async (userData) => {
  try {
    const pool = await poolPromise;
    const { name, email, phone, password, isAdmin = false, isActive = true } = userData;
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const result = await pool.request()
      .input('name', sql.NVarChar(255), name)
      .input('email', sql.NVarChar(255), email)
      .input('phone', sql.NVarChar(20), phone)
      .input('passwordHash', sql.NVarChar(255), passwordHash)
      .input('isAdmin', sql.Bit, isAdmin)
      .input('isActive', sql.Bit, isActive)
      .query(`
        INSERT INTO dbo.Users (Name, Email, Phone, PasswordHash, IsAdmin, IsActive)
        OUTPUT INSERTED.*
        VALUES (@name, @email, @phone, @passwordHash, @isAdmin, @isActive)
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Find user by email
const findByEmail = async (email) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query('SELECT * FROM dbo.Users WHERE Email = @email');
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Find user by ID
const findById = async (id) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    
    // Set query timeout to 5 seconds
    request.timeout = 5000;
    
    const result = await request
      .input('id', sql.Int, id)
      .query('SELECT * FROM dbo.Users WHERE Id = @id');
    
    return result.recordset[0];
  } catch (error) {
    // Add more specific error information for debugging
    console.error(`Database error in findById(${id}):`, error);
    throw error;
  }
};

// Verify password
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Get all users (admin only)
const getAll = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT Id, Name, Email, Phone, IsAdmin, IsActive, CreatedAt, UpdatedAt FROM dbo.Users ORDER BY CreatedAt DESC');
    
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

// Update user
const update = async (id, updates) => {
  try {
    const pool = await poolPromise;
    const { name, email, phone, isActive } = updates;
    
    // Build the query based on provided fields
    let queryFields = [];
    if (name) queryFields.push('Name = @name');
    if (email) queryFields.push('Email = @email');
    if (phone) queryFields.push('Phone = @phone');
    if (isActive !== undefined) queryFields.push('IsActive = @isActive');
    queryFields.push('UpdatedAt = GETDATE()');
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar(255), name)
      .input('email', sql.NVarChar(255), email)
      .input('phone', sql.NVarChar(20), phone)
      .input('isActive', sql.Bit, isActive)
      .query(`
        UPDATE dbo.Users 
        SET ${queryFields.join(', ')}
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Make user admin
const makeAdmin = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE dbo.Users 
        SET IsAdmin = 1, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Delete user
const deleteUser = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.Users WHERE Id = @id');
    
    return result.rowsAffected[0] > 0;
  } catch (error) {
    throw error;
  }
};

// Activate a user
const activateUser = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE dbo.Users 
        SET IsActive = 1, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Deactivate a user
const deactivateUser = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE dbo.Users 
        SET IsActive = 0, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  findByEmail,
  findById,
  verifyPassword,
  getAll,
  update,
  makeAdmin,
  activateUser,
  deactivateUser,
  delete: deleteUser
};