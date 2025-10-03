import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  Car as CarIcon,
  MapPin,
  IndianRupee,
  Users,
  Fuel,
  Settings,
  Calendar,
  Image as ImageIcon,
  X,
  Wrench
} from 'lucide-react';
import { toast } from 'react-toastify';
import carService from '../../services/carService';

const CarManagement = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    registration_number: '',
    make: '',
    model: '',
    year: '',
    category: '',
    seats: '',
    transmission: '',
    fuel_type: '',
    base_price_per_day: '',
    location_id: ''
  });
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    fetchCars();
    fetchLocations();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const data = await carService.admin.getAllCars();
      if (data.success) {
        setCars(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cars:', error);
      toast.error(error.message || 'Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await carService.admin.getLocations();
      if (data.success) {
        setLocations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      toast.error(error.message || 'Failed to load locations');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let data;
      if (selectedCar) {
        data = await carService.admin.updateCar(selectedCar.Id, formData);
      } else {
        data = await carService.admin.createCar(formData);
      }
      
      if (data.success) {
        toast.success(selectedCar ? 'Car updated successfully' : 'Car created successfully');
        
        // Upload images if any
        if (selectedImages.length > 0 && data.data) {
          await uploadImages(data.data.Id || selectedCar.Id);
        }
        
        fetchCars();
        resetForm();
      } else {
        toast.error(data.message || 'Failed to save car');
      }
    } catch (error) {
      console.error('Error saving car:', error);
      toast.error(error.message || 'Failed to save car');
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (carId) => {
    try {
      const data = await carService.admin.uploadCarImages(carId, selectedImages);
      if (data.success) {
        toast.success('Images uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(error.message || 'Failed to upload images');
    }
  };

  const handleDelete = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      const data = await carService.admin.deleteCar(carId);
      if (data.success) {
        toast.success('Car deleted successfully');
        fetchCars();
      } else {
        toast.error(data.message || 'Failed to delete car');
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error(error.message || 'Failed to delete car');
    }
  };

  const handleEdit = (car) => {
    setSelectedCar(car);
    setFormData({
      registration_number: car.RegistrationNumber || '',
      make: car.Make || '',
      model: car.Model || '',
      year: car.Year?.toString() || '',
      category: car.Category || '',
      seats: car.Seats?.toString() || '',
      transmission: car.Transmission || '',
      fuel_type: car.FuelType || '',
      base_price_per_day: car.BasePricePerDay?.toString() || '',
      location_id: car.LocationId?.toString() || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setSelectedCar(null);
    setFormData({
      registration_number: '',
      make: '',
      model: '',
      year: '',
      category: '',
      seats: '',
      transmission: '',
      fuel_type: '',
      base_price_per_day: '',
      location_id: ''
    });
    setSelectedImages([]);
    setShowForm(false);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  const CarList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Car Management</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Car
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <Card key={car.Id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{car.Make} {car.Model}</CardTitle>
                  <p className="text-sm text-muted-foreground">{car.RegistrationNumber}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/maintenance/${car.Id}`)}
                    title="Maintenance Logs"
                  >
                    <Wrench className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(car)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(car.Id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                {car.Year}
              </div>
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                {car.Seats} Seats
              </div>
              <div className="flex items-center text-sm">
                <Fuel className="mr-2 h-4 w-4 text-muted-foreground" />
                {car.FuelType}
              </div>
              <div className="flex items-center text-sm">
                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                {car.Transmission}
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                {car.City}
              </div>
              <div className="flex items-center text-sm font-semibold">
                <IndianRupee className="mr-2 h-4 w-4 text-green-600" />
                ₹{car.BasePricePerDay}/day
              </div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                car.Available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {car.Available ? 'Available' : 'Unavailable'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cars.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Cars Found</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first car to the fleet.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Car
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const CarForm = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {selectedCar ? 'Edit Car' : 'Add New Car'}
        </h2>
        <Button variant="outline" onClick={resetForm}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) => setFormData({...formData, registration_number: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({...formData, make: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Category</option>
                  {carService.getCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seats">Seats</Label>
                <Input
                  id="seats"
                  type="number"
                  value={formData.seats}
                  onChange={(e) => setFormData({...formData, seats: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <select
                  id="transmission"
                  value={formData.transmission}
                  onChange={(e) => setFormData({...formData, transmission: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Transmission</option>
                  {carService.getTransmissionOptions().map(transmission => (
                    <option key={transmission} value={transmission}>{transmission}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuel_type">Fuel Type</Label>
                <select
                  id="fuel_type"
                  value={formData.fuel_type}
                  onChange={(e) => setFormData({...formData, fuel_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Fuel Type</option>
                  {carService.getFuelTypes().map(fuelType => (
                    <option key={fuelType} value={fuelType}>{fuelType}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_price_per_day">Base Price Per Day</Label>
                <Input
                  id="base_price_per_day"
                  type="number"
                  value={formData.base_price_per_day}
                  onChange={(e) => setFormData({...formData, base_price_per_day: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_id">Location</Label>
                <select
                  id="location_id"
                  value={formData.location_id}
                  onChange={(e) => setFormData({...formData, location_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((location) => (
                    <option key={location.Id} value={location.Id}>
                      {location.City}, {location.State}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Car Images</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="flex-1"
                />
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              {selectedImages.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedImages.length} image(s) selected
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (selectedCar ? 'Update Car' : 'Add Car')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={showForm ? <CarForm /> : <CarList />} />
    </Routes>
  );
};

export default CarManagement;