import { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Briefcase, Package, ShoppingCart, Users, TrendingUp, AlertTriangle, CheckCircle, Coffee, Activity, CheckCircle as CheckCircleIcon, Target, Award, MessageSquare, BarChart3, Settings, Eye, MoreVertical, Search, Filter, Download, TrendingDown, Star, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { SaleOrder, ServiceJob, Customer } from '@/types/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import UserVerification from '@/components/UserVerification';
import UserActivityTracker from '@/components/UserActivityTracker';
import TaskManagement from '@/components/TaskManagement';
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
import { Input } from '@/components/ui/input';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: salesData } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);
  const { data: serviceData } = useFirestoreCollection<ServiceJob>(COLLECTIONS.SERVICES);
  const { data: customersData } = useFirestoreCollection<Customer>(COLLECTIONS.CUSTOMERS);

  const [stats, setStats] = useState({
    todaySales: 0,
    weeklySales: 0,
    pendingServices: 0,
    completedServices: 0,
    newCustomers: 0,
    totalCommission: 0,
    shiftHours: 8,
    tasksCompleted: 15,
    tasksAssigned: 20,
    performanceRating: 4.5
  });

  useEffect(() => {
    // Calculate employee-specific stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySales = salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.toDateString() === today.toDateString();
    }).reduce((sum, sale) => sum + sale.grandTotal, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of current week
    
    const weeklySales = salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= weekStart;
    }).reduce((sum, sale) => sum + sale.grandTotal, 0);
    
    const pendingServices = serviceData.filter(job => job.status === 'Pending').length;
    const completedServices = serviceData.filter(job => job.status === 'Completed').length;
    const newCustomers = customersData.filter(customer => {
      const lastOrderDate = new Date(customer.lastOrder);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastOrderDate >= thirtyDaysAgo;
    }).length;
    
    // Calculate commission (assuming 2% of sales)
    const totalCommission = weeklySales * 0.02;

    setStats({
      todaySales,
      weeklySales,
      pendingServices,
      completedServices,
      newCustomers,
      totalCommission,
      shiftHours: 8,
      tasksCompleted: 15,
      tasksAssigned: 20,
      performanceRating: 4.5
    });
  }, [salesData, serviceData, customersData]);

  const quickActions = [
    {
      title: "Create New Sale",
      icon: ShoppingCart,
      color: "bg-blue-500",
      onClick: () => navigate('/sales/new')
    },
    {
      title: "Update Service Job",
      icon: Briefcase,
      color: "bg-green-500",
      onClick: () => navigate('/service/new')
    },
    {
      title: "Add New Customer",
      icon: Users,
      color: "bg-purple-500",
      onClick: () => navigate('/customers/new')
    },
    {
      title: "View Inventory",
      icon: Package,
      color: "bg-orange-500",
      onClick: () => navigate('/inventory')
    },
    {
      title: "Request Time Off",
      icon: Calendar,
      color: "bg-amber-500",
      onClick: () => toast({ title: "Feature coming soon", description: "Time off requests will be available soon" })
    },
    {
      title: "Update Profile",
      icon: User,
      color: "bg-slate-500",
      onClick: () => navigate('/settings')
    }
  ];

  const recentActivities = [
    { action: "Sale completed", amount: "₹12,500", time: "2 hours ago", type: "sale" },
    { action: "Service started", customer: "Rajesh K.", time: "4 hours ago", type: "service" },
    { action: "New customer added", name: "Priya M.", time: "Yesterday", type: "customer" },
    { action: "Inventory updated", item: "Brake Pads", time: "2 days ago", type: "inventory" }
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Welcome Section */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground">
          <CardHeader className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Good Day, {user?.displayName || 'Employee'}!</h2>
                <p className="text-primary-foreground/80">
                  Ready to serve customers and manage tasks.
                </p>
              </div>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Date</p>
              <p className="font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.todaySales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12.5% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.weeklySales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5.2% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Services</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingServices}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedServices}</div>
            <p className="text-xs text-muted-foreground">Jobs finished</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newCustomers}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalCommission.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Performance Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Sales Target</span>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Service Completion</span>
                  <span className="text-sm font-medium">88%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '88%'}}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Shift Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Shift Hours</span>
                <span className="text-sm font-medium">{stats.shiftHours}/8 hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tasks Completed</span>
                <span className="text-sm font-medium">{stats.tasksCompleted}/{stats.tasksAssigned}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                <span className="text-sm font-medium">{stats.performanceRating}/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Feedback Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-4xl font-bold text-primary">{stats.performanceRating}</div>
              <div className="flex mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(stats.performanceRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Based on 12 reviews</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="flex flex-col items-center justify-center h-24 gap-2"
                  onClick={action.onClick}
                >
                  <div className={`p-3 rounded-full ${action.color} text-white`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span>{action.title}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="mt-0.5">
                    {activity.type === 'sale' && <DollarSign className="w-4 h-4 text-green-500" />}
                    {activity.type === 'service' && <Briefcase className="w-4 h-4 text-blue-500" />}
                    {activity.type === 'customer' && <Users className="w-4 h-4 text-purple-500" />}
                    {activity.type === 'inventory' && <Package className="w-4 h-4 text-orange-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {activity.amount && <span>{activity.amount}</span>}
                      {activity.customer && <span>{activity.customer}</span>}
                      {activity.name && <span>{activity.name}</span>}
                      {activity.item && <span>{activity.item}</span>}
                      <Clock className="w-3 h-3" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Tasks</span>
              <Badge variant="outline">{stats.tasksAssigned - stats.tasksCompleted} remaining</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/30">
                <div>
                  <p className="font-medium">Service Job #SVC-001</p>
                  <p className="text-sm text-muted-foreground">Bicycle repair for Rajesh K.</p>
                </div>
                <Badge variant="default">High Priority</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/30">
                <div>
                  <p className="font-medium">Follow-up Call</p>
                  <p className="text-sm text-muted-foreground">Customer feedback for Priya M.</p>
                </div>
                <Badge variant="secondary">Scheduled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/30">
                <div>
                  <p className="font-medium">Inventory Check</p>
                  <p className="text-sm text-muted-foreground">Verify brake pads stock</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Information */}
      <UserVerification isAdmin={false} />

      {/* User Activity */}
      <UserActivityTracker isAdmin={false} />

      {/* Task Management */}
      <TaskManagement />
    </div>
  );
} 