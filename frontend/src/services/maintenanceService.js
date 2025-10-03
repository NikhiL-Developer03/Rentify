import api from './api';

// Maintenance Service for handling maintenance-related API calls
const maintenanceService = {
  // Get all cars for maintenance selection
  getCars: async () => {
    try {
      const response = await api.get('/admin/cars');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch cars' };
    }
  },

  // Get specific car details
  getCar: async (carId) => {
    try {
      const response = await api.get(`/admin/cars/${carId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch car details' };
    }
  },

  // Get maintenance records for a specific car
  getMaintenanceRecords: async (carId) => {
    try {
      const response = await api.get(`/admin/maintenance/${carId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch maintenance records' };
    }
  },

  // Add a new maintenance record
  addMaintenanceRecord: async (maintenanceData) => {
    try {
      const response = await api.post('/admin/maintenance', maintenanceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add maintenance record' };
    }
  },

  // Update an existing maintenance record
  updateMaintenanceRecord: async (recordId, maintenanceData) => {
    try {
      const response = await api.put(`/admin/maintenance/${recordId}`, maintenanceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update maintenance record' };
    }
  },

  // Delete a maintenance record
  deleteMaintenanceRecord: async (recordId) => {
    try {
      const response = await api.delete(`/admin/maintenance/${recordId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete maintenance record' };
    }
  }
};

export default maintenanceService;