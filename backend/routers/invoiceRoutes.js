// routers/invoiceRoutes.js
const express = require('express');
const {
  generateInvoice,
  getInvoice,
  downloadInvoice,
  getAllInvoices,
  updateInvoiceStatus,
  sendInvoiceEmail,
  regeneratePDF,
  checkPDFStatus
} = require('../controllers/invoiceController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All invoice routes require authentication
router.use(authenticateToken);

// Invoice routes
router.post('/:bookingId', requireAdmin, generateInvoice);
router.get('/:id', getInvoice);
router.get('/:id/download', downloadInvoice);
router.put('/:id/status', requireAdmin, updateInvoiceStatus);
router.post('/:id/send', requireAdmin, sendInvoiceEmail);

// PDF management routes (admin only)
router.post('/:id/regenerate-pdf', requireAdmin, regeneratePDF);
router.get('/:id/pdf-status', requireAdmin, checkPDFStatus);

// Admin routes
router.get('/', requireAdmin, getAllInvoices);

module.exports = router;