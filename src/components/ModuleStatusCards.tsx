import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Activity, 
  Users, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { SaleOrder, InventoryItem, Customer, PurchaseOrder, ServiceJob } from '@/types/firebase';
import { useNavigate } from 'react-router-dom';

interface ModuleMetric {
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

interface ModuleStatus {
  name: string;
  icon: React.ElementType;
  color: string;
  status: 'operational' | 'warning' | 'critical';
  metrics: ModuleMetric[];
  path: string;
  lastUpdated: string;
}

export default function ModuleStatusCards() {
  const navigate = useNavigate();
  const { data: salesData = [] } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);
  const { data: inventoryData = [] } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);
  const { data: customersData = [] } = useFirestoreCollection<Customer>(COLLECTIONS.CUSTOMERS);
  const { data: purchasesData = [] } = useFirestoreCollection<PurchaseOrder>(COLLECTIONS.PURCHASES);
  const { data: serviceData = [] } = useFirestoreCollection<ServiceJob>(COLLECTIONS.SERVICES);

  const [modules, setModules] = useState<ModuleStatus[]>([]);

  useEffect(() => {
    // Calculate sales metrics
    const totalSalesRevenue = salesData?.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0) || 0;
    const pendingInvoices = salesData?.filter(s => s.paymentStatus === 'Pending').length || 0;
    
    // Calculate inventory metrics
    const lowStockItems = inventoryData?.filter(item => item.stock < 10).length || 0;
    const outOfStockItems = inventoryData?.filter(item => item.stock === 0).length || 0;
    const totalInventoryValue = inventoryData?.reduce((sum, item) => sum + ((item.price || 0) * (item.stock || 0)), 0) || 0;
    
    // Calculate purchase metrics
    const pendingPurchases = purchasesData?.filter(p => p.status === 'Pending').length || 0;
    const totalPurchaseValue = purchasesData?.reduce((sum, purchase) => sum + (purchase.total || 0), 0) || 0;
    
    // Calculate service metrics
    const inProgressServices = serviceData?.filter(s => s.status === 'In Progress').length || 0;
    const completedToday = serviceData?.filter(s => {
      if (!s.completedDate) return false;
      const today = new Date();
      const completed = new Date(s.completedDate);
      return completed.getDate() === today.getDate() && 
             completed.getMonth() === today.getMonth() && 
             completed.getFullYear() === today.getFullYear();
    }).length || 0;
    
    // Calculate customer metrics
    const newCustomersThisMonth = customersData?.filter(c => {
      if (!c.createdAt) return false;
      const now = new Date();
      const created = new Date(c.createdAt);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length || 0;

    const moduleData: ModuleStatus[] = [
      {
        name: 'Sales',
        icon: ShoppingCart,
        color: 'blue',
        status: totalSalesRevenue > 100000 ? 'operational' : 'warning',
        metrics: [
          { label: 'Total Revenue', value: `₹${(totalSalesRevenue / 1000).toFixed(1)}k`, trend: 'up', change: 12.5 },
          { label: 'Orders', value: salesData?.length || 0, trend: 'up', change: 8.2 },
          { label: 'Pending Invoices', value: pendingInvoices, trend: pendingInvoices > 5 ? 'down' : 'stable' },
        ],
        path: '/sales',
        lastUpdated: new Date().toLocaleTimeString(),
      },
      {
        name: 'Inventory',
        icon: Package,
        color: 'green',
        status: lowStockItems > 5 ? 'warning' : outOfStockItems > 0 ? 'critical' : 'operational',
        metrics: [
          { label: 'Total Items', value: inventoryData?.length || 0, trend: 'stable' },
          { label: 'Inventory Value', value: `₹${(totalInventoryValue / 1000).toFixed(1)}k`, trend: 'up', change: 5.3 },
          { label: 'Low Stock', value: lowStockItems, trend: lowStockItems > 0 ? 'down' : 'stable' },
          { label: 'Out of Stock', value: outOfStockItems, trend: outOfStockItems > 0 ? 'down' : 'stable' },
        ],
        path: '/inventory',
        lastUpdated: new Date().toLocaleTimeString(),
      },
      {
        name: 'Purchases',
        icon: DollarSign,
        color: 'purple',
        status: pendingPurchases > 3 ? 'warning' : 'operational',
        metrics: [
          { label: 'Total Purchases', value: `₹${(totalPurchaseValue / 1000).toFixed(1)}k`, trend: 'up', change: 3.7 },
          { label: 'Orders', value: purchasesData?.length || 0, trend: 'stable' },
          { label: 'Pending', value: pendingPurchases, trend: pendingPurchases > 0 ? 'down' : 'stable' },
        ],
        path: '/purchases',
        lastUpdated: new Date().toLocaleTimeString(),
      },
      {
        name: 'Services',
        icon: Activity,
        color: 'orange',
        status: inProgressServices > 5 ? 'operational' : 'warning',
        metrics: [
          { label: 'Active Jobs', value: inProgressServices, trend: 'up', change: 15.2 },
          { label: 'Completed Today', value: completedToday, trend: 'up', change: 22.1 },
          { label: 'Total Services', value: serviceData?.length || 0, trend: 'stable' },
        ],
        path: '/service',
        lastUpdated: new Date().toLocaleTimeString(),
      },
      {
        name: 'Customers',
        icon: Users,
        color: 'pink',
        status: customersData?.length > 50 ? 'operational' : 'warning',
        metrics: [
          { label: 'Total Customers', value: customersData?.length || 0, trend: 'up', change: 9.4 },
          { label: 'New This Month', value: newCustomersThisMonth, trend: 'up', change: 18.3 },
          { label: 'Active Accounts', value: customersData?.filter(c => c.isActive !== false).length || 0, trend: 'stable' },
        ],
        path: '/customers',
        lastUpdated: new Date().toLocaleTimeString(),
      },
    ];

    setModules(moduleData);
  }, [salesData, inventoryData, purchasesData, serviceData, customersData]);

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      pink: 'bg-pink-500',
      red: 'bg-red-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Package className="w-5 h-5" />
          Module Health Status
        </h2>
        <Badge variant="outline">
          Updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {modules.map((module) => (
          <Card 
            key={module.name} 
            className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary/50"
            onClick={() => navigate(module.path)}
          >
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${getStatusColor(module.color)} bg-opacity-10`}>
                  <module.icon className={`w-5 h-5 ${getStatusColor(module.color).replace('bg-', 'text-')}`} />
                </div>
                {getStatusIcon(module.status)}
              </div>

              {/* Title */}
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {module.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Last updated: {module.lastUpdated}
                </p>
              </div>

              {/* Metrics */}
              <div className="space-y-2">
                {module.metrics.slice(0, 3).map((metric, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{metric.label}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold">{metric.value}</span>
                      {metric.change && (
                        <div className="flex items-center gap-0.5">
                          {getTrendIcon(metric.trend)}
                          <span className={`text-xs ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                            {metric.change}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Badge & Action */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Badge 
                  variant={module.status === 'operational' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {module.status === 'operational' ? 'Operational' : 
                   module.status === 'warning' ? 'Warning' : 'Critical'}
                </Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">
                  <strong>{modules.filter(m => m.status === 'operational').length}</strong> Operational
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm">
                  <strong>{modules.filter(m => m.status === 'warning').length}</strong> Warning
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm">
                  <strong>{modules.filter(m => m.status === 'critical').length}</strong> Critical
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
              View Full Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
