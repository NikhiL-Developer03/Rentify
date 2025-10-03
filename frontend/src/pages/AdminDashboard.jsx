import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Car,
  Users,
  Calendar,
  IndianRupee,
  FileText,
  BarChart3,
  Wrench,
  Plus
} from 'lucide-react';

// Import admin components (we'll create these)
import CarManagement from '@/components/admin/CarManagement';
import MaintenanceLogs from '@/components/admin/MaintenanceLogs';
import InvoiceManagement from '@/components/admin/InvoiceManagement';
import AdminReports from '@/components/admin/AdminReports';
import BookingManagement from '@/components/admin/BookingManagement';
import UserManagement from '@/components/admin/UserManagement';
import adminService from '@/services/adminService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalCars: 0,
    totalBookings: 0,
    totalUsers: 0,
    monthlyRevenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentPath = location.pathname.split('/')[2] || 'dashboard';

  // Navigation items
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/admin' },
    { key: 'cars', label: 'Car Management', icon: Car, path: '/admin/cars' },
    { key: 'bookings', label: 'Bookings', icon: Calendar, path: '/admin/bookings' },
    { key: 'maintenance', label: 'Maintenance', icon: Wrench, path: '/admin/maintenance' },
    { key: 'invoices', label: 'Invoices', icon: FileText, path: '/admin/invoices' },
    { key: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { key: 'reports', label: 'Reports', icon: BarChart3, path: '/admin/reports' }
  ];

  useEffect(() => {
    // Fetch dashboard stats
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);

    
    try {
      // Fetch dashboard statistics using the new API

      const statsResponse = await adminService.dashboard.getStats();
      
      if (statsResponse.success) {

        setStats({
          totalCars: statsResponse.data.totalCars,
          totalBookings: statsResponse.data.totalBookings,
          totalUsers: statsResponse.data.totalUsers,
          monthlyRevenue: statsResponse.data.monthlyRevenue,
          // Additional stats for enhanced display
          completedBookings: statsResponse.data.completedBookings,
          pendingBookings: statsResponse.data.pendingBookings,
          availableCars: statsResponse.data.availableCars,
          newUsers: statsResponse.data.newUsers
        });
      } else {
        throw new Error(statsResponse.message || 'Failed to fetch dashboard stats');
      }
      
      // Fetch recent activity

      const activityResponse = await adminService.dashboard.getRecentActivity(5);
      
      if (activityResponse.success) {

        setRecentActivity(activityResponse.data || []);
      } else {
        console.warn('⚠️ Failed to fetch recent activity:', activityResponse.message);
        setRecentActivity([]);
      }
      

      
    } catch (error) {
      console.error('❌ Dashboard stats fetch failed:', error);
      setError(error.message);
      
      // Set fallback data to verify UI is working
      setStats({
        totalCars: 0,
        totalBookings: 0,
        totalUsers: 0,
        monthlyRevenue: 0
      });
      setRecentActivity([]);
      

    } finally {
      setLoading(false);

    }
  };

  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-lg">Loading dashboard data...</div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* Dashboard Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <Button 
          onClick={fetchDashboardStats} 
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCars}</div>
            <p className="text-xs text-muted-foreground">Active fleet vehicles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => navigate('/admin/cars')} className="h-20 flex-col space-y-2">
              <Plus className="h-6 w-6" />
              <span>Add New Car</span>
            </Button>
            <Button onClick={() => navigate('/admin/maintenance')} variant="outline" className="h-20 flex-col space-y-2">
              <Wrench className="h-6 w-6" />
              <span>Log Maintenance</span>
            </Button>
            <Button onClick={() => navigate('/admin/reports')} variant="outline" className="h-20 flex-col space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                // Map icon names to actual icons
                const iconMap = {
                  'Car': Car,
                  'Calendar': Calendar,
                  'Users': Users,
                  'Wrench': Wrench
                };
                const IconComponent = iconMap[activity.icon] || Calendar;
                
                // Map colors
                const colorMap = {
                  'blue': 'bg-blue-100 text-blue-600',
                  'green': 'bg-green-100 text-green-600',
                  'purple': 'bg-purple-100 text-purple-600',
                  'orange': 'bg-orange-100 text-orange-600'
                };
                const colorClass = colorMap[activity.color] || 'bg-gray-100 text-gray-600';
                
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 ${colorClass} rounded-full flex items-center justify-center`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.activityTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-4">
                {loading ? 'Loading activity...' : 'No recent activity found'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 space-y-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin Panel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.key || 
                    (item.key === 'dashboard' && currentPath === '');
                  
                  return (
                    <Button
                      key={item.key}
                      variant={isActive ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => navigate(item.path)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/cars/*" element={<CarManagement />} />
              <Route path="/bookings/*" element={<BookingManagement />} />
              <Route path="/maintenance" element={<MaintenanceLogs />} />
              <Route path="/maintenance/:carId" element={<MaintenanceLogs />} />
              <Route path="/invoices/*" element={<InvoiceManagement />} />
              <Route path="/users/*" element={<UserManagement />} />
              <Route path="/reports/*" element={<AdminReports />} />
            </Routes>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;