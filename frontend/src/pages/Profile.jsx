import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  Save,
  Edit,
  X,
  CalendarClock,
  UserCheck,
  Settings,
  Calendar,
  Clock,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    // Load user data when component mounts
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    } else {
      // If user data is not available, try to refresh
      refreshUser().catch(error => {
        toast.error('Could not load profile data');
        navigate('/');
      });
    }
  }, [user, refreshUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset form data to current user data
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Phone validation (optional field)
    if (formData.phone && !/^[0-9+\- ]{10,15}$/.test(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-1">View and manage your personal information</p>
          </div>
          
          <div className="flex items-center gap-2 bg-muted/30 p-2 px-4 rounded-full text-muted-foreground text-sm">
            <User className="h-4 w-4" />
            <span>Account ID:</span>
            <span className="font-mono">{user?.id || 'N/A'}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden h-full border-2 hover:border-primary/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 pt-8 pb-5 px-4">
                <Avatar className="h-28 w-28 mx-auto mb-4 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-2xl font-bold">
                    {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <CardTitle className="text-2xl">{user?.name}</CardTitle>
                  {user?.isActive !== undefined && (
                    <div className="mt-2 mb-1">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Active Account' : 'Inactive Account'}
                      </span>
                    </div>
                  )}
                  <CardDescription className="mt-1.5">
                    {user?.isAdmin ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Administrator
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Customer
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              <CardContent className="space-y-5 pt-6">
                <div className="flex items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                    <CalendarClock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs text-muted-foreground">Member since</p>
                    <p className="text-sm font-medium">{formatDate(user?.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-6 px-6">
                <Button
                  variant="default"
                  onClick={() => navigate('/bookings')}
                  className="w-full py-5 text-base shadow-md hover:shadow-lg transition-shadow"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  View My Bookings
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Profile Edit Card */}
          <div className="lg:col-span-2">
            <Card className="h-full border-2 hover:border-primary/30 transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent pb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl">Personal Information</CardTitle>
                    <CardDescription className="mt-1.5">
                      Manage your personal information and account details
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button 
                      variant="outline" 
                      onClick={handleEdit}
                      className="border-primary/50 hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      onClick={handleCancel}
                      className="hover:bg-red-100 hover:text-red-600 transition-all"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={`p-4 rounded-lg ${isEditing ? 'bg-primary/5 border border-primary/20' : 'bg-muted/40'} transition-all`}>
                        <Label htmlFor="name" className={`text-sm ${isEditing ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          Full Name
                        </Label>
                        <div className="flex items-center mt-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          {isEditing ? (
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              disabled={loading}
                              placeholder="Enter your full name"
                              className="flex-1"
                            />
                          ) : (
                            <span className="text-base">{formData.name}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-lg ${isEditing ? 'bg-primary/5 border border-primary/20' : 'bg-muted/40'} transition-all`}>
                        <Label htmlFor="email" className={`text-sm ${isEditing ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          Email Address
                        </Label>
                        <div className="flex items-center mt-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                            <Mail className="h-4 w-4 text-primary" />
                          </div>
                          {isEditing ? (
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              disabled={loading}
                              placeholder="Enter your email"
                              className="flex-1"
                            />
                          ) : (
                            <span className="text-base">{formData.email}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-lg ${isEditing ? 'bg-primary/5 border border-primary/20' : 'bg-muted/40'} transition-all`}>
                        <Label htmlFor="phone" className={`text-sm ${isEditing ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          Phone Number
                        </Label>
                        <div className="flex items-center mt-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                            <Phone className="h-4 w-4 text-primary" />
                          </div>
                          {isEditing ? (
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              disabled={loading}
                              placeholder="Enter your phone number"
                              className="flex-1"
                            />
                          ) : (
                            <span className="text-base">{formData.phone || 'No phone number provided'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/20 rounded-lg p-4 mt-4">
                      <h3 className="text-md font-medium mb-4">Account Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 rounded-md bg-white border">
                          <div className="flex items-center mb-1">
                            <Clock className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm font-medium">Account Created</span>
                          </div>
                          <div className="ml-6 text-sm text-muted-foreground">
                            {formatDate(user?.createdAt)}
                          </div>
                        </div>
                        
                        <div className="p-3 rounded-md bg-white border">
                          <div className="flex items-center mb-1">
                            <UserCheck className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm font-medium">Account Type</span>
                          </div>
                          <div className="ml-6 text-sm text-muted-foreground">
                            {user?.isAdmin ? 'Administrator' : 'Customer'}
                          </div>
                        </div>
                        
                        <div className="p-3 rounded-md bg-white border">
                          <div className="flex items-center mb-1">
                            <UserCheck className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm font-medium">Account Status</span>
                          </div>
                          <div className="ml-6">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {user?.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-3 rounded-md bg-white border">
                          <div className="flex items-center mb-1">
                            <Settings className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm font-medium">Last Updated</span>
                          </div>
                          <div className="ml-6 text-sm text-muted-foreground">
                            {formatDate(user?.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="px-8 py-6 text-base shadow-md hover:shadow-lg transition-shadow"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
