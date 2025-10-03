// controllers/invoiceController.js
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

// Ensure uploads/invoices directory exists
const ensureInvoicesDirectory = () => {
  const invoicesDir = path.join(__dirname, '..', 'uploads', 'invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }
  return invoicesDir;
};

// Generate PDF from HTML using Puppeteer
const generatePDFFromHTML = async (htmlContent, outputPath) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Generate invoice for booking (admin only)
const generateInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if invoice already exists
    const existingInvoice = await Invoice.findByBookingId(bookingId);
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: 'Invoice already exists for this booking',
        data: existingInvoice
      });
    }
    
    // Generate invoice number
    const cityCode = booking.City ? booking.City.substring(0, 3).toUpperCase() : 'GEN';
    const invoiceNumber = await Invoice.generateInvoiceNumber(cityCode);
    
    // Calculate tax (18% GST)
    const taxRate = 0.18;
    const tax = booking.TotalAmount * taxRate;
    const totalWithTax = booking.TotalAmount + tax;
    
    // Create invoice
    const invoice = await Invoice.create({
      bookingId: parseInt(bookingId),
      invoiceNumber,
      amount: totalWithTax,
      tax: tax,
      pdfPath: `/uploads/invoices/${invoiceNumber}.pdf`
    });
    
    // Get invoice with details for PDF generation
    const invoiceDetails = await Invoice.findById(invoice.Id);
    
    // Generate HTML content
    const htmlContent = generateHTMLInvoice(invoiceDetails);
    
    // Ensure invoices directory exists
    const invoicesDir = ensureInvoicesDirectory();
    const pdfPath = path.join(invoicesDir, `${invoiceNumber}.pdf`);
    
    // Generate actual PDF file
    try {
      await generatePDFFromHTML(htmlContent, pdfPath);
      // PDF generated successfully
    } catch (pdfError) {
      // Log error but don't fail the operation
      // Don't fail the whole operation, but track the error
    }
    
    // Get full details of the invoice for the response
    const fullInvoiceDetails = await Invoice.getFullInvoiceDetails(invoice.Id);
    
    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      data: {
        ...fullInvoiceDetails,
        downloadUrl: `/api/invoices/${invoice.Id}/download`,
        pdfGenerated: fs.existsSync(pdfPath)
      }
    });
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: error.message
    });
  }
};

// Get invoice by ID
const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Check if user owns this invoice (unless admin)
    if (invoice.UserId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      message: 'Invoice retrieved successfully',
      data: {
        ...invoice,
        downloadUrl: `/api/invoices/${id}/download`
      }
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve invoice',
      error: error.message
    });
  }
};

// Download invoice (PDF or HTML)
const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'pdf' } = req.query;
    
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Check if user owns this invoice (unless admin)
    if (invoice.UserId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (format === 'pdf') {
      const pdfPath = path.join(__dirname, '..', 'uploads', 'invoices', `${invoice.InvoiceNumber}.pdf`);
      
      // If PDF doesn't exist, generate it
      if (!fs.existsSync(pdfPath)) {
        try {
          const htmlContent = generateHTMLInvoice(invoice);
          await generatePDFFromHTML(htmlContent, pdfPath);
        } catch (pdfError) {
          console.error('PDF generation failed:', pdfError);
          return res.status(500).json({
            success: false,
            message: 'Failed to generate PDF'
          });
        }
      }
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${invoice.InvoiceNumber}.pdf"`);
      return res.sendFile(pdfPath);
    }
    
    // Generate HTML invoice
    const htmlInvoice = generateHTMLInvoice(invoice);
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlInvoice);
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download invoice',
      error: error.message
    });
  }
};

