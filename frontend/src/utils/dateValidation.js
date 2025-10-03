// Date validation utilities for booking system

/**
 * Validates if a date range is valid for booking (1-30 days)
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {object} - Validation result with isValid and errors
 */
export const validateBookingDates = (startDate, endDate) => {
  const errors = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Check if dates are valid
  if (isNaN(start.getTime())) {
    errors.push('Start date is invalid');
  }
  
  if (isNaN(end.getTime())) {
    errors.push('End date is invalid');
  }
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  // Start date must be today or in the future
  if (start < today) {
    errors.push('Start date cannot be in the past');
  }
  
  // End date must be after start date
  if (end <= start) {
    errors.push('End date must be after start date');
  }
  
  // Calculate duration
  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  // Duration must be between 1 and 30 days
  if (duration < 1) {
    errors.push('Booking duration must be at least 1 day');
  }
  
  if (duration > 30) {
    errors.push('Booking duration cannot exceed 30 days');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    duration
  };
};

/**
 * Calculate the number of days between two dates
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {number} - Number of days
 */
export const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }
  
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  // Handle null or undefined input
  if (!dateString) {
    return 'Not specified';
  }
  
  // Handle different date formats
  let date;
  
  if (typeof dateString === 'object' && dateString instanceof Date) {
    date = dateString;
  } else if (typeof dateString === 'string') {
    // Try to parse various date formats
    if (dateString.includes('T')) {
      // ISO format with time
      date = new Date(dateString);
    } else if (dateString.includes('-')) {
      // YYYY-MM-DD format
      const [year, month, day] = dateString.split('-');
      date = new Date(year, month - 1, day);
    } else if (dateString.includes('/')) {
      // MM/DD/YYYY format
      const [month, day, year] = dateString.split('/');
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
    }
  } else {
    date = new Date(dateString);
  }
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format date for input field (YYYY-MM-DD)
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
export const formatDateForInput = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  return date.toISOString().split('T')[0];
};

/**
 * Get minimum date for booking (today)
 * @returns {string} - Formatted date string for input
 */
export const getMinBookingDate = () => {
  return formatDateForInput(new Date());
};

/**
 * Get maximum date for booking (30 days from now)
 * @returns {string} - Formatted date string for input
 */
export const getMaxBookingDate = () => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  return formatDateForInput(maxDate);
};

/**
 * Get suggested end date (1 day after start date)
 * @param {string} startDate - ISO date string
 * @returns {string} - Formatted date string for input
 */
export const getSuggestedEndDate = (startDate) => {
  const start = new Date(startDate);
  
  if (isNaN(start.getTime())) {
    return '';
  }
  
  const endDate = new Date(start);
  endDate.setDate(start.getDate() + 1);
  
  return formatDateForInput(endDate);
};

/**
 * Check if date is a weekend
 * @param {string} dateString - ISO date string
 * @returns {boolean} - True if weekend
 */
export const isWeekend = (dateString) => {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
};

/**
 * Calculate total cost with taxes and fees
 * @param {number} dailyRate - Daily rental rate
 * @param {number} days - Number of days
 * @param {number} taxRate - Tax rate (default 18% GST)
 * @returns {object} - Cost breakdown
 */
export const calculateTotalCost = (dailyRate, days, taxRate = 0.18) => {
  const subtotal = dailyRate * days;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    days
  };
};