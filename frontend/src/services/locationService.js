import api from './api';

export const locationService = {
  // Get all locations
  getAllLocations: async () => {
    try {
      const response = await api.get('/locations');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch locations');
    }
  },

  // Get location by ID
  getLocationById: async (locationId) => {
    try {
      const response = await api.get(`/locations/${locationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch location');
    }
  },

  // Get cities only (for dropdown)
  getCities: async () => {
    try {
      const response = await api.get('/locations');
      if (response.data.success) {
        return response.data.data.map(location => ({
          id: location.Id,
          city: location.City,
          state: location.State
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  }
};

export default locationService;