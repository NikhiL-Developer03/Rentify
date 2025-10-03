import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus,
  Calendar,
  IndianRupee,
  Wrench,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Edit,
  Trash2,
  Search,
  Filter,
  Car as CarIcon,
  FileText,
  Settings
} from 'lucide-react';
import { toast } from 'react-toastify';
import maintenanceService from '../../services/maintenanceService';

const MaintenanceLogs = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [car, setCar] = useState(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    maintenance_type: '',
    description: '',
    cost: ''
  });

  useEffect(() => {
    if (carId) {
      fetchCar();
      fetchMaintenanceRecords();
    } else {
      fetchCars();
    }
  }, [carId]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const data = await maintenanceService.getCars();
      if (data.success) {
        setCars(data.data);
      } else {
        toast.error('Failed to load cars');
      }
    } catch (error) {
      console.error('Failed to fetch cars:', error);
      toast.error(error.message || 'Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const fetchCar = async () => {
    try {
      const data = await maintenanceService.getCar(carId);
      if (data.success) {
        setCar(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch car:', error);
      toast.error(error.message || 'Failed to fetch car details');
    }
  };

  const fetchMaintenanceRecords = async () => {
    setLoading(true);
    try {
      const data = await maintenanceService.getMaintenanceRecords(carId);
      if (data.success) {
        setMaintenanceRecords(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch maintenance records:', error);
      toast.error(error.message || 'Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        car_id: parseInt(carId),
        maintenance_type: formData.maintenance_type,
        description: formData.description,
        cost: formData.cost ? parseFloat(formData.cost) : 0
      };

      let data;
      if (selectedRecord) {
        data = await maintenanceService.updateMaintenanceRecord(selectedRecord.Id, {
          maintenance_type: formData.maintenance_type,
          description: formData.description,
          cost: formData.cost ? parseFloat(formData.cost) : 0
        });
      } else {
        data = await maintenanceService.addMaintenanceRecord(requestData);
      }
      
      if (data.success) {
        toast.success(selectedRecord ? 'Maintenance record updated successfully' : 'Maintenance record added successfully');
        fetchMaintenanceRecords();
        resetForm();
      } else {
        toast.error(data.message || 'Failed to save maintenance record');
      }
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      toast.error(error.message || 'Failed to save maintenance record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;

    try {
      const data = await maintenanceService.deleteMaintenanceRecord(recordId);
      if (data.success) {
        toast.success('Maintenance record deleted successfully');
        fetchMaintenanceRecords();
      } else {
        toast.error(data.message || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error(error.message || 'Failed to delete record');
    }
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setFormData({
      maintenance_type: record.Type || '',
      description: record.Description || '',
      cost: record.Cost?.toString() || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setSelectedRecord(null);
    setFormData({
      maintenance_type: '',
      description: '',
      cost: ''
    });
    setShowForm(false);
  };

  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = record.Type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.Description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalMaintenanceCost = maintenanceRecords.reduce((sum, record) => sum + (record.Cost || 0), 0);

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Records
            </Button>
            <h2 className="text-2xl font-bold">
              {selectedRecord ? 'Edit Maintenance Record' : 'Add New Maintenance Record'}
            </h2>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenance_type">Maintenance Type</Label>
                  <select
                    id="maintenance_type"
                    value={formData.maintenance_type}
                    onChange={(e) => setFormData({...formData, maintenance_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Oil Change">Oil Change</option>
                    <option value="Tire Replacement">Tire Replacement</option>
                    <option value="Brake Service">Brake Service</option>
                    <option value="Engine Repair">Engine Repair</option>
                    <option value="Transmission Service">Transmission Service</option>
                    <option value="Air Filter">Air Filter</option>
                    <option value="Battery Replacement">Battery Replacement</option>
                    <option value="AC Service">AC Service</option>
                    <option value="General Service">General Service</option>
                    <option value="Damage">Damage</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Cost (₹)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Describe the maintenance work performed or required..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (selectedRecord ? 'Update Record' : 'Add Record')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle missing carId - show car selection
  if (!carId) {
    return <CarSelectionView navigate={navigate} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/admin/cars')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cars
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Maintenance Logs</h2>
            {car && (
              <p className="text-muted-foreground">
                {car.Make} {car.Model} - {car.RegistrationNumber}
              </p>
            )}
          </div>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Maintenance Record
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{maintenanceRecords.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <IndianRupee className="h-6 w-6 text-red-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalMaintenanceCost.toLocaleString()}</p>
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
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Service</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {maintenanceRecords.length > 0 
                      ? new Date(maintenanceRecords[0].CreatedAt).toLocaleDateString() 
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search maintenance records by type or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Records */}
      <div className="space-y-4">
        {filteredRecords.map((record) => (
          <Card key={record.Id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Wrench className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold">{record.Type}</h3>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      ₹{record.Cost?.toLocaleString() || '0'}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground mb-3">{record.Description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {new Date(record.CreatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      Recorded by: {record.RecordedByName || 'Unknown'}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(record)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(record.Id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRecords.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Maintenance Records Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'No records match your search criteria.'
                  : 'Start by adding the first maintenance record for this car.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Record
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Car Selection Component for when no carId is provided
const CarSelectionView = ({ navigate }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const data = await maintenanceService.getCars();
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Maintenance Management</h2>
        <Button variant="outline" onClick={() => navigate('/admin/cars')}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Car
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select a Car to View Maintenance Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Loading cars...</p>
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-12">
              <CarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Cars Available</h3>
              <p className="text-muted-foreground mb-4">
                Add some cars first to manage their maintenance logs.
              </p>
              <Button onClick={() => navigate('/admin/cars')}>
                Go to Car Management
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cars.map((car) => (
                <Card key={car.Id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{car.Make} {car.Model}</h3>
                        <p className="text-sm text-muted-foreground">{car.RegistrationNumber}</p>
                        <p className="text-sm text-muted-foreground">{car.Year}</p>
                      </div>
                      <Button
                        onClick={() => navigate(`/admin/maintenance/${car.Id}`)}
                        size="sm"
                      >
                        <Wrench className="mr-2 h-4 w-4" />
                        View Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceLogs;