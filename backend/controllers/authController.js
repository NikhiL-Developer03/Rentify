// controllers/authController.js
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// User registration
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create new user
    const newUser = await User.create({
      name,
      email,
      phone,
      password,
      isAdmin: false
    });
    
    // Generate token
    const token = generateToken(newUser.Id);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.Id,
          name: newUser.Name,
          email: newUser.Email,
          phone: newUser.Phone,
          isAdmin: newUser.IsAdmin,
          createdAt: newUser.CreatedAt,
          updatedAt: newUser.UpdatedAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle unique constraint violation
    if (error.message.includes('UNIQUE KEY constraint')) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// User login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if account is active
    if (!user.IsActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact admin.'
      });
    }
    
    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.PasswordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate token
    const token = generateToken(user.Id);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.Id,
          name: user.Name,
          email: user.Email,
          phone: user.Phone,
          isAdmin: user.IsAdmin,
          createdAt: user.CreatedAt,
          updatedAt: user.UpdatedAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: user.Id,
        name: user.Name,
        email: user.Email,
        phone: user.Phone,
        isAdmin: user.IsAdmin,
        createdAt: user.CreatedAt,
        updatedAt: user.UpdatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Check if email is taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.Id !== req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another user'
        });
      }
    }
    
    const updatedUser = await User.update(req.user.id, {
      name: name || req.user.name,
      email: email || req.user.email,
      phone: phone || req.user.phone
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.Id,
        name: updatedUser.Name,
        email: updatedUser.Email,
        phone: updatedUser.Phone,
        isAdmin: updatedUser.IsAdmin,
        createdAt: updatedUser.CreatedAt,
        updatedAt: updatedUser.UpdatedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Make user admin (for development/testing)
const makeAdmin = async (req, res) => {
  try {
    const { email, secret } = req.body;
    
    // Validate secret key
    if (secret !== 'RENTIFY') {
      return res.status(403).json({
        success: false,
        message: 'Invalid secret key'
      });
    }
    
    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is already admin
    if (user.IsAdmin) {
      return res.status(400).json({
        success: false,
        message: 'User is already an admin'
      });
    }
    
    // Update user to admin
    const updatedUser = await User.makeAdmin(user.Id);
    
    res.json({
      success: true,
      message: 'User successfully made admin. Please login again to get admin privileges.',
      data: {
        user: {
          id: updatedUser.Id,
          name: updatedUser.Name,
          email: updatedUser.Email,
          phone: updatedUser.Phone,
          isAdmin: updatedUser.IsAdmin,
          createdAt: updatedUser.CreatedAt,
          updatedAt: updatedUser.UpdatedAt
        }
      }
    });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to make user admin',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  makeAdmin
};