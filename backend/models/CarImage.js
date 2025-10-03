// models/CarImage.js
const { sql, poolPromise } = require('../config/db');

// Add image to car
const create = async (imageData) => {
  try {
    const pool = await poolPromise;
    const { carId, filePath, fileName, fileSize, mimeType, altText } = imageData;
    
    const result = await pool.request()
      .input('carId', sql.Int, carId)
      .input('filePath', sql.NVarChar(500), filePath)
      .input('fileName', sql.NVarChar(255), fileName)
      .input('fileSize', sql.BigInt, fileSize)
      .input('mimeType', sql.NVarChar(100), mimeType)
      .input('altText', sql.NVarChar(255), altText)
      .query(`
        INSERT INTO dbo.CarImages (CarId, FilePath, FileName, FileSize, MimeType, AltText)
        OUTPUT INSERTED.*
        VALUES (@carId, @filePath, @fileName, @fileSize, @mimeType, @altText)
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Get all images for a car - optimized to use IX_CarImages_CarId index
const getByCarId = async (carId) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('carId', sql.Int, carId)
      .query('SELECT * FROM dbo.CarImages WHERE CarId = @carId ORDER BY CreatedAt');
    
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

// Get image by ID
const findById = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM dbo.CarImages WHERE Id = @id');
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Delete image
const deleteImage = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.CarImages WHERE Id = @id');
    
    return result.rowsAffected[0] > 0;
  } catch (error) {
    throw error;
  }
};

// Delete all images for a car - optimized to use IX_CarImages_CarId index
const deleteByCarId = async (carId) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('carId', sql.Int, carId)
      .query('DELETE FROM dbo.CarImages WHERE CarId = @carId');
    
    return result.rowsAffected[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  getByCarId,
  findById,
  delete: deleteImage,
  deleteByCarId
};