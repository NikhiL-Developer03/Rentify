import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Users,
  Fuel,
  Settings,
  Calendar,
  Star,
  Shield,
  Clock,
  IndianRupee,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2
} from 'lucide-react';
import { carService } from '@/services/carService';
import bookingService from '@/services/bookingService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  validateBookingDates, 
  calculateDaysBetween, 
  formatDate, 
  formatDateForInput,
  getMinBookingDate,
  getSuggestedEndDate,
  calculateTotalCost
} from '@/utils/dateValidation';
import { toast } from 'react-toastify';

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availability, setAvailability] = useState(null);
  
  // Booking form state
  const [bookingData, setBookingData] = useState({
    start_date: searchParams.get('start_date') || '',
    end_date: searchParams.get('end_date') || '',
  });
  
  const [bookingForm, setBookingForm] = useState({
    startDate: searchParams.get('start_date') || getMinBookingDate(),
    endDate: searchParams.get('end_date') || '',
    pickupLocation: '',
    dropoffLocation: ''
  });
  
  const [bookingState, setBookingState] = useState({
    isSubmitting: false,
    showBookingForm: searchParams.get('book') === 'true',
    costCalculation: null,
    dateValidation: { isValid: true, errors: [] }
  });

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        const response = await carService.getCarById(id);
        
        if (response.success) {
          setCar(response.data);
          
          // Auto-scroll to booking form if book=true in URL
          if (searchParams.get('book') === 'true') {
            setTimeout(() => {
              document.getElementById('booking-section')?.scrollIntoView({ 
                behavior: 'smooth' 
              });
            }, 500);
          }
        } else {
          toast.error(response.message || 'Car not found');
          navigate('/cars');
        }
      } catch (error) {
        console.error('Error fetching car details:', error);
        toast.error(error.message || 'Failed to load car details');
        navigate('/cars');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarDetails();
    }
  }, [id]);

  const checkAvailability = async () => {
    if (!bookingData.start_date || !bookingData.end_date) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      setCheckingAvailability(true);
      const response = await carService.checkAvailability(
        id, 
        bookingData.start_date, 
        bookingData.end_date
      );
      setAvailability(response.data);
    } catch (error) {
      toast.error(error.message || 'Failed to check availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const calculateTotalAmount = () => {
    if (!bookingData.start_date || !bookingData.end_date || !car) {
      return 0;
    }

    const startDate = new Date(bookingData.start_date);
    const endDate = new Date(bookingData.end_date);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    return car.BasePricePerDay * days;
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.info('Please login to book a car');
      navigate('/login', { state: { from: { pathname: `/cars/${id}` } } });
      return;
    }

    if (!bookingData.start_date || !bookingData.end_date) {
      toast.error('Please select booking dates');
      return;
    }

    // Navigate to booking page with car and date info
    navigate('/booking', {
      state: {
        car,
        startDate: bookingData.start_date,
        endDate: bookingData.end_date,
        totalAmount: calculateTotalAmount()
      }
    });
  };

  const nextImage = () => {
    if (car?.images && car.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === car.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (car?.images && car.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? car.images.length - 1 : prev - 1
      );
    }
  };

  // New booking form handlers
  const handleDateChange = (field, value) => {
    const updatedForm = { ...bookingForm, [field]: value };
    
    // Auto-suggest end date when start date changes
    if (field === 'startDate' && value && !updatedForm.endDate) {
      updatedForm.endDate = getSuggestedEndDate(value);
    }
    
    setBookingForm(updatedForm);
    
    // Validate dates
    if (updatedForm.startDate && updatedForm.endDate) {
      const validation = validateBookingDates(updatedForm.startDate, updatedForm.endDate);
      setBookingState(prev => ({ ...prev, dateValidation: validation }));
      
      // Calculate cost if dates are valid
      if (validation.isValid && car) {
        const days = calculateDaysBetween(updatedForm.startDate, updatedForm.endDate);
        const costCalc = calculateTotalCost(car.BasePricePerDay, days);
        setBookingState(prev => ({ ...prev, costCalculation: costCalc }));
      }
    }
  };

  const toggleBookingForm = () => {
    if (!isAuthenticated) {
      toast.info('Please login to book a car');
      navigate('/login', { state: { from: { pathname: `/cars/${id}` } } });
      return;
    }
    
    setBookingState(prev => ({ ...prev, showBookingForm: !prev.showBookingForm }));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to book a car');
      return;
    }
    
    // Validate form
    const validation = validateBookingDates(bookingForm.startDate, bookingForm.endDate);
    if (!validation.isValid) {
      setBookingState(prev => ({ ...prev, dateValidation: validation }));
      toast.error('Please fix the date validation errors');
      return;
    }
    
    setBookingState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Check availability first
      const availabilityCheck = await bookingService.checkAvailability(
        car.Id, 
        bookingForm.startDate, 
        bookingForm.endDate
      );
      
      if (!availabilityCheck.data.available) {
        toast.error('Car is not available for selected dates');
        setBookingState(prev => ({ ...prev, isSubmitting: false }));
        return;
      }
      
      // Create booking
      const bookingPayload = {
        car_id: car.Id,
        start_date: bookingForm.startDate,
        end_date: bookingForm.endDate,
        pickup_location: bookingForm.pickupLocation || car.City,
        dropoff_location: bookingForm.dropoffLocation || car.City,
        total_amount: bookingState.costCalculation.total,
        payment_method: 'online' // Default payment method
      };
      
      const response = await bookingService.createBooking(bookingPayload);
      
      if (response.success) {
        toast.success('Booking created successfully!');
        
        // Format the booking data to ensure proper property names
        const formattedBooking = {
          ...response.data,
          // Ensure booking ID is available in multiple formats
          Id: response.data.Id || response.data.id || response.data.booking_id,
          id: response.data.Id || response.data.id || response.data.booking_id,
          booking_id: response.data.booking_id || response.data.Id || response.data.id,
          // Ensure we have both formats of date properties
          startDate: response.data.startDate || response.data.start_date,
          endDate: response.data.endDate || response.data.end_date,
          StartDate: response.data.StartDate || response.data.start_date,
          EndDate: response.data.EndDate || response.data.end_date,
          start_date: response.data.start_date || response.data.startDate,
          end_date: response.data.end_date || response.data.endDate
        };
        
        // Navigate to confirmation page
        navigate('/booking-confirmation', {
          state: {
            booking: formattedBooking,
            car,
            costCalculation: bookingState.costCalculation
          }
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setBookingState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading car details...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!car) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Car not found</h1>
            <Button onClick={() => navigate('/cars')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cars
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const defaultImage = '/api/placeholder/800/400';
  const currentImage = car.images && car.images.length > 0 
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${car.images[currentImageIndex].url}`
    : defaultImage;

  const totalAmount = calculateTotalAmount();
  const today = new Date().toISOString().split('T')[0];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/cars')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cars
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                <img 
                  src={currentImage}
                  alt={`${car.Make} ${car.Model}`}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.target.src = defaultImage;
                  }}
                />
                
                {/* Image Navigation */}
                {car.images && car.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {car.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentImageIndex 
                              ? 'bg-white' 
                              : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="sm" variant="secondary">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Availability Badge */}
                <div className="absolute top-4 left-4">
                  <Badge 
                    variant={car.Available ? "default" : "destructive"}
                    className={car.Available ? "bg-green-600" : ""}
                  >
                    {car.Available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>

              {/* Thumbnail Images */}
              {car.images && car.images.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex gap-2 overflow-x-auto">
                    {car.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex 
                            ? 'border-primary' 
                            : 'border-transparent hover:border-muted-foreground'
                        }`}
                      >
                        <img 
                          src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${image.url}`}
                          alt={`${car.Make} ${car.Model} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Car Information */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">
                        {car.Make} {car.Model}
                      </h1>
                      <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {car.Year}
                        </span>
                        <span>{car.RegistrationNumber}</span>
                        <Badge variant="secondary">{car.Category}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <IndianRupee className="h-6 w-6 text-primary" />
                        <span className="text-3xl font-bold text-primary">
                          {car.BasePricePerDay?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-muted-foreground">/day</span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  {car.City && (
                    <div className="flex items-center gap-2 text-muted-foreground mt-4">
                      <MapPin className="h-4 w-4" />
                      <span>{car.City}, {car.State}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Specifications */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium">{car.Seats} Seats</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Settings className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="font-medium">{car.Transmission}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Fuel className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="font-medium">{car.FuelType}</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="font-medium">Insured</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Features & Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Air Conditioning',
                      'GPS Navigation',
                      'Bluetooth Connectivity',
                      'USB Charging Ports',
                      'Power Steering',
                      'Power Windows',
                      'Central Locking',
                      'Music System'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-6">
            <Card id="booking-section" className="sticky top-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Book This Car</h3>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ₹{car.BasePricePerDay?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-muted-foreground">per day</p>
                  </div>
                </div>
                
                {!bookingState.showBookingForm ? (
                  <Button 
                    onClick={toggleBookingForm}
                    className="w-full"
                    size="lg"
                    disabled={!car.Available}
                  >
                    {!isAuthenticated ? 'Login to Book' : 'Check Availability & Book'}
                  </Button>
                ) : (
                  <form onSubmit={handleSubmitBooking} className="space-y-4">
                    {/* Date Selection */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Pick-up Date
                        </label>
                        <input
                          type="date"
                          value={bookingForm.startDate}
                          min={getMinBookingDate()}
                          onChange={(e) => handleDateChange('startDate', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Drop-off Date
                        </label>
                        <input
                          type="date"
                          value={bookingForm.endDate}
                          min={bookingForm.startDate || getMinBookingDate()}
                          onChange={(e) => handleDateChange('endDate', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </div>
                    </div>

                    {/* Date Validation Errors */}
                    {!bookingState.dateValidation.isValid && bookingState.dateValidation.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                        <div className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div className="text-sm">
                            {bookingState.dateValidation.errors.map((error, index) => (
                              <p key={index} className="text-red-700">{error}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Location Selection (Optional) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Pickup Location
                        </label>
                        <input
                          type="text"
                          value={bookingForm.pickupLocation}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, pickupLocation: e.target.value }))}
                          placeholder={car.City}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Dropoff Location
                        </label>
                        <input
                          type="text"
                          value={bookingForm.dropoffLocation}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, dropoffLocation: e.target.value }))}
                          placeholder={car.City}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    {bookingState.costCalculation && bookingState.dateValidation.isValid && (
                      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Base Price per Day</span>
                          <span>₹{car.BasePricePerDay?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Number of Days</span>
                          <span>{bookingState.costCalculation.days}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>₹{bookingState.costCalculation.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Taxes & Fees (18%)</span>
                          <span>₹{bookingState.costCalculation.tax.toLocaleString('en-IN')}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total Amount</span>
                          <span className="text-primary">
                            ₹{bookingState.costCalculation.total.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        onClick={() => setBookingState(prev => ({ ...prev, showBookingForm: false }))}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="flex-1"
                        disabled={
                          !bookingState.dateValidation.isValid || 
                          !bookingForm.startDate || 
                          !bookingForm.endDate || 
                          bookingState.isSubmitting
                        }
                      >
                        {bookingState.isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Booking...
                          </>
                        ) : (
                          'Confirm Booking'
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Contact Info */}
                <div className="pt-4 mt-6 border-t space-y-2">
                  <p className="text-sm text-muted-foreground">Need help? Contact us:</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>+91 9876543210</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>support@rentify.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CarDetail;