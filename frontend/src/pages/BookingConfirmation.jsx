import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  IndianRupee, 
  Car, 
  Download,
  Share2,
  Home,
  Eye,
  Phone,
  Mail
} from 'lucide-react';
import { formatDate } from '@/utils/dateValidation';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { booking, car, costCalculation } = location.state || {};

  // If no booking data, redirect to home
  if (!booking || !car) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
            <p className="text-muted-foreground mb-4">
              We couldn't find your booking information.
            </p>
            <Button onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleViewBookings = () => {
    navigate('/bookings');
  };

  const handleBackToCars = () => {
    navigate('/cars');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your car rental has been successfully booked
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Booking Details</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Booking ID</span>
                      <span className="font-mono font-semibold">
                        {booking.Id || booking.id || booking.booking_id 
                          ? `#${booking.Id || booking.id || booking.booking_id}` 
                          : booking.car && booking.car.id 
                            ? `#BK-${booking.car.id}-${new Date().getTime().toString().slice(-6)}` 
                            : `#${new Date().getTime().toString().slice(-8)}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Booking Status</span>
                      <Badge variant="default" className="bg-green-600">
                        Confirmed
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Pick-up Date
                      </span>
                      <span className="font-medium">
                        {formatDate(booking.StartDate || booking.startDate || booking.start_date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Drop-off Date
                      </span>
                      <span className="font-medium">
                        {formatDate(booking.EndDate || booking.endDate || booking.end_date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        Pickup Location
                      </span>
                      <span className="font-medium">
                        {booking.PickupLocation || booking.pickupLocation || car.City}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        Dropoff Location
                      </span>
                      <span className="font-medium">
                        {booking.DropoffLocation || booking.dropoffLocation || car.City}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Car Details */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Car Details</h3>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                      {car.images && car.images.length > 0 ? (
                        <img 
                          src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${car.images[0].url}`}
                          alt={`${car.Make} ${car.Model}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Car className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold">
                        {car.Make} {car.Model}
                      </h4>
                      <p className="text-muted-foreground">
                        {car.Year} • {car.Category} • {car.RegistrationNumber}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{car.Seats} Seats</span>
                        <span>{car.Transmission}</span>
                        <span>{car.FuelType}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Details */}
              {costCalculation && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Payment Summary</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Price per Day</span>
                        <span>₹{car.BasePricePerDay?.toLocaleString('en-IN')}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Number of Days</span>
                        <span>{costCalculation.days}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{costCalculation.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxes & Fees (18%)</span>
                        <span>₹{costCalculation.tax.toLocaleString('en-IN')}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total Paid</span>
                        <span className="text-green-600">
                          ₹{costCalculation.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={handleViewBookings}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View All Bookings
                    </Button>
                    
                    <Button 
                      onClick={handleBackToCars}
                      variant="outline"
                      className="w-full"
                    >
                      <Car className="h-4 w-4 mr-2" />
                      Book Another Car
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => window.print()}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Print Receipt
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'Car Booking Confirmation',
                            text: `Booking confirmed! ${car.Make} ${car.Model} from ${formatDate(booking.StartDate || booking.startDate)}`,
                            url: window.location.href
                          });
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                  
                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground">
                      If you have any questions about your booking, feel free to contact us:
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>+91 9876543210</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>support@rentify.com</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Important Notes */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Important Notes</h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Please carry a valid driving license</p>
                    <p>• Arrive 15 minutes early for pickup</p>
                    <p>• Vehicle documents will be provided</p>
                    <p>• Return with same fuel level</p>
                    <p>• No smoking policy strictly enforced</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingConfirmation;