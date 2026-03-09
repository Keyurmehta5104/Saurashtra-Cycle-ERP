import { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Bell,
  Eye,
  BarChart3,
  Zap,
  Target,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { SaleOrder, InventoryItem, Customer, PurchaseOrder, ServiceJob } from '@/types/firebase';
import { useNavigate } from 'react-router-dom';

interface ERPModule {
  name: string;
  icon: React.ElementType;
  status: 'active' | 'warning' | 'inactive';
  activity: number;
  lastActive: string;
  users: number;
  path: string;
}

export default function ERPVisibilityDashboard() {
  const navigate = useNavigate();
  const { data: salesData = [] } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);
  const { data: inventoryData = [] } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);
  const { data: customersData = [] } = useFirestoreCollection<Customer>(COLLECTIONS.CUSTOMERS);
  const { data: purchasesData = [] } = useFirestoreCollection<PurchaseOrder>(COLLECTIONS.PURCHASES);
  const { data: serviceData = [] } = useFirestoreCollection<ServiceJob>(COLLECTIONS.SERVICES);

  const [moduleActivity, setModuleActivity] = useState<ERPModule[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  // Calculate module statistics
  useEffect(() => {
    const modules: ERPModule[] = [
      {
        name: 'Sales',
        icon: ShoppingCart,
        status: salesData?.length > 10 ? 'active' : salesData?.length > 5 ? 'warning' : 'inactive',
        activity: salesData?.length || 0,
        lastActive: salesData?.[0]?.date ? new Date(salesData[0].date).toLocaleDateString() : 'N/A',
        users: 5,
        path: '/sales',
      },
      {
        name: 'Inventory',
        icon: Package,
        status: inventoryData?.some(i => i.stock < 10) ? 'warning' : 'active',
        activity: inventoryData?.length || 0,
        lastActive: 'Today',
        users: 8,
        path: '/inventory',
      },
      {
        name: 'Purchases',
        icon: DollarSign,
        status: purchasesData?.length > 5 ? 'active' : 'warning',
        activity: purchasesData?.length || 0,
        lastActive: purchasesData?.[0]?.orderDate ? new Date(purchasesData[0].orderDate).toLocaleDateString() : 'N/A',
        users: 3,
        path: '/purchases',
      },
      {
        name: 'Services',
        icon: Activity,
        status: serviceData?.some(s => s.status === 'In Progress') ? 'active' : 'warning',
        activity: serviceData?.length || 0,
        lastActive: serviceData?.[0]?.receivedDate ? new Date(serviceData[0].receivedDate).toLocaleDateString() : 'N/A',
        users: 6,
        path: '/service',
      },
      {
        name: 'Customers',
        icon: Users,
        status: customersData?.length > 20 ? 'active' : 'warning',
        activity: customersData?.length || 0,
        lastActive: 'Today',
        users: 4,
        path: '/customers',
      },
    ];

    setModuleActivity(modules);
    setTotalActivities(modules.reduce((sum, m) => sum + m.activity, 0));
    setActiveUsers(modules.reduce((sum, m) => sum + m.users, 0));
  }, [salesData, inventoryData, purchasesData, serviceData, customersData]);

  // Recent activities across all modules
  const recentActivities = [
    ...salesData?.slice(0, 3).map(sale => ({
      type: 'Sale',
      description: `New sale order #${sale.invoiceNumber || 'SCH-' + sale.id?.substring(0, 4)}`,
      time: sale.date ? new Date(sale.date).toLocaleString() : 'Recently',
      icon: ShoppingCart,
      color: 'text-green-500',
    })) || [],
    ...serviceData?.slice(0, 2).map(service => ({
      type: 'Service',
      description: `${service.customerName}'s ${service.vehicleModel} - ${service.status}`,
      time: service.receivedDate ? new Date(service.receivedDate).toLocaleString() : 'Recently',
      icon: Activity,
      color: 'text-blue-500',
    })) || [],
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  // Calculate low stock alerts
  const lowStockItems = inventoryData?.filter(item => item.stock < 10).length || 0;
  const pendingServices = serviceData?.filter(s => s.status === 'In Progress').length || 0;

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              ERP Visibility Center
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time overview of all ERP functionalities
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            View Reports
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* System-wide KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Total Activities</p>
                <p className="text-2xl font-bold text-blue-900">{totalActivities}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>
          
          <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">Active Users</p>
                <p className="text-2xl font-bold text-green-900">{activeUsers}</p>
              </div>
              <Users className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
          
          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">Modules Active</p>
                <p className="text-2xl font-bold text-purple-900">{moduleActivity.filter(m => m.status === 'active').length}/{moduleActivity.length}</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>
          
          <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-medium">Alerts</p>
                <p className="text-2xl font-bold text-orange-900">{lowStockItems + pendingServices}</p>
              </div>
              <Bell className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Module Status Grid */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Module Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {moduleActivity.map((module) => (
              <button
                key={module.name}
                onClick={() => navigate(module.path)}
                className="p-3 border rounded-lg hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <module.icon className={`w-5 h-5 ${
                    module.status === 'active' ? 'text-green-500' :
                    module.status === 'warning' ? 'text-orange-500' : 'text-gray-400'
                  }`} />
                  <Badge variant={module.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {module.status === 'active' ? 'Active' : module.status === 'warning' ? 'Warning' : 'Inactive'}
                  </Badge>
                </div>
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">{module.name}</p>
                <p className="text-xs text-muted-foreground">{module.activity} records</p>
                <p className="text-xs text-muted-foreground mt-1">Last: {module.lastActive}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Alerts & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Alerts */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Requires Attention
            </h3>
            <div className="space-y-2">
              {lowStockItems > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">{lowStockItems} low stock items</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
                    View
                  </Button>
                </div>
              )}
              {pendingServices > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{pendingServices} services in progress</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/service')}>
                    View
                  </Button>
                </div>
              )}
              {lowStockItems === 0 && pendingServices === 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">All systems operational</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Activity
            </h3>
            <div className="space-y-2">
              {recentActivities.map((activity, index) => (
                <div key={index} className="p-2 bg-secondary/30 rounded-lg flex items-start gap-2">
                  <activity.icon className={`w-4 h-4 ${activity.color} mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
