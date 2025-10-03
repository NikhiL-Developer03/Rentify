import api from './api';

export const userService = {
  // Admin functions for user management
  admin: {
    // Get all users for admin panel
    getAllUsers: async () => {
      try {
        const response = await api.get('/admin/users');
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
      }
    },

    // Update user role (make admin/remove admin)
    updateUserRole: async (userId, isAdmin) => {
      try {
        const response = await api.put(`/admin/users/${userId}/role`, {
          isAdmin
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update user role');
      }
    },

    // Delete user
    deleteUser: async (userId) => {
      try {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete user');
      }
    },
    
    // Activate user
    activateUser: async (userId) => {
      try {
        const response = await api.put(`/admin/users/${userId}/activate`);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to activate user');
      }
    },
    
    // Deactivate user
    deactivateUser: async (userId) => {
      try {
        const response = await api.put(`/admin/users/${userId}/deactivate`);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to deactivate user');
      }
    }
  },

  // Regular user functions (if needed in the future)
  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
    }
  },

  updateUserProfile: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}/profile`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user profile');
    }
  }
};

export default userService;