// Generate HTML invoice template
const generateHTMLInvoice = (invoice) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Invoice ${invoice.InvoiceNumber}</title>
        <meta charset="utf-8">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body { 
                font-family: 'Arial', sans-serif; 
                line-height: 1.6;
                color: #333;
                background: #fff;
            }
            
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                background: #fff;
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
            }
            
            .header h1 {
                color: #2563eb;
                font-size: 36px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .header h2 {
                color: #666;
                font-size: 24px;
                font-weight: normal;
            }
            
            .invoice-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            
            .invoice-details, .company-details {
                flex: 1;
            }
            
            .company-details {
                text-align: right;
            }
            
            .invoice-details h3, .company-details h3 {
                color: #2563eb;
                margin-bottom: 10px;
                font-size: 18px;
            }
            
            .invoice-details p, .company-details p {
                margin-bottom: 5px;
                color: #666;
            }
            
            .invoice-number {
                background: #f8fafc;
                padding: 15px;
                border-left: 4px solid #2563eb;
                margin: 20px 0;
            }
            
            .invoice-number h3 {
                color: #2563eb;
                font-size: 20px;
            }
            
            .table {
                width: 100%;
                border-collapse: collapse;
                margin: 30px 0;
                background: #fff;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .table th {
                background: #2563eb;
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: 600;
            }
            
            .table td {
                padding: 15px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .table tr:nth-child(even) {
                background: #f9fafb;
            }
            
            .table tr:hover {
                background: #f3f4f6;
            }
            
            .total-section {
                margin-top: 30px;
                text-align: right;
            }
            
            .total-row {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 10px;
            }
            
            .total-label {
                width: 200px;
                text-align: right;
                padding-right: 20px;
                font-weight: 600;
            }
            
            .total-amount {
                width: 120px;
                text-align: right;
            }
            
            .final-total {
                border-top: 2px solid #2563eb;
                padding-top: 10px;
                font-size: 20px;
                font-weight: bold;
                color: #2563eb;
            }
            
            .footer {
                margin-top: 50px;
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #666;
            }
            
            .payment-info {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            
            .payment-info h4 {
                color: #2563eb;
                margin-bottom: 10px;
            }
            
            @media print {
                .invoice-container {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="header">
                <h1>RENTIFY</h1>
                <h2>Car Rental Invoice</h2>
            </div>
            
            <div class="invoice-info">
                <div class="invoice-details">
                    <h3>Bill To:</h3>
                    <p><strong>${invoice.UserName || 'N/A'}</strong></p>
                    <p>${invoice.UserEmail || 'N/A'}</p>
                    <p>Phone: ${invoice.UserPhone || 'N/A'}</p>
                </div>
                
                <div class="company-details">
                    <h3>From:</h3>
                    <p><strong>Rentify Car Rentals</strong></p>
                    <p>123 Business Street</p>
                    <p>City, State 12345</p>
                    <p>Phone: +91 9876543210</p>
                    <p>Email: support@rentify.com</p>
                </div>
            </div>
            
            <div class="invoice-number">
                <h3>Invoice #${invoice.InvoiceNumber}</h3>
                <p><strong>Issue Date:</strong> ${new Date(invoice.CreatedAt).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p><strong>Due Date:</strong> ${new Date(new Date(invoice.CreatedAt).getTime() + 30*24*60*60*1000).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
            </div>
            
            <table class="table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Period</th>
                        <th>Days</th>
                        <th>Rate/Day</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>Car Rental Service</strong><br>
                            ${invoice.Make || 'N/A'} ${invoice.Model || 'N/A'}<br>
                            <small>Registration: ${invoice.RegistrationNumber || 'N/A'}</small>
                        </td>
                        <td>
                            ${new Date(invoice.StartDate).toLocaleDateString('en-IN')} to<br>
                            ${new Date(invoice.EndDate).toLocaleDateString('en-IN')}
                        </td>
                        <td>${Math.ceil((new Date(invoice.EndDate) - new Date(invoice.StartDate)) / (1000 * 60 * 60 * 24)) || 1}</td>
                        <td>₹${invoice.BasePricePerDay ? parseFloat(invoice.BasePricePerDay).toFixed(2) : '0.00'}</td>
                        <td>₹${((invoice.Amount || 0) - (invoice.Tax || 0)).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="total-section">
                <div class="total-row">
                    <div class="total-label">Subtotal:</div>
                    <div class="total-amount">₹${((invoice.Amount || 0) - (invoice.Tax || 0)).toFixed(2)}</div>
                </div>
                <div class="total-row">
                    <div class="total-label">GST (18%):</div>
                    <div class="total-amount">₹${(invoice.Tax || 0).toFixed(2)}</div>
                </div>
                <div class="total-row final-total">
                    <div class="total-label">Total Amount:</div>
                    <div class="total-amount">₹${(invoice.Amount || 0).toFixed(2)}</div>
                </div>
            </div>
            
            <div class="payment-info">
                <h4>Payment Information</h4>
                <p><strong>Status:</strong> ${invoice.Status || 'Pending'}</p>
                <p><strong>Payment Method:</strong> ${invoice.PaymentMethod || 'To be determined'}</p>
                <p>Please ensure payment is made within 30 days of the invoice date.</p>
            </div>
            
            <div class="footer">
                <p><strong>Thank you for choosing Rentify!</strong></p>
                <p>For any queries, please contact us at support@rentify.com or +91 9876543210</p>
                <p style="margin-top: 10px; font-size: 12px;">
                    This is a computer-generated invoice. No signature required.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Get all invoices (admin)
const getAllInvoices = async (req, res) => {
  try {
    const filters = {
      userId: req.query.user_id ? parseInt(req.query.user_id) : null,
      month: req.query.month ? parseInt(req.query.month) : null,
      year: req.query.year ? parseInt(req.query.year) : null
    };
    
    // Remove null filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === null) delete filters[key];
    });
    
    const invoices = await Invoice.getAll(filters);
    
    // Check PDF status for each invoice
    const invoicesWithPDFStatus = invoices.map(invoice => {
      const pdfPath = path.join(__dirname, '..', 'uploads', 'invoices', `${invoice.InvoiceNumber}.pdf`);
      const pdfExists = fs.existsSync(pdfPath);
      
      return {
        ...invoice,
        pdfExists,
        downloadUrl: `/api/invoices/${invoice.Id}/download?format=pdf`,
        pdfStatusUrl: `/api/invoices/${invoice.Id}/pdf-status`
      };
    });
    
    res.json({
      success: true,
      message: 'Invoices retrieved successfully',
      data: invoicesWithPDFStatus,
      filters
    });
  } catch (error) {
    console.error('Get all invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve invoices',
      error: error.message
    });
  }
};

// Update invoice status (admin)
const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'paid', 'cancelled', 'overdue'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }
    
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    const updatedInvoice = await Invoice.updateStatus(id, status);
    
    res.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: updatedInvoice
    });
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice status',
      error: error.message
    });
  }
};

