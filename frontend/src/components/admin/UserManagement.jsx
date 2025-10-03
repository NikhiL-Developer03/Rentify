import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import userService from '../../services/userService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.admin.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        toast.error(response.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, makeAdmin) => {
    try {
      const response = await userService.admin.updateUserRole(userId, makeAdmin);
      if (response.success) {
        toast.success(`User ${makeAdmin ? 'promoted to admin' : 'removed from admin'} successfully`);
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update role');
    }
  };

  const updateUserStatus = async (userId, activate) => {
    try {
      let response;
      if (activate) {
        response = await userService.admin.activateUser(userId);
      } else {
        response = await userService.admin.deactivateUser(userId);
      }
      
      if (response.success) {
        toast.success(`User ${activate ? 'activated' : 'deactivated'} successfully`);
        fetchUsers(); // Refresh user list
      } else {
        toast.error(response.message || `Failed to ${activate ? 'activate' : 'deactivate'} user`);
      }
    } catch (error) {
      console.error(`Failed to ${activate ? 'activate' : 'deactivate'} user:`, error);
      toast.error(error.message || `Failed to ${activate ? 'activate' : 'deactivate'} user`);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${userName}?\n\nThis action cannot be undone and will permanently remove the user and all their data.`
    );
    
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await userService.admin.deleteUser(userId);
      if (response.success) {
        toast.success('User deleted successfully');
        fetchUsers();
        // Close details modal if the deleted user was being viewed
        if (selectedUser && selectedUser.Id === userId) {
          setSelectedUser(null);
          setShowDetails(false);
        }
      } else {
        toast.error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.Phone?.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'admin' && user.IsAdmin) ||
                       (roleFilter === 'user' && !user.IsAdmin) ||
                       (roleFilter === 'active' && user.IsActive) ||
                       (roleFilter === 'inactive' && !user.IsActive);
    
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.IsAdmin).length;
  const newUsersThisMonth = users.filter(u => {
    const userDate = new Date(u.CreatedAt);
    const now = new Date();
    return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
  }).length;

  const UserDetails = ({ user, onClose }) => (
    <Card className="fixed inset-0 z-50 overflow-y-auto bg-white">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle>User Details - {user.Name}</CardTitle>
          <Button variant="outline" onClick={onClose}>×</Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Full Name:</span> {user.Name}</p>
              <p><span className="font-medium">Email:</span> {user.Email}</p>
              <p><span className="font-medium">Phone:</span> {user.Phone}</p>
              <p><span className="font-medium">Role:</span> {user.IsAdmin ? 'Admin' : 'User'}</p>
              <p><span className="font-medium">Status:</span> <span className={user.IsActive ? 'text-green-600' : 'text-red-600'}>{user.IsActive ? 'Active' : 'Inactive'}</span></p>
              <p><span className="font-medium">Joined:</span> {new Date(user.CreatedAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Account Statistics</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Total Bookings:</span> {user.TotalBookings || 0}</p>
              <p><span className="font-medium">Total Spent:</span> ₹{(user.TotalSpent || 0).toLocaleString()}</p>
              <p><span className="font-medium">Last Login:</span> {user.LastLogin ? new Date(user.LastLogin).toLocaleDateString() : 'Never'}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            variant="destructive"
            onClick={() => handleDeleteUser(user.Id, user.Name)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button onClick={fetchUsers} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-xl font-bold">{users.filter(u => u.IsActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Admin Users</p>
                <p className="text-xl font-bold">{adminUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-xl font-bold">{newUsersThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="user">Regular Users</option>
                <option value="admin">Admins</option>
                <option value="active">Active Users</option>
                <option value="inactive">Inactive Users</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.Id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">{user.Name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.IsAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.IsAdmin ? 'Admin' : 'User'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.IsActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      {user.Email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      {user.Phone}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      Joined {new Date(user.CreatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {user.TotalBookings > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {user.TotalBookings} bookings • ₹{(user.TotalSpent || 0).toLocaleString()} spent
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDetails(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={user.IsActive ? "outline" : "default"}
                    size="sm"
                    onClick={() => updateUserStatus(user.Id, !user.IsActive)}
                    title={user.IsActive ? 'Deactivate User' : 'Activate User'}
                    className={user.IsActive ? 'border-red-200 hover:bg-red-50 text-red-600' : 'bg-green-600 hover:bg-green-700 text-white'}
                  >
                    {user.IsActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user.Id, user.Name)}
                    title="Delete User"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || roleFilter !== 'all' 
                  ? 'No users match your search criteria.'
                  : 'Users will appear here as they register.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <UserDetails
          user={selectedUser}
          onClose={() => {
            setShowDetails(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;