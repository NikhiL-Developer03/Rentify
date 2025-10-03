import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download,
  FileText,
  Search,
  Filter,
  Calendar,
  IndianRupee,
  User,
  Car as CarIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Send,
  RefreshCw,
  FileCheck,
  FileX,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-toastify';
import invoiceService from '../../services/invoiceService';
import eventBus, { EVENTS } from '../../utils/events';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchInvoices();
    
    // Listen for booking completed events from BookingManagement component
    const handleBookingCompleted = (event) => {
      console.log('Booking completed event received', event.detail);
      // Refresh invoice list when a booking is completed
      fetchInvoices();
    };
    
    // Listen for invoice generated events 
    const handleInvoiceGenerated = (event) => {
      console.log('Invoice generated event received', event.detail);
      // Refresh invoice list when a new invoice is generated
      fetchInvoices();
    };
    
    // Set up event listeners using both legacy and new event bus
    window.addEventListener('bookingCompleted', handleBookingCompleted);
    const unsubscribeInvoiceGenerated = eventBus.on(EVENTS.INVOICE_GENERATED, handleInvoiceGenerated);
    
    // Check for invoices every 5 seconds to catch any we might have missed
    const refreshInterval = setInterval(() => {
      fetchInvoices();
    }, 5000);
    
    // Cleanup
    return () => {
      window.removeEventListener('bookingCompleted', handleBookingCompleted);
      eventBus.off(EVENTS.INVOICE_GENERATED, handleInvoiceGenerated);
      clearInterval(refreshInterval);
    };
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // Clear the current invoices to ensure we don't keep old data if the fetch fails
      setInvoices([]);
      
      const filters = {};
      if (dateFilter !== 'all') {
        const now = new Date();
        if (dateFilter === 'month') {
          filters.month = now.getMonth() + 1;
          filters.year = now.getFullYear();
        } else if (dateFilter === 'year') {
          filters.year = now.getFullYear();
        }
      }
      
      console.log('Fetching invoices with filters:', filters);
      const response = await invoiceService.admin.getAllInvoices(filters);
      
      if (response.success) {
        console.log(`Successfully fetched ${response.data.length} invoices`);
        
        // Map backend fields to frontend expected fields
        const mappedInvoices = response.data.map(invoice => {
          // Calculate total days (safely)
          let totalDays = 1;
          if (invoice.StartDate && invoice.EndDate) {
            const startDate = new Date(invoice.StartDate);
            const endDate = new Date(invoice.EndDate);
            totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
          }
          
          // Calculate tax amount from invoice data
          const taxAmount = invoice.Tax || 0;
          const taxPercentage = invoice.TotalAmount > 0 ? ((taxAmount / (invoice.TotalAmount - taxAmount)) * 100).toFixed(1) : 0;
          
          return {
            ...invoice,
            CustomerName: invoice.UserName || 'N/A',
            CustomerEmail: invoice.UserEmail || 'N/A',
            CustomerPhone: invoice.UserPhone || 'N/A',
            CarDetails: invoice.Make && invoice.Model ? `${invoice.Make} ${invoice.Model}` : 'N/A',
            TotalDays: totalDays,
            TaxAmount: taxAmount,
            TaxPercentage: taxPercentage,
            ExtraCharges: 0 // Default to 0 if not provided
          };
        });
        setInvoices(mappedInvoices);
      } else {
        toast.error(response.message || 'Failed to load invoices');
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast.error(error.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  // Track which booking is having an invoice generated
  const [generatingInvoiceId, setGeneratingInvoiceId] = useState(null);
  
  const generateInvoice = async (bookingId) => {
    try {
      setLoading(true);
      setGeneratingInvoiceId(bookingId);
      
      toast.info('Generating invoice, please wait...', { autoClose: 2000 });
      
      const response = await invoiceService.admin.generateInvoice(bookingId);
      if (response.success) {
        toast.success('Invoice generated successfully');
        
        // Ensure UI updates with the new invoice by adding a slight delay before refresh
        setTimeout(() => {
          fetchInvoices();
        }, 500);
        
        // If response contains the new invoice data, add it directly to state
        if (response.data && response.data.Id) {
          console.log('New invoice created:', response.data);
          
          // Process the invoice for immediate display
          const newInvoice = {
            ...response.data,
            CustomerName: response.data.UserName || 'N/A',
            CustomerEmail: response.data.UserEmail || 'N/A',
            CustomerPhone: response.data.UserPhone || 'N/A',
            CarDetails: response.data.Make && response.data.Model 
              ? `${response.data.Make} ${response.data.Model}` 
              : 'N/A',
            TotalDays: response.data.TotalDays || 1,
            TaxAmount: response.data.Tax || 0,
            ExtraCharges: 0
          };
          
          // Add to existing invoices at the top of the list
          setInvoices(prevInvoices => {
            // Remove duplicates (in case this invoice was already in the list)
            const filteredInvoices = prevInvoices.filter(inv => inv.Id !== newInvoice.Id);
            return [newInvoice, ...filteredInvoices];
          });
          
          // Force another refresh after a longer delay to ensure everything is synchronized
          setTimeout(() => {
            fetchInvoices();
          }, 2000);
        } else {
          // If we didn't get invoice data in the response, fetch all invoices
          fetchInvoices();
        }
      } else {
        toast.error(response.message || 'Failed to generate invoice');
        fetchInvoices(); // Still refresh to ensure our view is up to date
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error(error.message || 'Failed to generate invoice');
      fetchInvoices(); // Still refresh to ensure our view is up to date
    } finally {
      setLoading(false);
      setGeneratingInvoiceId(null);
    }
  };

  const downloadInvoice = async (invoiceId, format = 'pdf') => {
    try {
      await invoiceService.admin.downloadInvoice(invoiceId, format);
      toast.success(`Invoice downloaded successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error(error.message || 'Failed to download invoice');
    }
  };

  const regeneratePDF = async (invoiceId) => {
    setLoading(true);
    try {
      // Add debug logging
      console.log('invoiceService:', invoiceService);
      console.log('invoiceService.admin:', invoiceService.admin);
      console.log('Attempting to regenerate PDF for invoice:', invoiceId);
      
      if (!invoiceService.admin.regeneratePDF) {
        console.error('regeneratePDF function is not defined in invoiceService.admin');
        toast.error('This function is not available. Please check the console for details.');
        setLoading(false);
        return;
      }
      
      const response = await invoiceService.admin.regeneratePDF(invoiceId);
      if (response.success) {
        toast.success('PDF regenerated successfully');
        fetchInvoices(); // Refresh to update PDF status
      } else {
        toast.error(response.message || 'Failed to regenerate PDF');
      }
    } catch (error) {
      console.error('Error regenerating PDF:', error);
      toast.error(error.message || 'Failed to regenerate PDF');
    } finally {
      setLoading(false);
    }
  };

  const checkPDFStatus = async (invoiceId) => {
    try {
      const response = await invoiceService.admin.checkPDFStatus(invoiceId);
      if (response.success) {
        const { data } = response;
        const statusMessage = data.pdfExists 
          ? `PDF exists (${data.fileSize ? Math.round(data.fileSize / 1024) : 'unknown'} KB, created: ${data.createdAt ? new Date(data.createdAt).toLocaleString() : 'unknown'})`
          : 'PDF does not exist';
        toast.info(statusMessage);
      }
    } catch (error) {
      console.error('Error checking PDF status:', error);
      toast.error(error.message || 'Failed to check PDF status');
    }
  };

  const sendInvoiceEmail = async (invoiceId) => {
    setLoading(true);
    try {
      const response = await invoiceService.admin.sendInvoiceEmail(invoiceId);
      if (response.success) {
        toast.success('Invoice sent via email successfully');
      } else {
        toast.error(response.message || 'Failed to send invoice');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error(error.message || 'Failed to send invoice');
    } finally {
      setLoading(false);
    }
  };

  const updateInvoiceStatus = async (invoiceId, status) => {
    try {
      const response = await invoiceService.admin.updateInvoiceStatus(invoiceId, status);
      if (response.success) {
        toast.success('Invoice status updated');
        fetchInvoices();
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      (invoice.InvoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.CustomerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.CarDetails || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.UserName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${invoice.Make || ''} ${invoice.Model || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.Status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all' && invoice.CreatedAt) {
      const invoiceDate = new Date(invoice.CreatedAt);
      const now = new Date();
      const daysDiff = Math.floor((now - invoiceDate) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(i => i.Status === 'paid').length;
  const pendingInvoices = invoices.filter(i => i.Status === 'pending').length;
  const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.TotalAmount || 0), 0);
  const paidAmount = invoices.filter(i => i.Status === 'paid').reduce((sum, invoice) => sum + (invoice.TotalAmount || 0), 0);

  const InvoiceDetails = ({ invoice, onClose }) => (
    <Card className="fixed inset-0 z-50 overflow-y-auto bg-white">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle>Invoice Details - {invoice.InvoiceNumber}</CardTitle>
          <Button variant="outline" onClick={onClose}>
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {invoice.CustomerName}</p>
              <p><span className="font-medium">Email:</span> {invoice.CustomerEmail}</p>
              <p><span className="font-medium">Phone:</span> {invoice.CustomerPhone}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Booking Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Car:</span> {invoice.CarDetails}</p>
              <p><span className="font-medium">Start Date:</span> {invoice.StartDate ? new Date(invoice.StartDate).toLocaleDateString() : 'N/A'}</p>
              <p><span className="font-medium">End Date:</span> {invoice.EndDate ? new Date(invoice.EndDate).toLocaleDateString() : 'N/A'}</p>
              <p><span className="font-medium">Days:</span> {invoice.TotalDays}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Invoice Breakdown</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Base Amount ({invoice.TotalDays} days × ₹{invoice.BasePricePerDay || 0})</span>
              <span>₹{((invoice.TotalDays || 1) * (invoice.BasePricePerDay || 0)).toLocaleString()}</span>
            </div>
            {(invoice.ExtraCharges || 0) > 0 && (
              <div className="flex justify-between">
                <span>Extra Charges</span>
                <span>₹{(invoice.ExtraCharges || 0).toLocaleString()}</span>
              </div>
            )}
            {(invoice.TaxAmount || 0) > 0 && (
              <div className="flex justify-between">
                <span>Tax ({invoice.TaxPercentage || 0}%)</span>
                <span>₹{(invoice.TaxAmount || 0).toLocaleString()}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Amount</span>
              <span>₹{(invoice.TotalAmount || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadInvoice(invoice.Id, 'pdf')}
          >
            <Download className="mr-1 h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadInvoice(invoice.Id, 'html')}
          >
            <FileText className="mr-1 h-4 w-4" />
            HTML
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => regeneratePDF(invoice.Id)}
            disabled={loading}
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            Regenerate PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => checkPDFStatus(invoice.Id)}
          >
            {invoice.pdfExists ? <FileCheck className="mr-1 h-4 w-4" /> : <FileX className="mr-1 h-4 w-4" />}
            PDF Status
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Email functionality coming soon')}
          >
            <Send className="mr-1 h-4 w-4" />
            Send Email
          </Button>
          {invoice.Status !== 'paid' && (
            <Button
              size="sm"
              onClick={() => updateInvoiceStatus(invoice.Id, 'paid')}
              className="bg-green-600 hover:bg-green-700"
            >
              Mark as Paid
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoice Management</h2>
        <Button onClick={fetchInvoices} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-xl font-bold">{totalInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-xl font-bold">{paidInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{pendingInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <IndianRupee className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-xl font-bold">₹{(totalAmount || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="text-xl font-bold">₹{(paidAmount || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice number, customer name, or car..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.Id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(invoice.Status)}
                    <h3 className="text-lg font-semibold">{invoice.InvoiceNumber}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.Status)}`}>
                      {invoice.Status}
                    </span>
                    {invoice.pdfExists && (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 flex items-center">
                        <FileCheck className="mr-1 h-3 w-3" />
                        PDF Ready
                      </span>
                    )}
                    {!invoice.pdfExists && (
                      <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 flex items-center">
                        <FileX className="mr-1 h-3 w-3" />
                        No PDF
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      {invoice.CustomerName}
                    </div>
                    <div className="flex items-center">
                      <CarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {invoice.CarDetails}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {invoice.CreatedAt ? new Date(invoice.CreatedAt).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="flex items-center">
                      <IndianRupee className="mr-2 h-4 w-4 text-muted-foreground" />
                      ₹{invoice.TotalAmount?.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setShowDetails(true);
                    }}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadInvoice(invoice.Id, 'pdf')}
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => regeneratePDF(invoice.Id)}
                    disabled={loading}
                    title="Regenerate PDF"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => checkPDFStatus(invoice.Id)}
                    title="Check PDF Status"
                  >
                    {invoice.pdfExists ? <FileCheck className="h-4 w-4 text-green-600" /> : <FileX className="h-4 w-4 text-red-600" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendInvoiceEmail(invoice.Id)}
                    title="Send Email"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  {invoice.Status !== 'paid' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateInvoiceStatus(invoice.Id, 'paid')}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      title="Mark as Paid"
                    >
                      Pay
                    </Button>
                  )}
                  {invoice.Status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateInvoiceStatus(invoice.Id, 'cancelled')}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredInvoices.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Invoices Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'No invoices match your search criteria.'
                  : 'Invoices will appear here as bookings are completed.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Invoice Details Modal */}
      {showDetails && selectedInvoice && (
        <InvoiceDetails
          invoice={selectedInvoice}
          onClose={() => {
            setShowDetails(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
};

export default InvoiceManagement;