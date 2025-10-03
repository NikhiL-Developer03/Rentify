import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart3,
  TrendingUp,
  IndianRupee,
  Users,
  Car as CarIcon,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  PieChart,
  Activity
} from 'lucide-react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const AdminReports = () => {
  const [reportData, setReportData] = useState({
    monthlyBookings: [],
    monthlyRevenue: [],
    cityWiseStats: [],
    carCategoryStats: [],
    userStats: {},
    revenueStats: {},
    bookingStats: {}
  });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    endDate: new Date().toISOString().split('T')[0] // Today
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      console.log('Fetching report data for date range:', dateRange);
      
      // Use the admin service to get combined report data
      const combinedData = await adminService.reports.getCombinedReports(
        dateRange.startDate, 
        dateRange.endDate
      );
      
      console.log('Received combined data:', combinedData);
      
      if (combinedData.success) {
        console.log('Setting report data:', combinedData.data);
        setReportData(combinedData.data);
      } else {
        console.error('Combined data not successful:', combinedData);
        toast.error('Failed to load report data');
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      toast.error(error.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (reportType) => {
    try {
      let result;
      if (reportType === 'bookings') {
        result = await adminService.reports.exportBookingsReport(
          dateRange.startDate, 
          dateRange.endDate
        );
      } else if (reportType === 'revenue') {
        result = await adminService.reports.exportRevenueReport(
          dateRange.startDate, 
          dateRange.endDate
        );
      } else {
        throw new Error('Invalid report type');
      }
      
      if (result.success) {
        toast.success(result.message);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export report');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getMonthName = (monthIndex) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex - 1];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <Button onClick={fetchReportData} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </div>
            <div className="flex space-x-2 mt-6">
              <Button variant="outline" onClick={() => exportReport('bookings')}>
                <Download className="mr-2 h-4 w-4" />
                Export Bookings
              </Button>
              <Button variant="outline" onClick={() => exportReport('revenue')}>
                <Download className="mr-2 h-4 w-4" />
                Export Revenue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(reportData.revenueStats.totalRevenue || 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {reportData.revenueStats.growthPercentage > 0 ? '+' : ''}
                  {reportData.revenueStats.growthPercentage || 0}% from last period
                </p>
              </div>
              <IndianRupee className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{reportData.bookingStats.totalBookings || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {reportData.bookingStats.completedBookings || 0} completed
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{reportData.userStats.totalUsers || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {reportData.userStats.newUsers || 0} new this period
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Booking Value</p>
                <p className="text-2xl font-bold">{formatCurrency(reportData.revenueStats.avgBookingValue || 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Per booking average
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bookings Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Monthly Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.monthlyBookings?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{getMonthName(item.month)} {item.year}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{
                          width: `${Math.min((item.bookings / Math.max(...reportData.monthlyBookings.map(m => m.bookings))) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-8">{item.bookings}</span>
                  </div>
                </div>
              ))}
              {reportData.monthlyBookings?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No booking data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <IndianRupee className="mr-2 h-5 w-5" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.monthlyRevenue?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{getMonthName(item.month)} {item.year}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{
                          width: `${Math.min((item.revenue / Math.max(...reportData.monthlyRevenue.map(m => m.revenue))) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-16">{formatCurrency(item.revenue).slice(0, -3)}K</span>
                  </div>
                </div>
              ))}
              {reportData.monthlyRevenue?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No revenue data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* City-wise Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            City-wise Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">City</th>
                  <th className="text-center py-2">Total Bookings</th>
                  <th className="text-center py-2">Total Revenue</th>
                  <th className="text-center py-2">Avg Booking Value</th>
                  <th className="text-center py-2">Growth %</th>
                </tr>
              </thead>
              <tbody>
                {reportData.cityWiseStats?.map((city, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{city.city}</td>
                    <td className="text-center py-3">{city.totalBookings}</td>
                    <td className="text-center py-3">{formatCurrency(city.totalRevenue)}</td>
                    <td className="text-center py-3">{formatCurrency(city.avgBookingValue)}</td>
                    <td className="text-center py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        city.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {city.growth >= 0 ? '+' : ''}{city.growth.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reportData.cityWiseStats?.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No city data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Car Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CarIcon className="mr-2 h-5 w-5" />
            Car Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportData.carCategoryStats?.map((category, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{category.category}</h4>
                  <span className="text-sm text-muted-foreground">{category.totalCars} cars</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Bookings:</span>
                    <span className="font-medium">{category.totalBookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-medium">{formatCurrency(category.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Utilization:</span>
                    <span className="font-medium">{category.utilization.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(category.utilization, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            {reportData.carCategoryStats?.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No category data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Month</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.monthlyRevenue?.length > 0 ? (
              <>
                {(() => {
                  const topMonth = reportData.monthlyRevenue.reduce((max, month) => 
                    month.revenue > max.revenue ? month : max
                  );
                  return (
                    <div>
                      <p className="text-2xl font-bold">{getMonthName(topMonth.month)} {topMonth.year}</p>
                      <p className="text-muted-foreground">{formatCurrency(topMonth.revenue)}</p>
                    </div>
                  );
                })()}
              </>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Popular City</CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.cityWiseStats?.length > 0 ? (
              <>
                {(() => {
                  const topCity = reportData.cityWiseStats.reduce((max, city) => 
                    city.totalBookings > max.totalBookings ? city : max
                  );
                  return (
                    <div>
                      <p className="text-2xl font-bold">{topCity.city}</p>
                      <p className="text-muted-foreground">{topCity.totalBookings} bookings</p>
                    </div>
                  );
                })()}
              </>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-2xl font-bold">
                {reportData.revenueStats.growthPercentage >= 0 ? '+' : ''}
                {reportData.revenueStats.growthPercentage || 0}%
              </p>
              <p className="text-muted-foreground">vs last period</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;