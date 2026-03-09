import { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Lock, Bell, CreditCard, Building2, Calendar, Camera, Save, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '+91 98765 43210',
    address: '123 Main Street, Mumbai, Maharashtra',
    role: 'customer',
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    privacy: {
      profileVisible: true,
      shareData: false
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationToggle = (type: string) => {
    setUserData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handlePrivacyToggle = (type: string) => {
    setUserData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: !prev.privacy[type]
      }
    }));
  };

  const handleSave = () => {
    // Here you would typically make an API call to save the user settings
    console.log('Saving user data:', userData);
    // In a real application, you would update the user profile in Firebase here
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Account Settings
        </h1>
        <p className="text-muted-foreground">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full w-6 h-6">
                  <Camera className="w-3 h-3" />
                </Button>
              </div>
              <div>
                <h3 className="font-medium">{user?.displayName || 'User Name'}</h3>
                <p className="text-sm text-muted-foreground">{user?.email || 'Email'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={userData.name} 
                  onChange={(e) => handleInputChange('name', e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={userData.email} 
                  onChange={(e) => handleInputChange('email', e.target.value)} 
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={userData.phone} 
                  onChange={(e) => handleInputChange('phone', e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={userData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                value={userData.address} 
                onChange={(e) => handleInputChange('address', e.target.value)} 
              />
            </div>

            <Button onClick={handleSave} className="w-full md:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full">
                <Bell className="w-4 h-4 mr-2" />
                Manage Sessions
              </Button>
              <Button variant="outline" className="w-full">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment Methods
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch 
                  checked={userData.notifications.email} 
                  onCheckedChange={() => handleNotificationToggle('email')} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                </div>
                <Switch 
                  checked={userData.notifications.sms} 
                  onCheckedChange={() => handleNotificationToggle('sms')} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications</p>
                </div>
                <Switch 
                  checked={userData.notifications.push} 
                  onCheckedChange={() => handleNotificationToggle('push')} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profile Visibility</p>
                  <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
                </div>
                <Switch 
                  checked={userData.privacy.profileVisible} 
                  onCheckedChange={() => handlePrivacyToggle('profileVisible')} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Share Data</p>
                  <p className="text-sm text-muted-foreground">Allow sharing of personal data</p>
                </div>
                <Switch 
                  checked={userData.privacy.shareData} 
                  onCheckedChange={() => handlePrivacyToggle('shareData')} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="destructive" className="w-full sm:w-auto">
              <X className="w-4 h-4 mr-2" />
              Deactivate Account
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <Upload className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}