import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  Fuel, 
  Settings, 
  Star,
  ArrowRight,
  Calendar,
  IndianRupee
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CarCard = ({ car, showLocation = true }) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate(`/cars/${car.Id}`);
  };

  const handleBookNow = () => {
    navigate(`/cars/${car.Id}?book=true`);
  };

  // Default car image if none provided
  const defaultImage = '/api/placeholder/400/250';
  const carImage = car.images && car.images.length > 0 
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${car.images[0].url}`
    : defaultImage;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
      {/* Car Image */}
      <div className="relative overflow-hidden">
        <img 
          src={carImage}
          alt={`${car.Make} ${car.Model}`}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />
        
        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <Badge 
            variant={car.Available ? "default" : "destructive"}
            className={car.Available ? "bg-green-600" : ""}
          >
            {car.Available ? "Available" : "Unavailable"}
          </Badge>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-black/50 text-white border-0">
            {car.Category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Car Title */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {car.Make} {car.Model}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Calendar className="h-4 w-4" />
            <span>{car.Year}</span>
            <span>•</span>
            <span>{car.RegistrationNumber}</span>
          </div>
        </div>

        {/* Car Specifications */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-muted-foreground">{car.Seats} Seats</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-green-600" />
            <span className="text-muted-foreground">{car.Transmission}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Fuel className="h-4 w-4 text-orange-600" />
            <span className="text-muted-foreground">{car.FuelType}</span>
          </div>
          {showLocation && car.City && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span className="text-muted-foreground">{car.City}</span>
            </div>
          )}
        </div>

        {/* Rating (if available) */}
        {car.AverageRating && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{car.AverageRating.toFixed(1)}</span>
            </div>
            {car.ReviewCount && (
              <span className="text-sm text-muted-foreground">
                ({car.ReviewCount} reviews)
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <IndianRupee className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-primary">
              {car.BasePricePerDay?.toLocaleString('en-IN') || 'N/A'}
            </span>
            <span className="text-sm text-muted-foreground">/day</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Inclusive of taxes and fees
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            onClick={handleBookNow}
            className="w-full"
            disabled={!car.Available}
          >
            {car.Available ? (
              <>
                Book Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              'Currently Unavailable'
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleViewDetails}
            className="w-full"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarCard;