import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Car, DollarSign, Search, X } from 'lucide-react';
import { locationService } from '@/services/locationService';
import { carService } from '@/services/carService';

const CarSearchForm = ({ onSearch, initialFilters = {}, compact = false }) => {
  const [filters, setFilters] = useState({
    city: '',
    start_date: '',
    end_date: '',
    category: '',
    min_price: '',
    max_price: '',
    ...initialFilters
  });
  
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const cities = await locationService.getCities();
        setLocations(cities);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  const handleInputChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Remove empty filters
    const cleanedFilters = Object.keys(filters).reduce((acc, key) => {
      if (filters[key] && filters[key] !== '') {
        acc[key] = filters[key];
      }
      return acc;
    }, {});
    
    onSearch(cleanedFilters);
    setIsLoading(false);
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      start_date: '',
      end_date: '',
      category: '',
      min_price: '',
      max_price: ''
    });
  };

  const categories = carService.getCategories();

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0];

  if (compact) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Pick-up City
                </Label>
                <Select value={filters.city} onValueChange={(value) => handleInputChange('city', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.city}>
                        {location.city}, {location.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Pick-up Date
                </Label>
                <Input
                  type="date"
                  id="start_date"
                  value={filters.start_date}
                  min={today}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Drop-off Date
                </Label>
                <Input
                  type="date"
                  id="end_date"
                  value={filters.end_date}
                  min={filters.start_date || today}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                />
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Find Cars
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Find Your Perfect Car</h2>
          <p className="text-muted-foreground">Search from our wide range of vehicles</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-6">
          {/* Location and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pick-up City */}
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Pick-up Location
              </Label>
              <Select value={filters.city} onValueChange={(value) => handleInputChange('city', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Search a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.city}>
                      {location.city}, {location.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pick-up Date */}
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                Pick-up Date
              </Label>
              <Input
                type="date"
                id="start_date"
                value={filters.start_date}
                min={today}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="cursor-pointer"
              />
            </div>

            {/* Drop-off Date */}
            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                Drop-off Date
              </Label>
              <Input
                type="date"
                id="end_date"
                value={filters.end_date}
                min={filters.start_date || today}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
                <Car className="h-4 w-4 text-purple-600" />
                Category
              </Label>
              <Select value={filters.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Price */}
            <div className="space-y-2">
              <Label htmlFor="min_price" className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-yellow-600" />
                Min Price (₹/day)
              </Label>
              <Input
                type="number"
                id="min_price"
                placeholder="Min price"
                value={filters.min_price}
                onChange={(e) => handleInputChange('min_price', e.target.value)}
                min="0"
              />
            </div>

            {/* Max Price */}
            <div className="space-y-2">
              <Label htmlFor="max_price" className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-yellow-600" />
                Max Price (₹/day)
              </Label>
              <Input
                type="number"
                id="max_price"
                placeholder="Max price"
                value={filters.max_price}
                onChange={(e) => handleInputChange('max_price', e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Find a Vehicle
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CarSearchForm;