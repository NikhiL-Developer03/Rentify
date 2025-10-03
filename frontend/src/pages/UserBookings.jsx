import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2,
  Calendar,
  MapPin,
  IndianRupee,
  Car,
  Eye,
  XCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import bookingService from '@/services/bookingService';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/utils/dateValidation';
import { toast } from 'react-toastify';

const UserBookings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Loading your bookings...');



  useEffect(() => {
    const userId = user?.id || user?.Id; // Handle both possible ID formats
    
    if (isAuthenticated && userId) {
      fetchBookings();
    } else if (isAuthenticated === false) {
      // User is not authenticated, redirect to login
      setLoading(false);
      navigate('/login');
    } else {
      // Still checking authentication, keep loading
      setLoadingMessage('Checking authentication...');
    }
  }, [user?.id, user?.Id, isAuthenticated, navigate]); // Depend on authentication state

  const fetchBookings = async () => {
    const userId = user?.id || user?.Id; // Handle both possible ID formats
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setLoadingMessage('Loading your bookings...');
    
    // Progressive loading messages
    const messageTimeout1 = setTimeout(() => {
      if (loading) setLoadingMessage('Fetching booking details...');
    }, 2000);
    
    const messageTimeout2 = setTimeout(() => {
      if (loading) setLoadingMessage('Loading car information...');
    }, 4000);
    
    const messageTimeout3 = setTimeout(() => {
      if (loading) setLoadingMessage('Almost ready...');
    }, 6000);
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      toast.error('Loading is taking too long. Please try refreshing the page.');
    }, 10000); // 10 second timeout
    
    try {
      const response = await bookingService.getUserBookings(userId);
      
      // Clear all timeouts
      clearTimeout(timeoutId);
      clearTimeout(messageTimeout1);
      clearTimeout(messageTimeout2);
      clearTimeout(messageTimeout3);
      
      if (response.success) {
        console.log('Bookings received:', response.data?.length || 0);
        setBookings(response.data || []);
      } else {
        console.error('Booking fetch failed:', response);
        toast.error(response.message || 'Failed to load bookings');
      }
    } catch (error) {
      // Clear all timeouts
      clearTimeout(timeoutId);
      clearTimeout(messageTimeout1);
      clearTimeout(messageTimeout2);
      clearTimeout(messageTimeout3);
      console.error('Error fetching bookings:', error);
      
      // More specific error messages
      if (error.message?.includes('timeout')) {
        toast.error('Request timed out. Please check your connection and try again.');
      } else if (error.message?.includes('Network')) {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error(error.message || 'Failed to load bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  const getBookingStatus = (booking) => {
    const today = new Date();
    const startDate = new Date(booking.StartDate);
    const endDate = new Date(booking.EndDate);
    
    // Check database status first
    if (booking.Status && booking.Status.toLowerCase() === 'cancelled') return 'cancelled';
    if (booking.Status && booking.Status.toLowerCase() === 'completed') return 'completed';
    
    // Then check date-based status
    if (today < startDate) return 'upcoming';
    if (today >= startDate && today <= endDate) return 'active';
    if (today > endDate) return 'past';
    
    // Default to confirmed for pending bookings
    return 'confirmed';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      upcoming: { label: 'Upcoming', className: 'bg-blue-600' },
      active: { label: 'Active', className: 'bg-green-600' },
      past: { label: 'Completed', className: 'bg-gray-600' },
      cancelled: { label: 'Cancelled', className: 'bg-red-600' },
      confirmed: { label: 'Confirmed', className: 'bg-orange-600' },
      completed: { label: 'Completed', className: 'bg-gray-600' }
    };
    
    const config = statusConfig[status] || statusConfig.confirmed;
    return (
      <Badge variant="default" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const status = getBookingStatus(booking);
      const matchesFilter = filter === 'all' || 
        (filter === 'upcoming' && (status === 'upcoming' || status === 'confirmed' || status === 'active')) ||
        (filter === 'past' && (status === 'past' || status === 'completed')) ||
        (filter === 'cancelled' && status === 'cancelled');
      
      const matchesSearch = !searchTerm || 
        booking.Car?.Make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.Car?.Model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.Id?.toString().includes(searchTerm);
      
      return matchesFilter && matchesSearch;
    });
  }, [bookings, filter, searchTerm]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      console.log('Attempting to cancel booking:', bookingId);
      const response = await bookingService.cancelBooking(bookingId);
      console.log('Cancel booking response:', response);
      
      if (response.success) {
        toast.success('Booking cancelled successfully');
        fetchBookings(); // Refresh the list
      } else {
        toast.error(response.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const canCancelBooking = (booking) => {
    // Don't allow cancelling if already cancelled or completed
    if (booking.Status && (
      booking.Status.toLowerCase() === 'cancelled' || 
      booking.Status.toLowerCase() === 'completed'
    )) {
      return false;
    }
    
    const status = getBookingStatus(booking);
    const startDate = new Date(booking.StartDate);
    const today = new Date();
    const hoursDiff = (startDate - today) / (1000 * 60 * 60);
    
    // Allow cancellation if booking is upcoming or confirmed and more than 24 hours away
    const canCancel = (status === 'upcoming' || status === 'confirmed') && hoursDiff > 24;
    
    console.log('Can cancel booking check:', {
      bookingId: booking.Id,
      dbStatus: booking.Status,
      calculatedStatus: status,
      startDate: startDate.toISOString(),
      today: today.toISOString(),
      hoursDiff: Math.round(hoursDiff),
      canCancel
    });
    
    return canCancel;
  };

  // Show loading spinner while checking auth or fetching data
  if (authLoading || loading) {
    const currentMessage = authLoading ? 'Checking authentication...' : loadingMessage;
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground mb-4">{currentMessage}</p>
              <div className="w-full max-w-xs mx-auto mb-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
              <Button 
                onClick={fetchBookings} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // If not authenticated and not loading, redirect should have happened in useEffect
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              Please login to view your bookings.
            </p>
            <Button onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
            <p className="text-muted-foreground">
              Manage your car rental bookings
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={fetchBookings} 
              variant="outline"
              disabled={loading}
            >
              <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button onClick={() => navigate('/cars')}>
              <Plus className="h-4 w-4 mr-2" />
              Book New Car
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'all', label: 'All Bookings' },
                  { key: 'upcoming', label: 'Upcoming' },
                  { key: 'past', label: 'Past' },
                  { key: 'cancelled', label: 'Cancelled' }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    onClick={() => setFilter(key)}
                    variant={filter === key ? 'default' : 'outline'}
                    size="sm"
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    {label}
                  </Button>
                ))}
              </div>
              
              {/* Search */}
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all' 
                  ? "You haven't made any bookings yet."
                  : `No ${filter} bookings found.`
                }
              </p>
              <Button onClick={() => navigate('/cars')}>
                <Plus className="h-4 w-4 mr-2" />
                Book Your First Car
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const status = getBookingStatus(booking);
              return (
                <Card key={booking.Id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-6">
                      {/* Booking Details */}
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <Car className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold">
                                {booking.Car?.Make} {booking.Car?.Model}
                              </h3>
                              <p className="text-muted-foreground">
                                Booking ID: #{booking.Id}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getStatusBadge(status)}
                          </div>
                        </div>

                        {/* Booking Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-muted-foreground">Pickup</p>
                              <p className="font-medium">{formatDate(booking.StartDate)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-muted-foreground">Dropoff</p>
                              <p className="font-medium">{formatDate(booking.EndDate)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-muted-foreground">Location</p>
                              <p className="font-medium">{booking.PickupLocation}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-muted-foreground">Total</p>
                              <p className="font-medium">₹{booking.TotalAmount?.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button
                            onClick={() => navigate(`/cars/${booking.CarId}`)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Car
                          </Button>
                          
                          {canCancelBooking(booking) && (
                            <Button
                              onClick={() => handleCancelBooking(booking.Id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          )}
                          
                          {status === 'active' && (
                            <Badge variant="outline" className="border-green-600 text-green-700">
                              <Clock className="h-3 w-3 mr-1" />
                              Currently Rented
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {bookings.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{bookings.length}</p>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                </div>
                
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {bookings.filter(b => getBookingStatus(b) === 'upcoming').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
                
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {bookings.filter(b => ['past', 'completed'].includes(getBookingStatus(b))).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {bookings.filter(b => getBookingStatus(b) === 'cancelled').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default UserBookings;