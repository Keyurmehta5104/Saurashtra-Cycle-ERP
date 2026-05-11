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
  const totalSales = salesData?.reduce((sum, sale) => sum + (Number(sale?.grandTotal) || 0), 0) || 0;
  const totalInventoryValue = inventoryData?.reduce((sum, item) => sum + ((Number(item?.price) || 0) * (Number(item?.stock) || 0)), 0) || 0;
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
          <div className="card-enhanced p-6">
            <div className="flex flex-row items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Sales & Financial Overview
              </h2>
              <Select defaultValue="monthly">
                <SelectTrigger className="w-[140px] h-9 text-xs">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <SalesChart />
              </div>
              <div className="space-y-3">
                <div className="metric-card p-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Revenue</p>
                  <p className="text-xl font-bold text-foreground">₹{totalSales.toLocaleString()}</p>
                </div>
                <div className="metric-card p-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Inventory Value</p>
                  <p className="text-xl font-bold text-foreground">₹{totalInventoryValue.toLocaleString()}</p>
                </div>
                <div className="metric-card p-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Active Customers</p>
                  <p className="text-xl font-bold text-foreground">{totalCustomers}</p>
                </div>
                <div className="metric-card p-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Products</p>
                  <p className="text-xl font-bold text-foreground">{totalItems}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Tabs */}
          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-md border border-border h-11">
              <TabsTrigger value="sales" className="text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Recent Sales</TabsTrigger>
              <TabsTrigger value="customers" className="text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Recent Customers</TabsTrigger>
              <TabsTrigger value="activity" className="text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Activity Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="sales">
              <div className="card-enhanced p-5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Recent Sales</h3>
                <RecentSalesWithData sales={recentSales} loading={loading} />
              </div>
            </TabsContent>
            <TabsContent value="customers">
              <div className="card-enhanced p-5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Recent Customers</h3>
                <div className="space-y-3">
                  {recentCustomers.length > 0 ? (
                    recentCustomers.map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/30 transition-colors">
                        <div>
                          <p className="font-bold text-sm">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/20">
                            {customer.type || 'Regular'}
                          </span>
                          <Button variant="outline" size="sm" className="h-8 text-xs font-bold uppercase tracking-wider px-3" onClick={() => navigate(`/customers/${customer.id}`)}>
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4 text-sm">No recent customers</p>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="activity">
              <div className="card-enhanced p-5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Recent Activity</h3>
                <UserActivityLogs />
              </div>
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

          {/* Low Stock Intelligence Widget */}
          <Card className="border-rose-200 bg-rose-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-rose-700 text-sm font-bold uppercase tracking-tight">
                <AlertTriangle className="w-4 h-4" />
                Low Stock Critical
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryData?.filter(i => i.stock < (i.reorderLevel || 5)).length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-green-700 uppercase">Stock Healthy</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {inventoryData
                        ?.filter(i => i.stock < (i.reorderLevel || 5))
                        .slice(0, 3)
                        .map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded border border-rose-100">
                            <div>
                              <p className="text-[10px] font-bold text-slate-900 truncate max-w-[120px]">{item.name}</p>
                              <p className="text-[9px] text-slate-500">Current: {item.stock} / Min: {item.reorderLevel || 5}</p>
                            </div>
                            <Badge variant="destructive" className="h-5 text-[9px] px-1.5 font-black uppercase">Low</Badge>
                          </div>
                        ))}
                    </div>
                    <Button 
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-widest h-9"
                      onClick={() => navigate('/purchases')}
                    >
                      Manage Procurement
                    </Button>
                  </>
                )}
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