// Send invoice via email (admin)
const sendInvoiceEmail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Email functionality is not implemented in this version
    // Return a more accurate response
    res.json({
      success: false,
      message: 'Email functionality not available in current version',
      invoice: {
        id: invoice.Id,
        invoiceNumber: invoice.InvoiceNumber
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process invoice',
      error: error.message
    });
  }
};

// Regenerate PDF for existing invoice (admin)
const regeneratePDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    // Generate HTML content
    const htmlContent = generateHTMLInvoice(invoice);
    
    // Ensure invoices directory exists
    const invoicesDir = ensureInvoicesDirectory();
    const pdfPath = path.join(invoicesDir, `${invoice.InvoiceNumber}.pdf`);
    
    // Generate PDF file
    try {
      await generatePDFFromHTML(htmlContent, pdfPath);
      
      res.json({
        success: true,
        message: 'PDF regenerated successfully',
        data: {
          invoiceId: id,
          invoiceNumber: invoice.InvoiceNumber,
          pdfPath: `/uploads/invoices/${invoice.InvoiceNumber}.pdf`,
          downloadUrl: `/api/invoices/${id}/download?format=pdf`
        }
      });
    } catch (pdfError) {
      console.error('PDF regeneration failed:', pdfError);
      res.status(500).json({
        success: false,
        message: 'Failed to regenerate PDF',
        error: pdfError.message
      });
    }
  } catch (error) {
    console.error('Regenerate PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate PDF',
      error: error.message
    });
  }
};

// Check PDF status for invoice (admin)
const checkPDFStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    const pdfPath = path.join(__dirname, '..', 'uploads', 'invoices', `${invoice.InvoiceNumber}.pdf`);
    const pdfExists = fs.existsSync(pdfPath);
    
    let fileSize = null;
    let createdAt = null;
    
    if (pdfExists) {
      const stats = fs.statSync(pdfPath);
      fileSize = stats.size;
      createdAt = stats.birthtime;
    }
    
    res.json({
      success: true,
      data: {
        invoiceId: id,
        invoiceNumber: invoice.InvoiceNumber,
        pdfExists,
        fileSize,
        createdAt,
        downloadUrl: pdfExists ? `/api/invoices/${id}/download?format=pdf` : null
      }
    });
  } catch (error) {
    console.error('Check PDF status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check PDF status',
      error: error.message
    });
  }
};



module.exports = {
  generateInvoice,
  getInvoice,
  downloadInvoice,
  getAllInvoices,
  updateInvoiceStatus,
  sendInvoiceEmail,
  regeneratePDF,
  checkPDFStatus
};