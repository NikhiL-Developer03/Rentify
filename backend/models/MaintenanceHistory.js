// models/MaintenanceHistory.js
const { sql, poolPromise } = require('../config/db');

// Create a new maintenance record
const create = async (maintenanceData) => {
  try {
    const pool = await poolPromise;
    const { 
      carId, 
      recordedBy, 
      type,  // Using 'type' instead of 'maintenanceType'
      description, 
      cost
    } = maintenanceData;
    
    const result = await pool.request()
      .input('carId', sql.Int, carId)
      .input('recordedBy', sql.Int, recordedBy)
      .input('type', sql.NVarChar(50), type)
      .input('description', sql.NVarChar(1000), description)
      .input('cost', sql.Decimal(10, 2), cost || 0)
      .query(`
        INSERT INTO dbo.MaintenanceHistory 
        (CarId, RecordedBy, Type, Description, Cost)
        OUTPUT INSERTED.*
        VALUES (@carId, @recordedBy, @type, @description, @cost)
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Get maintenance history by car ID - optimized to use IX_Maintenance_CarId index
const getByCarId = async (carId) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('carId', sql.Int, carId)
      .query(`
        SELECT 
          mh.*,
          u.Name as RecordedByName,
          u.Email as RecordedByEmail,
          c.RegistrationNumber,
          c.Make,
          c.Model
        FROM dbo.MaintenanceHistory mh
        LEFT JOIN dbo.Users u ON mh.RecordedBy = u.Id
        INNER JOIN dbo.Cars c ON mh.CarId = c.Id
        WHERE mh.CarId = @carId
        ORDER BY mh.Id DESC
      `);
    
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

// Find maintenance record by ID
const findById = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          mh.*,
          u.Name as RecordedByName,
          u.Email as RecordedByEmail,
          c.RegistrationNumber,
          c.Make,
          c.Model
        FROM dbo.MaintenanceHistory mh
        LEFT JOIN dbo.Users u ON mh.RecordedBy = u.Id
        INNER JOIN dbo.Cars c ON mh.CarId = c.Id
        WHERE mh.Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Get all maintenance records (admin)
const getAll = async (filters = {}) => {
  try {
    const pool = await poolPromise;
    let query = `
      SELECT 
        mh.*,
        u.Name as RecordedByName,
        c.RegistrationNumber,
        c.Make,
        c.Model,
        l.City
      FROM dbo.MaintenanceHistory mh
      LEFT JOIN dbo.Users u ON mh.RecordedBy = u.Id
      INNER JOIN dbo.Cars c ON mh.CarId = c.Id
      INNER JOIN dbo.Locations l ON c.LocationId = l.Id
      WHERE 1=1
    `;
    
    const request = pool.request();
    
    if (filters.carId) {
      query += ' AND mh.CarId = @carId';
      request.input('carId', sql.Int, filters.carId);
    }
    
    if (filters.type) {
      query += ' AND mh.Type = @type';
      request.input('type', sql.NVarChar(50), filters.type);
    }

    if (filters.city) {
      query += ' AND l.City = @city';
      request.input('city', sql.NVarChar(100), filters.city);
    }

    query += ' ORDER BY mh.Id DESC';    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

// Update maintenance record
const update = async (id, updates) => {
  try {
    const pool = await poolPromise;
    const { 
      type,  // Using 'type' instead of 'maintenanceType' 
      description, 
      cost
    } = updates;
    
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('type', sql.NVarChar(50), type)
      .input('description', sql.NVarChar(1000), description)
      .input('cost', sql.Decimal(10, 2), cost)
      .query(`
        UPDATE dbo.MaintenanceHistory 
        SET Type = @type, 
            Description = @description, 
            Cost = @cost
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);
    
    return result.recordset[0];
  } catch (error) {
    throw error;
  }
};

// Delete maintenance record
const deleteMaintenance = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM dbo.MaintenanceHistory WHERE Id = @id');
    
    return result.rowsAffected[0] > 0;
  } catch (error) {
    throw error;
  }
};

// Get maintenance cost summary for a car - optimized to use IX_Maintenance_CarId index
const getCostSummary = async (carId) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('carId', sql.Int, carId)
      .query(`
        SELECT 
          COUNT(*) as TotalRecords,
          SUM(Cost) as TotalCost,
          AVG(Cost) as AverageCost,
          Type,
          COUNT(*) as TypeCount
        FROM dbo.MaintenanceHistory
        WHERE CarId = @carId
        GROUP BY Type
        ORDER BY TotalCost DESC
      `);
    
    return result.recordset;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  getByCarId,
  findById,
  getAll,
  update,
  delete: deleteMaintenance,
  getCostSummary
};