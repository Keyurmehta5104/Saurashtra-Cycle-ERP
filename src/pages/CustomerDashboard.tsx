import { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, ShoppingCart, Package, Star, Phone, MessageCircle, MapPin, User, Activity, Award, TrendingUp, Filter, Search, Heart, CreditCard, Shield, Truck, CheckCircle, AlertTriangle, Settings, Eye, MoreVertical, Download, BarChart3, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { SaleOrder, ServiceJob, Customer as CustomerType } from '@/types/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import UserVerification from '@/components/UserVerification';
import UserActivityTracker from '@/components/UserActivityTracker';
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

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: salesData } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);
  const { data: serviceData } = useFirestoreCollection<ServiceJob>(COLLECTIONS.SERVICES);

  const [customerStats, setCustomerStats] = useState({
    totalSpent: 0,
    totalOrders: 0,
    pendingServices: 0,
    completedServices: 0,
    avgOrderValue: 0,
    loyaltyPoints: 1250,
    discountPercentage: 15,
    membershipTier: 'Gold',
    lastOrderDate: '2024-01-10'
  });

  useEffect(() => {
    // Calculate customer-specific stats
    const customerSales = salesData.filter(sale => 
      (sale.customerName || '').toLowerCase().includes(user?.displayName?.toLowerCase() || user?.email?.split('@')[0].toLowerCase() || '')
    );
    
    const totalSpent = customerSales.reduce((sum, sale) => sum + sale.grandTotal, 0);
    const totalOrders = customerSales.length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    const customerServices = serviceData.filter(service => 
      (service.customer || '').toLowerCase().includes(user?.displayName?.toLowerCase() || user?.email?.split('@')[0].toLowerCase() || '')
    );
    
    const pendingServices = customerServices.filter(service => service.status === 'Pending' || service.status === 'In Progress').length;
    const completedServices = customerServices.filter(service => service.status === 'Completed').length;

    setCustomerStats({
      totalSpent,
      totalOrders,
      pendingServices,
      completedServices,
      avgOrderValue,
      loyaltyPoints: 1250,
      discountPercentage: 15,
      membershipTier: 'Gold',
      lastOrderDate: '2024-01-10'
    });
  }, [salesData, serviceData, user]);

  const recentOrders = salesData
    .filter(sale => 
      sale.customerName && 
      (sale.customerName || '').toLowerCase().includes(user?.displayName?.toLowerCase() || user?.email?.split('@')[0].toLowerCase() || '')
    )
    .slice(0, 5);

  const recentServices = serviceData
    .filter(service => 
      service.customer && 
      (service.customer || '').toLowerCase().includes(user?.displayName?.toLowerCase() || user?.email?.split('@')[0].toLowerCase() || '')
    )
    .slice(0, 5);

  const quickActions = [
    {
      title: "Book Service",
      icon: Calendar,
      color: "bg-blue-500",
      onClick: () => navigate('/service/new')
    },
    {
      title: "View Orders",
      icon: ShoppingCart,
      color: "bg-green-500",
      onClick: () => navigate('/sales')
    },
    {
      title: "Find Products",
      icon: Package,
      color: "bg-purple-500",
      onClick: () => navigate('/inventory')
    },
    {
      title: "Contact Support",
      icon: MessageCircle,
      color: "bg-orange-500",
      onClick: () => toast({ title: "Contact Support", description: "Please call us at +91 98765 43210" })
    },
    {
      title: "Track Order",
      icon: Truck,
      color: "bg-amber-500",
      onClick: () => navigate('/orders/track')
    },
    {
      title: "Rewards Center",
      icon: Gift,
      color: "bg-pink-500",
      onClick: () => navigate('/rewards')
    }
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Welcome Section */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground">
          <CardHeader className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Welcome, {user?.displayName || 'Valued Customer'}!</h2>
                <p className="text-primary-foreground/80">
                  We're glad to have you as part of Saurashtra Cycle Hub family.
                </p>
              </div>
            </div>
          </CardHeader>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">January 2024</p>
            </div>
            <div className="flex gap-3">
              <Badge className="bg-primary/20 text-primary-foreground">
                {customerStats.membershipTier} Member
              </Badge>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{customerStats.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Placed</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Total purchases</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.pendingServices}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(customerStats.avgOrderValue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty and Membership */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Loyalty Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{customerStats.loyaltyPoints}</div>
              <p className="text-sm text-muted-foreground mt-1">Available Points</p>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Next reward at 2000 points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Membership Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                {customerStats.membershipTier}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">Enjoy exclusive benefits</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{customerStats.discountPercentage}% discount</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Early access to products</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Next Reward
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Free Service</span>
                <span className="text-sm font-medium">₹750 value</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
              <p className="text-xs text-muted-foreground">750 more points needed</p>
              <Button size="sm" className="w-full mt-2">
                View Rewards
              </Button>
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

      {/* Recent Orders and Services */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="services">Service History</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/30">
                      <div>
                        <p className="font-medium">Order #{order.orderId}</p>
                        <p className="text-sm text-muted-foreground">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{order.grandTotal.toLocaleString()}</p>
                        <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No recent orders</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentServices.length > 0 ? (
                  recentServices.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/30">
                      <div>
                        <p className="font-medium">Service #{service.jobId}</p>
                        <p className="text-sm text-muted-foreground">{service.cycle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">₹{service.estimatedCost.toLocaleString()}</p>
                        <Badge variant={service.status === 'Completed' ? 'default' : 'secondary'}>
                          {service.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No service history</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <Shield className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-semibold">Extended Warranty</h3>
              <p className="text-sm text-muted-foreground">Extra protection for your cycles</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <Heart className="w-8 h-8 text-red-500 mb-2" />
              <h3 className="font-semibold">Loyalty Program</h3>
              <p className="text-sm text-muted-foreground">Earn points on every purchase</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <Truck className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-semibold">Free Delivery</h3>
              <p className="text-sm text-muted-foreground">On orders over ₹5000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback & Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Your average rating: 4.0/5</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                Leave Feedback
              </Button>
              <Button>
                <Heart className="w-4 h-4 mr-2" />
                Write Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Information */}
      <UserVerification isAdmin={false} />

      {/* My Activity */}
      <UserActivityTracker isAdmin={false} />
    </div>
  );
}