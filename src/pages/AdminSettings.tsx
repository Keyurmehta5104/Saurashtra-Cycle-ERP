import { useState } from 'react';
import { 
  Settings, 
  Building2, 
  CreditCard, 
  Users, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Save, 
  Globe,
  Key,
  Lock,
  Activity,
  HardDrive,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const [generalSettings, setGeneralSettings] = useState({
    businessName: 'Saurashtra Cycle Hub',
    businessEmail: 'admin@saurashtra.com',
    businessPhone: '+91 98765 43210',
    businessAddress: '123, Main Street, Rajkot, Gujarat',
    taxNumber: '24AAAAA0000A1Z5',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    lowStock: true,
    newOrders: true,
    serviceReminders: true,
    userRegistration: true,
    systemUpdates: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordExpiry: false,
    sessionTimeout: 30, // in minutes
    maxLoginAttempts: 5,
    ipWhitelist: '',
  });

  const [erpFeatures, setErpFeatures] = useState({
    enableServiceWorkflow: true,
    enablePurchaseApproval: true,
    autoInvoice: true,
    autoStockUpdate: true,
    enableInventoryAlerts: true,
    enableCustomerPortal: false,
    enableSupplierPortal: false,
    enableAnalytics: true,
  });

  const [taxSettings, setTaxSettings] = useState({
    gstEnabled: true,
    gstRate: 18,
    taxType: 'gst',
    enableMultipleTaxes: false,
    cgstRate: 9,
    sgstRate: 9,
  });

  const handleSaveGeneral = () => {
    toast({
      title: "Settings Saved",
      description: "General settings have been updated successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Settings Saved",
      description: "Notification settings have been updated successfully.",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Settings Saved",
      description: "Security settings have been updated successfully.",
    });
  };

  const handleSaveErp = () => {
    toast({
      title: "Settings Saved",
      description: "ERP features have been updated successfully.",
    });
  };

  const handleSaveTaxes = () => {
    toast({
      title: "Settings Saved",
      description: "Tax settings have been updated successfully.",
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your ERP system settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">Cancel</Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="features">ERP Features</TabsTrigger>
          <TabsTrigger value="taxes">Taxes</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={generalSettings.businessName}
                    onChange={(e) => setGeneralSettings({...generalSettings, businessName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={generalSettings.businessEmail}
                    onChange={(e) => setGeneralSettings({...generalSettings, businessEmail: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input
                    id="businessPhone"
                    value={generalSettings.businessPhone}
                    onChange={(e) => setGeneralSettings({...generalSettings, businessPhone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Input
                    id="businessAddress"
                    value={generalSettings.businessAddress}
                    onChange={(e) => setGeneralSettings({...generalSettings, businessAddress: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">Tax Number (GSTIN)</Label>
                  <Input
                    id="taxNumber"
                    value={generalSettings.taxNumber}
                    onChange={(e) => setGeneralSettings({...generalSettings, taxNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={generalSettings.currency} 
                    onValueChange={(value) => setGeneralSettings({...generalSettings, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={generalSettings.timezone} 
                    onValueChange={(value) => setGeneralSettings({...generalSettings, timezone: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">India Standard Time</SelectItem>
                      <SelectItem value="UTC">Coordinated Universal Time</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="Europe/London">Greenwich Mean Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral}>
                  <Save className="w-4 h-4 mr-2" />
                  Save General Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-sm font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="low-stock" className="text-sm font-medium">
                      Low Stock Alerts
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when inventory levels are low
                    </p>
                  </div>
                  <Switch
                    id="low-stock"
                    checked={notifications.lowStock}
                    onCheckedChange={(checked) => setNotifications({...notifications, lowStock: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-orders" className="text-sm font-medium">
                      New Orders
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive alerts for new orders
                    </p>
                  </div>
                  <Switch
                    id="new-orders"
                    checked={notifications.newOrders}
                    onCheckedChange={(checked) => setNotifications({...notifications, newOrders: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="service-reminders" className="text-sm font-medium">
                      Service Reminders
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get reminders for scheduled services
                    </p>
                  </div>
                  <Switch
                    id="service-reminders"
                    checked={notifications.serviceReminders}
                    onCheckedChange={(checked) => setNotifications({...notifications, serviceReminders: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="user-registration" className="text-sm font-medium">
                      User Registration
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when new users register
                    </p>
                  </div>
                  <Switch
                    id="user-registration"
                    checked={notifications.userRegistration}
                    onCheckedChange={(checked) => setNotifications({...notifications, userRegistration: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-updates" className="text-sm font-medium">
                      System Updates
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications about system updates
                    </p>
                  </div>
                  <Switch
                    id="system-updates"
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) => setNotifications({...notifications, systemUpdates: checked})}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor-auth" className="text-sm font-medium">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Require additional verification for login
                    </p>
                  </div>
                  <Switch
                    id="two-factor-auth"
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="password-expiry" className="text-sm font-medium">
                      Password Expiry
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Force users to change passwords periodically
                    </p>
                  </div>
                  <Switch
                    id="password-expiry"
                    checked={securitySettings.passwordExpiry}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordExpiry: checked})}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value) || 30})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                    <Input
                      id="max-login-attempts"
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value) || 5})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ip-whitelist">IP Whitelist (comma separated)</Label>
                  <Input
                    id="ip-whitelist"
                    placeholder="192.168.1.1, 10.0.0.1"
                    value={securitySettings.ipWhitelist}
                    onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Restrict access to specific IP addresses
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSecurity}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ERP Features */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                ERP Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="service-workflow" className="text-sm font-medium">
                      Service Workflow
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable service management workflow
                    </p>
                  </div>
                  <Switch
                    id="service-workflow"
                    checked={erpFeatures.enableServiceWorkflow}
                    onCheckedChange={(checked) => setErpFeatures({...erpFeatures, enableServiceWorkflow: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="purchase-approval" className="text-sm font-medium">
                      Purchase Approval
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Require approval for purchase orders
                    </p>
                  </div>
                  <Switch
                    id="purchase-approval"
                    checked={erpFeatures.enablePurchaseApproval}
                    onCheckedChange={(checked) => setErpFeatures({...erpFeatures, enablePurchaseApproval: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-invoice" className="text-sm font-medium">
                      Auto Invoice Generation
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically generate invoices for sales
                    </p>
                  </div>
                  <Switch
                    id="auto-invoice"
                    checked={erpFeatures.autoInvoice}
                    onCheckedChange={(checked) => setErpFeatures({...erpFeatures, autoInvoice: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-stock-update" className="text-sm font-medium">
                      Auto Stock Update
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically update stock levels
                    </p>
                  </div>
                  <Switch
                    id="auto-stock-update"
                    checked={erpFeatures.autoStockUpdate}
                    onCheckedChange={(checked) => setErpFeatures({...erpFeatures, autoStockUpdate: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="inventory-alerts" className="text-sm font-medium">
                      Inventory Alerts
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable inventory level alerts
                    </p>
                  </div>
                  <Switch
                    id="inventory-alerts"
                    checked={erpFeatures.enableInventoryAlerts}
                    onCheckedChange={(checked) => setErpFeatures({...erpFeatures, enableInventoryAlerts: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="customer-portal" className="text-sm font-medium">
                      Customer Portal
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable customer self-service portal
                    </p>
                  </div>
                  <Switch
                    id="customer-portal"
                    checked={erpFeatures.enableCustomerPortal}
                    onCheckedChange={(checked) => setErpFeatures({...erpFeatures, enableCustomerPortal: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="supplier-portal" className="text-sm font-medium">
                      Supplier Portal
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable supplier self-service portal
                    </p>
                  </div>
                  <Switch
                    id="supplier-portal"
                    checked={erpFeatures.enableSupplierPortal}
                    onCheckedChange={(checked) => setErpFeatures({...erpFeatures, enableSupplierPortal: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics" className="text-sm font-medium">
                      Advanced Analytics
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable detailed analytics and reporting
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={erpFeatures.enableAnalytics}
                    onCheckedChange={(checked) => setErpFeatures({...erpFeatures, enableAnalytics: checked})}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveErp}>
                  <Save className="w-4 h-4 mr-2" />
                  Save ERP Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Settings */}
        <TabsContent value="taxes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Tax Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="gst-enabled" className="text-sm font-medium">
                      Enable GST
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable Goods and Services Tax calculations
                    </p>
                  </div>
                  <Switch
                    id="gst-enabled"
                    checked={taxSettings.gstEnabled}
                    onCheckedChange={(checked) => setTaxSettings({...taxSettings, gstEnabled: checked})}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax-type">Tax Type</Label>
                    <Select 
                      value={taxSettings.taxType} 
                      onValueChange={(value) => setTaxSettings({...taxSettings, taxType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gst">GST</SelectItem>
                        <SelectItem value="vat">VAT</SelectItem>
                        <SelectItem value="sales">Sales Tax</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gst-rate">GST Rate (%)</Label>
                    <Input
                      id="gst-rate"
                      type="number"
                      value={taxSettings.gstRate}
                      onChange={(e) => setTaxSettings({...taxSettings, gstRate: parseFloat(e.target.value) || 18})}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="multiple-taxes" className="text-sm font-medium">
                      Enable Multiple Taxes
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Enable CGST, SGST, and IGST calculations
                    </p>
                  </div>
                  <Switch
                    id="multiple-taxes"
                    checked={taxSettings.enableMultipleTaxes}
                    onCheckedChange={(checked) => setTaxSettings({...taxSettings, enableMultipleTaxes: checked})}
                  />
                </div>
                
                {taxSettings.enableMultipleTaxes && (
                  <div className="grid md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="cgst-rate">CGST Rate (%)</Label>
                      <Input
                        id="cgst-rate"
                        type="number"
                        value={taxSettings.cgstRate}
                        onChange={(e) => setTaxSettings({...taxSettings, cgstRate: parseFloat(e.target.value) || 9})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sgst-rate">SGST Rate (%)</Label>
                      <Input
                        id="sgst-rate"
                        type="number"
                        value={taxSettings.sgstRate}
                        onChange={(e) => setTaxSettings({...taxSettings, sgstRate: parseFloat(e.target.value) || 9})}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveTaxes}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Tax Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}