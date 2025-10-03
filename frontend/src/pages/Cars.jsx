import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import CarSearchForm from '@/components/CarSearchForm';
import CarCard from '@/components/CarCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Car, 
  SlidersHorizontal, 
  Grid3X3, 
  List,
  Filter,
  X,
  AlertCircle
} from 'lucide-react';
import { carService } from '@/services/carService';
import { toast } from 'react-toastify';

const Cars = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [currentFilters, setCurrentFilters] = useState({});

  // Get initial filters from URL params
  useEffect(() => {
    const initialFilters = {
      city: searchParams.get('city') || '',
      start_date: searchParams.get('start_date') || '',
      end_date: searchParams.get('end_date') || '',
      category: searchParams.get('category') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
    };
    
    setCurrentFilters(initialFilters);
    
    // Auto-search if there are params
    const hasFilters = Object.values(initialFilters).some(value => value !== '');
    if (hasFilters) {
      handleSearch(initialFilters);
    } else {
      // Load all cars by default
      handleSearch({});
    }
  }, []);

  const handleSearch = async (filters) => {
    setLoading(true);
    setCurrentFilters(filters);
    
    try {
      const response = await carService.searchCars(filters);
      
      if (response.success) {
        setCars(response.data || []);
        
        // Update URL with search params
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
          if (filters[key] && filters[key] !== '') {
            params.set(key, filters[key]);
          }
        });
        setSearchParams(params);
        
      } else {
        toast.error(response.message || 'Failed to search cars');
        setCars([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error(error.message || 'Failed to search cars');
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setCurrentFilters({});
    setSearchParams({});
    handleSearch({});
  };

  const removeFilter = (key) => {
    const newFilters = { ...currentFilters };
    delete newFilters[key];
    handleSearch(newFilters);
  };

  const getFilterDisplayValue = (key, value) => {
    switch (key) {
      case 'city':
        return `Location: ${value}`;
      case 'start_date':
        return `From: ${new Date(value).toLocaleDateString()}`;
      case 'end_date':
        return `To: ${new Date(value).toLocaleDateString()}`;
      case 'category':
        return `Category: ${value}`;
      case 'min_price':
        return `Min: ₹${value}`;
      case 'max_price':
        return `Max: ₹${value}`;
      default:
        return value;
    }
  };

  const activeFilters = Object.keys(currentFilters).filter(
    key => currentFilters[key] && currentFilters[key] !== ''
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Find Your Perfect Car</h1>
          <p className="text-muted-foreground">
            Choose from our extensive fleet of premium vehicles
          </p>
        </div>

        {/* Search Form */}
        <CarSearchForm 
          onSearch={handleSearch}
          initialFilters={currentFilters}
          compact={activeFilters.length > 0}
        />

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
              {activeFilters.map((key) => (
                <Badge 
                  key={key}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1"
                >
                  {getFilterDisplayValue(key, currentFilters[key])}
                  <button
                    onClick={() => removeFilter(key)}
                    className="hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {loading ? 'Searching...' : `${cars.length} car${cars.length !== 1 ? 's' : ''} found`}
            </h2>
            
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-muted rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Searching for cars...</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && cars.length === 0 && (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No cars found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all available cars.
            </p>
            <Button onClick={clearAllFilters}>
              <Car className="h-4 w-4 mr-2" />
              View All Cars
            </Button>
          </div>
        )}

        {/* Results Grid */}
        {!loading && cars.length > 0 && (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {cars.map((car) => (
              <CarCard 
                key={car.Id} 
                car={car}
                showLocation={!currentFilters.city}
              />
            ))}
          </div>
        )}

        {/* Load More Button (if pagination is implemented) */}
        {!loading && cars.length > 0 && cars.length >= 12 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Cars
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cars;