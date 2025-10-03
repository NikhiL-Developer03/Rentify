import api from './api';

export const carService = {
  // Search cars with filters
  searchCars: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.city) params.append('city', filters.city);
      if (filters.category) params.append('category', filters.category);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const response = await api.get(`/cars?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search cars');
    }
  },

  // Get car by ID
  getCarById: async (carId) => {
    try {
      const response = await api.get(`/cars/${carId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch car details');
    }
  },

  // Check car availability
  checkAvailability: async (carId, startDate, endDate) => {
    try {
      const response = await api.get(`/cars/${carId}/availability`, {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check availability');
    }
  },

  // Get all cars (public)
  getAllCars: async () => {
    try {
      const response = await api.get('/cars');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch cars');
    }
  },

  // Get car categories
  getCategories: () => {
    return [
      'Hatchback',
      'Sedan', 
      'SUV',
      'MPV',
      'Luxury',
      'Electric'
    ];
  },

  // Get transmission options
  getTransmissionOptions: () => {
    return ['Manual', 'Automatic', 'CVT'];
  },

  // Get fuel types
  getFuelTypes: () => {
    return ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  },

  // Admin functions for car management
  admin: {
    // Get all cars (admin)
    getAllCars: async () => {
      try {
        const response = await api.get('/admin/cars');
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch cars');
      }
    },

    // Get car by ID (admin)
    getCarById: async (carId) => {
      try {
        const response = await api.get(`/admin/cars/${carId}`);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch car details');
      }
    },

    // Create new car
    createCar: async (carData) => {
      try {
        const response = await api.post('/admin/cars', carData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create car');
      }
    },

    // Update car
    updateCar: async (carId, carData) => {
      try {
        const response = await api.put(`/admin/cars/${carId}`, carData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update car');
      }
    },

    // Delete car
    deleteCar: async (carId) => {
      try {
        const response = await api.delete(`/admin/cars/${carId}`);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete car');
      }
    },

    // Upload car images
    uploadCarImages: async (carId, images) => {
      try {
        const formData = new FormData();
        images.forEach(image => {
          formData.append('images', image);
        });

        const response = await api.post(`/admin/cars/${carId}/images`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to upload images');
      }
    },

    // Delete car image
    deleteCarImage: async (imageId) => {
      try {
        const response = await api.delete(`/admin/cars/images/${imageId}`);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete image');
      }
    },

    // Get all locations
    getLocations: async () => {
      try {
        const response = await api.get('/admin/locations');
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch locations');
      }
    }
  }
};

export default carService;