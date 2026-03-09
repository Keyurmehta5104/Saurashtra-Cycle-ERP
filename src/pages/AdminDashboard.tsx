import { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  IndianRupee, 
  BarChart3, 
  Activity, 
  Settings,
  TrendingUp,
  DollarSign,
  UserCheck,
  Shield,
  Database,
  Server,
  Bell,
  FileText,
  Calendar,
  Filter,
  Download,
  Eye,
  MoreVertical,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Award,
  MessageSquare,
  Star,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentSalesWithData } from '@/components/dashboard/RecentSalesWithData';
import { InventoryOverview } from '@/components/dashboard/InventoryOverview';
import { CustomQuickActions } from '@/components/dashboard/CustomQuickActions';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { Button } from '@/components/ui/button';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { SaleOrder, InventoryItem, Customer, PurchaseOrder } from '@/types/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import QuickStats from '@/components/QuickStats';
import UserActivityLogs from '@/components/UserActivityLogs';
import PersonalizedWelcome from '@/components/PersonalizedWelcome';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, updateDoc, doc, addDoc } from 'firebase/firestore';
import UserVerification from '@/components/UserVerification';
import UserActivityTracker from '@/components/UserActivityTracker';
import AdvancedReporting from '@/components/AdvancedReporting';
import TaskManagement from '@/components/TaskManagement';
import PerformanceMetrics from '@/components/PerformanceMetrics';
import SystemHealthMonitor from '@/components/SystemHealthMonitor';
import ERPVisibilityDashboard from '@/components/ERPVisibilityDashboard';
import ModuleStatusCards from '@/components/ModuleStatusCards';
import ActivityStream from '@/components/ActivityStream';
import FeatureUsageTracker from '@/components/FeatureUsageTracker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { data: salesData, loading: salesLoading } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);
  const { data: inventoryData, loading: inventoryLoading } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);
  const { data: customersData, loading: customersLoading } = useFirestoreCollection<Customer>(COLLECTIONS.CUSTOMERS);
  const { data: purchasesData, loading: purchasesLoading } = useFirestoreCollection<PurchaseOrder>(COLLECTIONS.PURCHASES);

  const loading = salesLoading || inventoryLoading || customersLoading || purchasesLoading;

  // Calculate stats
  const totalSales = salesData?.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0) || 0;
  const totalInventoryValue = inventoryData?.reduce((sum, item) => sum + (item.price * item.stock), 0) || 0;
  const totalCustomers = customersData?.length || 0;
  const totalItems = inventoryData?.length || 0;

  // Recent activity
  const recentSales = salesData?.slice(0, 5) || [];
  const recentCustomers = customersData?.slice(0, 5) || [];

  // Quick actions for admin
  const adminQuickActions = [
    {
      title: "Add New Product",
      icon: Package,
      onClick: () => navigate('/inventory/add'),
      color: "bg-blue-500",
    },
    {
      title: "Create New Sale",
      icon: ShoppingCart,
      onClick: () => navigate('/sales/new'),
      color: "bg-green-500",
    },
    {
      title: "Add New Customer",
      icon: Users,
      onClick: () => navigate('/customers/new'),
      color: "bg-purple-500",
    },
    {
      title: "New Purchase Order",
      icon: IndianRupee,
      onClick: () => navigate('/purchases'),
      color: "bg-orange-500",
    },
    {
      title: "Generate Report",
      icon: BarChart3,
      onClick: () => navigate('/reports'),
      color: "bg-indigo-500",
    },
    {
      title: "Manage Users",
      icon: UserCheck,
      onClick: () => navigate('/settings'),
      color: "bg-rose-500",
    },
    {
      title: "Schedule Maintenance",
      icon: Calendar,
      onClick: () => navigate('/service/schedule'),
      color: "bg-amber-500",
    },
    {
      title: "View Audit Logs",
      icon: Activity,
      onClick: () => navigate('/audit-logs'),
      color: "bg-slate-500",
    },
  ];

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Shield className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">You don't have admin privileges to access this page</p>
        <Button onClick={() => navigate('/')}>Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Personalized Welcome */}
      <PersonalizedWelcome isAdmin={true} onLogout={logout} />

      {/* Quick Stats */}
      <QuickStats isAdmin={true} />

      {/* Quick Actions */}
      <CustomQuickActions actions={adminQuickActions} />

      {/* Enhanced Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Sales and Financial Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sales & Financial Overview
              </CardTitle>
              <Select defaultValue="monthly">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="lg:col-span-1">
                  <SalesChart />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Total Revenue</span>
                    <span className="font-semibold text-lg">₹{totalSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Inventory Value</span>
                    <span className="font-semibold text-lg">₹{totalInventoryValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Active Customers</span>
                    <span className="font-semibold text-lg">{totalCustomers}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Products</span>
                    <span className="font-semibold text-lg">{totalItems}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Tabs */}
          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sales">Recent Sales</TabsTrigger>
              <TabsTrigger value="customers">Recent Customers</TabsTrigger>
              <TabsTrigger value="activity">Activity Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentSalesWithData sales={recentSales} loading={loading} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="customers">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentCustomers.length > 0 ? (
                      recentCustomers.map((customer) => (
                        <div key={customer.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                              {customer.type || 'Regular'}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/customers/${customer.id}`)}>
                              View
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No recent customers</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserActivityLogs />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Admin Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Admin Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate('/settings')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate('/reports')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Reports & Analytics
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate('/admin/users')}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  User Management
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate('/audit-logs')}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Audit Logs
                </Button>
                <Separator />
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={logout}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Inventory Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Low Stock Items</span>
                  <Badge variant="destructive" className="text-xs">12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Out of Stock</span>
                  <Badge variant="destructive" className="text-xs">3</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">New Arrivals</span>
                  <Badge variant="default" className="text-xs">8</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Categories</span>
                  <span className="font-medium">12</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Uptime</span>
                  <Badge variant="default" className="text-xs">99.9%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Database</span>
                  <Badge variant="default" className="text-xs">Operational</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Backup</span>
                  <Badge variant="default" className="text-xs">Success</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Security</span>
                  <Badge variant="default" className="text-xs">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inventory Overview */}
      <InventoryOverview />
      
      {/* User Verification & Management */}
      <UserVerification isAdmin={true} />

      {/* User Activity Tracker */}
      <UserActivityTracker isAdmin={true} />

      {/* Advanced Reporting */}
      <AdvancedReporting />

      {/* Task Management */}
      <TaskManagement />

      {/* Performance Metrics */}
      <PerformanceMetrics />

      {/* System Health Monitor */}
      <SystemHealthMonitor />
    </div>
  );
}
