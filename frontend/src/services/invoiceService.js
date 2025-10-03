import api from './api';

// Define the service object
const invoiceService = {
  // Admin functions for invoice management
  admin: {
    // Get all invoices with filters
    getAllInvoices: async (filters = {}) => {
      try {
        const params = new URLSearchParams();
        if (filters.userId) params.append('user_id', filters.userId);
        if (filters.month) params.append('month', filters.month);
        if (filters.year) params.append('year', filters.year);
        
        const queryString = params.toString();
        const url = queryString ? `/invoices?${queryString}` : '/invoices';
        
        const response = await api.get(url);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch invoices');
      }
    },

    // Generate invoice for a booking
    generateInvoice: async (bookingId) => {
      try {
        const response = await api.post(`/invoices/${bookingId}`);
        
        // Import event bus and emit an event when an invoice is generated
        try {
          const eventBus = require('../utils/events').default;
          const { EVENTS } = require('../utils/events');
          if (response.data.success && response.data.data) {
            eventBus.emit(EVENTS.INVOICE_GENERATED, response.data.data);
          }
        } catch (eventError) {
          console.warn('Could not emit invoice generated event:', eventError);
        }
        
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to generate invoice');
      }
    },

    // Get specific invoice details
    getInvoice: async (invoiceId) => {
      try {
        const response = await api.get(`/invoices/${invoiceId}`);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch invoice');
      }
    },

    // Download invoice as PDF
    downloadInvoice: async (invoiceId, format = 'pdf') => {
      try {
        const response = await api.get(`/invoices/${invoiceId}/download?format=${format}`, {
          responseType: 'blob'
        });
        
        // Create blob URL and trigger download
        const blob = new Blob([response.data], { 
          type: format === 'pdf' ? 'application/pdf' : 'text/html' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoiceId}.${format}`;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        return { success: true, message: 'Invoice downloaded successfully' };
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to download invoice');
      }
    },

    // Regenerate PDF for invoice
    regeneratePDF: async (invoiceId) => {
      try {
        const response = await api.post(`/invoices/${invoiceId}/regenerate-pdf`);
        return response.data;
      } catch (error) {
        console.error('Error in regeneratePDF:', error);
        throw new Error(error.response?.data?.message || 'Failed to regenerate PDF');
      }
    },

    // Check PDF status for invoice
    checkPDFStatus: async (invoiceId) => {
      try {
        const response = await api.get(`/invoices/${invoiceId}/pdf-status`);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to check PDF status');
      }
    },

    // Update invoice status
    updateInvoiceStatus: async (invoiceId, status) => {
      try {
        const response = await api.put(`/invoices/${invoiceId}/status`, { status });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update invoice status');
      }
    },

    // Send invoice via email
    sendInvoiceEmail: async (invoiceId) => {
      try {
        const response = await api.post(`/invoices/${invoiceId}/send`);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to send invoice email');
      }
    }
  },

  // User functions for accessing their own invoices
  getUserInvoices: async (userId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('user_id', userId);
      if (filters.month) params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      
      const response = await api.get(`/invoices?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user invoices');
    }
  },

  getInvoiceById: async (invoiceId) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch invoice');
    }
  },

  downloadUserInvoice: async (invoiceId, format = 'pdf') => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/download?format=${format}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/html' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.${format}`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      return { success: true, message: 'Invoice downloaded successfully' };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to download invoice');
    }
  }
};

// Export only the default
export default invoiceService;