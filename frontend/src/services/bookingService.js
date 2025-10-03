import api from './api';

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create booking' };
  }
};

// Get user bookings (current user's bookings)
export const getUserBookings = async () => {
  try {
    // Use the correct endpoint for getting current user's bookings
    const response = await api.get('/bookings/my', {
      timeout: 8000 // 8 second timeout
    });
    
    return response.data;
  } catch (error) {
    // If timeout or network error, try with shorter timeout as fallback
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      try {
        const retryResponse = await api.get('/bookings/my', {
          timeout: 5000 // 5 second timeout for retry
        });
        return retryResponse.data;
      } catch (retryError) {
        throw { message: 'Server is taking too long to respond. Please try again later.' };
      }
    }
    
    throw error.response?.data || { message: 'Failed to fetch bookings' };
  }
};

// Get bookings for a specific user (admin only)
export const getUserBookingsById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/bookings`, {
      timeout: 8000
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user bookings' };
  }
};

// Get booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch booking details' };
  }
};

// Cancel booking
export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/cancel`);
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw error.response.data;
    } else {
      throw { success: false, message: error.message || 'Failed to cancel booking' };
    }
  }
};

// Check car availability for specific dates
export const checkAvailability = async (carId, startDate, endDate) => {
  try {
    const response = await api.get(`/cars/${carId}/availability`, {
      params: {
        start_date: startDate,
        end_date: endDate
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to check availability' };
  }
};

// Calculate booking cost (client-side only)
// Server will validate and recalculate during booking creation

// Admin functions for booking management
export const getAllBookings = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.status) params.append('status', filters.status);
    if (filters.user_id) params.append('user_id', filters.user_id);
    
    const url = `/admin/bookings${params.toString() ? '?' + params.toString() : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch all bookings' };
  }
};

export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await api.put(`/admin/bookings/${bookingId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update booking status' };
  }
};

export default {
  createBooking,
  getUserBookings,
  getUserBookingsById,
  getBookingById,
  cancelBooking,
  checkAvailability,
  getAllBookings,
  updateBookingStatus
};