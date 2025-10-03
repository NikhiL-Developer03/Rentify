// Admin service for handling admin-specific API calls
import api from './api';

export const adminService = {
  // Reports
  reports: {
    // Get bookings report with date range
    getBookingsReport: async (startDate, endDate) => {
      try {

        const response = await api.get(`/admin/reports/bookings?startDate=${startDate}&endDate=${endDate}`);

        return response.data;
      } catch (error) {
        console.error('Bookings report API error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch bookings report');
      }
    },

    // Get revenue report with date range
    getRevenueReport: async (startDate, endDate) => {
      try {

        const response = await api.get(`/admin/reports/revenue?startDate=${startDate}&endDate=${endDate}`);

        return response.data;
      } catch (error) {
        console.error('Revenue report API error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch revenue report');
      }
    },

    // Export bookings report as Excel
    exportBookingsReport: async (startDate, endDate) => {
      try {
        const response = await api.get(`/admin/reports/export/bookings?startDate=${startDate}&endDate=${endDate}`, {
          responseType: 'blob'
        });
        
        // Create blob URL and trigger download
        const blob = new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings-report-${startDate}-to-${endDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return { success: true, message: 'Bookings report exported successfully' };
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to export bookings report');
      }
    },

    // Export revenue report as Excel
    exportRevenueReport: async (startDate, endDate) => {
      try {
        const response = await api.get(`/admin/reports/export/revenue?startDate=${startDate}&endDate=${endDate}`, {
          responseType: 'blob'
        });
        
        // Create blob URL and trigger download
        const blob = new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revenue-report-${startDate}-to-${endDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return { success: true, message: 'Revenue report exported successfully' };
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to export revenue report');
      }
    },

    // Get combined report data
    getCombinedReports: async (startDate, endDate) => {
      try {

        
        const [bookingsData, revenueData] = await Promise.all([
          adminService.reports.getBookingsReport(startDate, endDate),
          adminService.reports.getRevenueReport(startDate, endDate)
        ]);




        if (bookingsData.success && revenueData.success) {
          const combinedResult = {
            success: true,
            data: {
              period: { startDate, endDate },
              monthlyBookings: bookingsData.data.monthlyBookings || [],
              monthlyRevenue: revenueData.data.monthlyRevenue || [],
              cityWiseStats: revenueData.data.cityWiseStats || [],
              carCategoryStats: bookingsData.data.carCategoryStats || [],
              userStats: bookingsData.data.userStats || {},
              revenueStats: revenueData.data.revenueStats || {},
              bookingStats: bookingsData.data.bookingStats || {}
            }
          };
          

          return combinedResult;
        } else {
          throw new Error('Failed to fetch report data');
        }
      } catch (error) {
        console.error('Error in getCombinedReports:', error);
        throw new Error(error.message || 'Failed to fetch combined reports');
      }
    }
  },

  // Car Management
  cars: {
    getAll: async () => {
      try {
        const response = await api.get('/admin/cars');
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch cars');
      }
    },

    create: async (carData) => {
      try {
        const response = await api.post('/admin/cars', carData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create car');
      }
    },

    update: async (carId, carData) => {
      try {
        const response = await api.put(`/admin/cars/${carId}`, carData);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update car');
      }
    },

    delete: async (carId) => {
      try {
        const response = await api.delete(`/admin/cars/${carId}`);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete car');
      }
    }
  },

  // User Management
  users: {
    getAll: async () => {
      try {
        const response = await api.get('/admin/users');
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
      }
    },

    toggleRole: async (userId) => {
      try {
        const response = await api.put(`/admin/users/${userId}/role`);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to toggle user role');
      }
    },

    delete: async (userId) => {
      try {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  },

  // Booking Management
  bookings: {
    getAll: async () => {
      try {
        const response = await api.get('/admin/bookings');
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
      }
    },

    updateStatus: async (bookingId, status) => {
      try {
        const response = await api.put(`/admin/bookings/${bookingId}/status`, { status });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update booking status');
      }
    }
  },

  // Dashboard
  dashboard: {
    // Get dashboard statistics
    getStats: async () => {
      try {

        const response = await api.get('/admin/dashboard/stats');

        return response.data;
      } catch (error) {
        console.error('Dashboard stats API error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
      }
    },

    // Get recent activity
    getRecentActivity: async (limit = 10) => {
      try {

        const response = await api.get(`/admin/dashboard/recent-activity?limit=${limit}`);

        return response.data;
      } catch (error) {
        console.error('Recent activity API error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch recent activity');
      }
    }
  }
};

export default adminService;