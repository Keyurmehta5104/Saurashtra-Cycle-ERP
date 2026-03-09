import { useState, useEffect } from 'react';
import { 
  Activity,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Wrench,
  Clock,
  Search,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { SaleOrder, InventoryItem, Customer, PurchaseOrder, ServiceJob } from '@/types/firebase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ActivityItem {
  id: string;
  type: 'sale' | 'inventory' | 'customer' | 'purchase' | 'service';
  action: string;
  description: string;
  timestamp: Date;
  user?: string;
  module: string;
  icon: React.ElementType;
  color: string;
  metadata?: Record<string, unknown>;
}

export default function ActivityStream() {
  const { data: salesData = [] } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);
  const { data: inventoryData = [] } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);
  const { data: customersData = [] } = useFirestoreCollection<Customer>(COLLECTIONS.CUSTOMERS);
  const { data: purchasesData = [] } = useFirestoreCollection<PurchaseOrder>(COLLECTIONS.PURCHASES);
  const { data: serviceData = [] } = useFirestoreCollection<ServiceJob>(COLLECTIONS.SERVICES);

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [filterModule, setFilterModule] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'all' | 'today' | 'week'>('all');

  // Generate activities from all modules
  useEffect(() => {
    const generatedActivities: ActivityItem[] = [];

    // Sales activities
    salesData?.slice(0, 10).forEach(sale => {
      if (sale.id) {
        generatedActivities.push({
          id: `sale-${sale.id}`,
          type: 'sale',
          action: 'created',
          description: `New sale order #${sale.invoiceNumber || 'SCH-' + sale.id.substring(0, 4)} for ₹${sale.grandTotal || 0}`,
          timestamp: sale.date ? new Date(sale.date) : new Date(),
          user: sale.createdBy,
          module: 'Sales',
          icon: ShoppingCart,
          color: 'text-blue-500',
          metadata: { orderId: sale.id, amount: sale.grandTotal },
        });
      }
    });

    // Inventory activities
    inventoryData?.slice(0, 5).forEach(item => {
      if (item.id && item.stock < 10) {
        generatedActivities.push({
          id: `inventory-${item.id}`,
          type: 'inventory',
          action: 'alert',
          description: `Low stock alert: ${item.name} (${item.stock} remaining)`,
          timestamp: item.lastUpdated ? new Date(item.lastUpdated) : new Date(),
          module: 'Inventory',
          icon: Package,
          color: 'text-orange-500',
          metadata: { itemId: item.id, stock: item.stock },
        });
      }
    });

    // Customer activities
    customersData?.slice(0, 5).forEach(customer => {
      if (customer.id) {
        generatedActivities.push({
          id: `customer-${customer.id}`,
          type: 'customer',
          action: 'registered',
          description: `New customer registered: ${customer.name}`,
          timestamp: customer.createdAt ? new Date(customer.createdAt) : new Date(),
          module: 'Customers',
          icon: Users,
          color: 'text-green-500',
          metadata: { customerId: customer.id },
        });
      }
    });

    // Purchase activities
    purchasesData?.slice(0, 5).forEach(purchase => {
      if (purchase.id) {
        generatedActivities.push({
          id: `purchase-${purchase.id}`,
          type: 'purchase',
          action: purchase.status === 'Pending' ? 'pending' : 'completed',
          description: `Purchase order #${purchase.orderNumber?.substring(0, 8) || 'PO-' + purchase.id.substring(0, 4)} - ${purchase.status}`,
          timestamp: purchase.orderDate ? new Date(purchase.orderDate) : new Date(),
          module: 'Purchases',
          icon: DollarSign,
          color: 'text-purple-500',
          metadata: { purchaseId: purchase.id, status: purchase.status },
        });
      }
    });

    // Service activities
    serviceData?.slice(0, 5).forEach(service => {
      if (service.id) {
        generatedActivities.push({
          id: `service-${service.id}`,
          type: 'service',
          action: service.status?.toLowerCase() || 'unknown',
          description: `${service.customerName}'s ${service.vehicleModel} - ${service.status}`,
          timestamp: service.receivedDate ? new Date(service.receivedDate) : new Date(),
          module: 'Services',
          icon: Wrench,
          color: 'text-orange-500',
          metadata: { serviceId: service.id, status: service.status },
        });
      }
    });

    // Sort by timestamp (FIXED: sort generatedActivities, not activities)
    const sortedActivities = [...generatedActivities].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
    setActivities(sortedActivities);
  }, [salesData, inventoryData, customersData, purchasesData, serviceData]);

  // Filter activities
  useEffect(() => {
    let filtered = [...activities];

    // Module filter
    if (filterModule !== 'all') {
      filtered = filtered.filter(a => a.module.toLowerCase() === filterModule.toLowerCase());
    }

    // Time range filter
    const now = new Date();
    if (timeRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(a => a.timestamp >= today);
    } else if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(a => a.timestamp >= weekAgo);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.module.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredActivities(filtered.slice(0, 20)); // Show top 20
  }, [activities, filterModule, searchQuery, timeRange]);

  // Group activities by time
  const groupActivitiesByTime = (items: ActivityItem[]) => {
    const groups: Record<string, ActivityItem[]> = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Earlier': [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    items.forEach(item => {
      if (item.timestamp >= today) {
        groups['Today'].push(item);
      } else if (item.timestamp >= yesterday) {
        groups['Yesterday'].push(item);
      } else if (item.timestamp >= weekAgo) {
        groups['This Week'].push(item);
      } else {
        groups['Earlier'].push(item);
      }
    });

    return groups;
  };

  const groupedActivities = groupActivitiesByTime(filteredActivities);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Activity Stream
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time activity feed from all ERP modules
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {filteredActivities.length} activities
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          
          <Select value={filterModule} onValueChange={setFilterModule}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Filter by module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="customers">Customers</SelectItem>
              <SelectItem value="purchases">Purchases</SelectItem>
              <SelectItem value="services">Services</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={(value: 'all' | 'today' | 'week') => setTimeRange(value)}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-h-[600px] overflow-y-auto">
          {Object.entries(groupedActivities).map(([period, items]) => (
            items.length > 0 && (
              <div key={period}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">{period}</h3>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {items.length}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {items.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                      <div className={`p-2 rounded-full bg-secondary/50 ${activity.color}`}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {activity.module}
                              </Badge>
                              {activity.user && (
                                <span className="text-xs text-muted-foreground">
                                  by {activity.user}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {activity.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {activity.timestamp.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Action-specific styling */}
                        {activity.action === 'alert' && (
                          <div className="flex items-center gap-1 mt-2 text-orange-600">
                            <AlertCircle className="w-3 h-3" />
                            <span className="text-xs font-medium">Requires attention</span>
                          </div>
                        )}
                        
                        {activity.action === 'completed' && (
                          <div className="flex items-center gap-1 mt-2 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-xs font-medium">Completed successfully</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No activities found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">
              {activities.filter(a => a.type === 'sale').length}
            </p>
            <p className="text-xs text-muted-foreground">Sales</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">
              {activities.filter(a => a.type === 'inventory' || a.type === 'service').length}
            </p>
            <p className="text-xs text-muted-foreground">Alerts & Services</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">
              {activities.filter(a => a.type === 'customer').length}
            </p>
            <p className="text-xs text-muted-foreground">New Customers</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}