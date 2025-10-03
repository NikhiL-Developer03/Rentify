// routers/adminRoutes.js
const express = require('express');
const {
  createCar,
  updateCar,
  deleteCar,
  getAllCars,
  getCarById,
  uploadCarImages,
  deleteCarImage,
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
  toggleUserRole,
  deleteUser,
  activateUser,
  deactivateUser,
  getAllLocations,
  createLocation,
  addMaintenance,
  getCarMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getBookingsReport,
  getRevenueReport,
  exportBookingsReport,
  exportRevenueReport,
  getDashboardStats,
  getRecentActivity,
  testDatabaseData
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadCarImages: multerUpload } = require('../middleware/multer');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Car management
router.post('/cars', createCar);
router.get('/cars', getAllCars);
router.get('/cars/:id', getCarById);
router.put('/cars/:id', updateCar);
router.delete('/cars/:id', deleteCar);
router.post('/cars/:carId/images', multerUpload.array('images', 10), uploadCarImages);
router.delete('/cars/images/:imageId', deleteCarImage);

// Booking management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', toggleUserRole);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/activate', activateUser);
router.put('/users/:id/deactivate', deactivateUser);

// Location management
router.get('/locations', getAllLocations);
router.post('/locations', createLocation);

// Maintenance management
router.post('/maintenance', addMaintenance);
router.get('/maintenance/:carId', getCarMaintenance);
router.put('/maintenance/:id', updateMaintenance);
router.delete('/maintenance/:id', deleteMaintenance);

// Reports
router.get('/reports/bookings', getBookingsReport);
router.get('/reports/revenue', getRevenueReport);

// Export routes
router.get('/reports/export/bookings', exportBookingsReport);
router.get('/reports/export/revenue', exportRevenueReport);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/recent-activity', getRecentActivity);

// Test route to check database data
router.get('/test/database', testDatabaseData);

module.exports = router;