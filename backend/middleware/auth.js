// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set timeout for database operations
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database request timeout')), 5000);
    });
    
    // Get user details with timeout
    const userPromise = User.findById(decoded.userId);
    
    // Race the user fetch against the timeout
    const user = await Promise.race([userPromise, timeoutPromise]);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }
    
    // Check if user is active
    if (!user.IsActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact admin.'
      });
    }
    
    // Add user to request object
    req.user = {
      id: user.Id,
      name: user.Name,
      email: user.Email,
      phone: user.Phone,
      isAdmin: user.IsAdmin,
      isActive: user.IsActive
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    // Handle timeout errors specifically
    if (error.message === 'Database request timeout') {
      console.error('Auth middleware timeout error:', error);
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Please try again.'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }-
  
  next();
};

// Optional authentication (for routes that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Set timeout for database operations
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database request timeout')), 5000);
      });
      
      // Get user details with timeout
      const userPromise = User.findById(decoded.userId);
      
      // Race the user fetch against the timeout
      const user = await Promise.race([userPromise, timeoutPromise]);
      
      if (user) {
        req.user = {
          id: user.Id,
          name: user.Name,
          email: user.Email,
          phone: user.Phone,
          isAdmin: user.IsAdmin
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};