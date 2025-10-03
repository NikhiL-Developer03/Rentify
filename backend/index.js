// index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const { sql, poolPromise } = require("./config/db");
require("dotenv").config();
const authRoutes = require('./routers/authRoutes');
const carRoutes = require('./routers/carRoutes');
const bookingRoutes = require('./routers/bookingRoutes');
const userRoutes = require('./routers/userRoutes');
const adminRoutes = require('./routers/adminRoutes');
const locationRoutes = require('./routers/locationRoutes');
const reviewRoutes = require('./routers/reviewRoutes');
const invoiceRoutes = require('./routers/invoiceRoutes');
const paymentRoutes = require('./routers/paymentRoutes');

const app = express();

// Middleware
app.use(cors());              // allow frontend 
app.use(express.json());      // parse JSON body requests
app.use(express.urlencoded({ extended: true })); // parse URL-encoded bodies

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "✅ Rentify API is running and connected to SQL Server",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      cars: "/api/cars", 
      bookings: "/api/bookings",
      users: "/api/users",
      admin: "/api/admin",
      locations: "/api/locations",
      reviews: "/api/reviews",
      invoices: "/api/invoices",
      payments: "/api/payments"
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/cars',
      'GET /api/cars/:id',
      'POST /api/bookings',
      'GET /api/admin/cars (admin only)',
      'POST /api/admin/cars (admin only)'
    ]
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 File uploads directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`🔗 API Documentation available at http://localhost:${PORT}`);
});
