import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Car, Calendar, IndianRupee } from 'lucide-react';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { car, startDate, endDate, totalAmount } = location.state || {};

  if (!car) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Booking Information Missing</h1>
            <p className="text-muted-foreground mb-4">
              Please select a car and dates to proceed with booking.
            </p>
            <Button onClick={() => navigate('/cars')}>
              <Car className="h-4 w-4 mr-2" />
              Browse Cars
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/cars/${car.Id}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Car Details
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Complete Your Booking</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Car Summary */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Car Details</h3>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <Car className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{car.Make} {car.Model}</h4>
                    <p className="text-sm text-muted-foreground">{car.Year} • {car.Category}</p>
                    <p className="text-sm text-muted-foreground">{car.City}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Pick-up Date
                    </span>
                    <span>{new Date(startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Drop-off Date
                    </span>
                    <span>{new Date(endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Total Amount
                    </span>
                    <span>₹{(totalAmount * 1.18).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Booking Form</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Driver Details</span>
                    <span className="text-xs text-muted-foreground">Required</span>
                  </div>
                  
                  <div className="pt-2 space-y-3">
                    <Button 
                      onClick={() => navigate(`/cars/${car.Id}`)}
                      variant="outline"
                      className="w-full"
                    >
                      Modify Dates
                    </Button>
                    
                    <Button 
                      onClick={() => navigate('/cars')}
                      className="w-full"
                    >
                      Browse More Cars
                    </Button>
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

export default Booking;