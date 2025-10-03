import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  Car as CarIcon,
  User,
  MapPin,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllBookings, updateBookingStatus } from '../../services/bookingService';
import eventBus, { EVENTS } from '../../utils/events';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [processingBookings, setProcessingBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      const data = await getAllBookings(filters);
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error(error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatusHandler = async (bookingId, status) => {
    try {
      // Add booking ID to processing array to show loading state
      setProcessingBookings(prev => [...prev, bookingId]);
      
      const data = await updateBookingStatus(bookingId, status);
      if (data.success) {
        if (status === 'completed') {
          toast.success('Booking completed and invoice generated automatically');
        } else {
          toast.success('Booking status updated');
        }
        fetchBookings();
        
        // If we completed the booking, dispatch a custom event to notify InvoiceManagement component
        if (status === 'completed') {
          // Use both the old method for backward compatibility and the new event bus
          const event = new CustomEvent('bookingCompleted', { detail: { bookingId } });
          window.dispatchEvent(event);
          
          // Also emit through our event bus
          eventBus.emit(EVENTS.BOOKING_COMPLETED, { bookingId });
          
          // Show message about invoice
          toast.info('An invoice has been generated. Check Invoice Management section.');
        }
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      // Remove booking ID from processing array
      setProcessingBookings(prev => prev.filter(id => id !== bookingId));
    }
  };

  const filteredBookings = bookings.filter(booking => {
    // Create searchable fields from actual backend data
    const bookingNumber = `BK${booking.Id?.toString().padStart(4, '0')}`;
    const customerName = booking.UserName || '';
    const carDetails = `${booking.Make || ''} ${booking.Model || ''} (${booking.RegistrationNumber || ''})`;
    
    const matchesSearch = bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         carDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.UserEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.Status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.Status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.Status === 'pending').length;
  const completedBookings = bookings.filter(b => b.Status === 'completed').length;

  const BookingDetails = ({ booking, onClose }) => {
    const bookingNumber = `BK${booking.Id?.toString().padStart(4, '0')}`;
    const carDetails = `${booking.Make || ''} ${booking.Model || ''} (${booking.RegistrationNumber || ''})`;
    const location = `${booking.City || ''}, ${booking.State || ''}`;
    
    return (
      <Card className="fixed inset-0 z-50 overflow-y-auto bg-white">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>Booking Details - {bookingNumber}</CardTitle>
            <Button variant="outline" onClick={onClose}>×</Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {booking.UserName}</p>
                <p><span className="font-medium">Email:</span> {booking.UserEmail}</p>
                <p><span className="font-medium">Phone:</span> {booking.UserPhone || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Booking Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Car:</span> {carDetails}</p>
                <p><span className="font-medium">Pickup Date:</span> {new Date(booking.StartDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Return Date:</span> {new Date(booking.EndDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Location:</span> {location}</p>
                <p><span className="font-medium">Total Amount:</span> ₹{booking.TotalAmount?.toLocaleString()}</p>
              </div>
            </div>
          </div>

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => updateBookingStatusHandler(booking.Id, 'confirmed')}
            disabled={booking.Status === 'confirmed' || booking.Status === 'completed'}
          >
            Confirm Booking
          </Button>
          <Button
            variant="destructive"
            onClick={() => updateBookingStatusHandler(booking.Id, 'cancelled')}
            disabled={booking.Status === 'cancelled' || booking.Status === 'completed'}
          >
            Cancel Booking
          </Button>
          {booking.Status === 'confirmed' && (
            <Button
              onClick={() => updateBookingStatusHandler(booking.Id, 'completed')}
            >
              Mark Completed
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Booking Management</h2>
        <Button onClick={fetchBookings} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">{confirmedBookings}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingBookings}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedBookings}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
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
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.Id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(booking.Status)}
                    <h3 className="text-lg font-semibold">BK{booking.Id?.toString().padStart(4, '0')}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.Status)}`}>
                      {booking.Status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      {booking.UserName}
                    </div>
                    <div className="flex items-center">
                      <CarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {booking.Make} {booking.Model} ({booking.RegistrationNumber})
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {new Date(booking.StartDate).toLocaleDateString()} - {new Date(booking.EndDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <IndianRupee className="mr-2 h-4 w-4 text-muted-foreground" />
                      ₹{booking.TotalAmount?.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <div className="relative group">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity z-10 -translate-x-1/4 -translate-y-full -top-1 p-1 bg-black text-xs text-white rounded whitespace-nowrap">
                      View Details
                    </div>
                  </div>
                  
                  {booking.Status === 'pending' && (
                    <div className="relative group">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                        onClick={() => updateBookingStatusHandler(booking.Id, 'confirmed')}
                        disabled={processingBookings.includes(booking.Id)}
                      >
                        {processingBookings.includes(booking.Id) ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity z-10 -translate-x-1/4 -translate-y-full -top-1 p-1 bg-black text-xs text-white rounded whitespace-nowrap">
                        Confirm Booking
                      </div>
                    </div>
                  )}
                  
                  {booking.Status === 'confirmed' && (
                    <div className="relative group">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                        onClick={() => updateBookingStatusHandler(booking.Id, 'completed')}
                        disabled={processingBookings.includes(booking.Id)}
                      >
                        {processingBookings.includes(booking.Id) ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity z-10 -translate-x-1/4 -translate-y-full -top-1 p-1 bg-black text-xs text-white rounded whitespace-nowrap">
                        Mark Completed
                      </div>
                    </div>
                  )}
                  
                  {(booking.Status === 'pending' || booking.Status === 'confirmed') && (
                    <div className="relative group">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                        onClick={() => updateBookingStatusHandler(booking.Id, 'cancelled')}
                        disabled={processingBookings.includes(booking.Id)}
                      >
                        {processingBookings.includes(booking.Id) ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity z-10 -translate-x-1/4 -translate-y-full -top-1 p-1 bg-black text-xs text-white rounded whitespace-nowrap">
                        Cancel Booking
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredBookings.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No bookings match your search criteria.'
                  : 'Bookings will appear here as customers make reservations.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          onClose={() => {
            setShowDetails(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default BookingManagement;