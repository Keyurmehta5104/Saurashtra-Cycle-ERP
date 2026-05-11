import { useState, useEffect } from 'react';
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, AlertTriangle, Calendar, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { InventoryItem } from '@/types/firebase';
import { SaleOrder } from '@/types/firebase';
import { Customer } from '@/types/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface QuickStatsProps {
  isAdmin?: boolean;
}

export default function QuickStats({ isAdmin = false }: QuickStatsProps) {
  const { data: inventoryData, loading: inventoryLoading } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);
  const { data: salesData, loading: salesLoading } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);
  const { data: customersData, loading: customersLoading } = useFirestoreCollection<Customer>(COLLECTIONS.CUSTOMERS);
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    totalCustomers: 0,
    todaySales: 0,
    pendingOrders: 0,
    outOfStockItems: 0
  });

  useEffect(() => {
    // Calculate stats from the data with defensive checks
    const totalProducts = inventoryData?.length || 0;
    const totalSales = salesData?.length || 0;
    const totalRevenue = salesData?.reduce((sum, sale) => sum + (Number(sale?.grandTotal) || 0), 0) || 0;
    const lowStockItems = (inventoryData || []).filter(item => {
      const reorderLevel = Number(item?.reorderLevel) || 10;
      const currentStock = Number(item?.stock) || 0;
      return currentStock < reorderLevel && currentStock > 0;
    }).length;
    const outOfStockItems = (inventoryData || []).filter(item => (Number(item?.stock) || 0) === 0).length;
    const totalCustomers = customersData?.length || 0;
    
    // Calculate today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = (salesData || []).filter(sale => {
      if (!sale?.date) return false;
      const saleDate = new Date(sale.date);
      return saleDate.toDateString() === today.toDateString();
    }).reduce((sum, sale) => sum + (Number(sale?.grandTotal) || 0), 0) || 0;
    
    // Calculate pending orders
    const pendingOrders = (salesData || []).filter(sale => sale?.status === 'Processing').length;

    setStats({
      totalProducts,
      totalSales,
      totalRevenue,
      lowStockItems,
      totalCustomers,
      todaySales,
      pendingOrders,
      outOfStockItems
    });
  }, [inventoryData, salesData, customersData]);

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-100 text-blue-600",
      change: "+5% from last week"
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      change: "+12% from last month"
    },
    {
      title: "Today's Sales",
      value: `₹${stats.todaySales.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
      change: "0 orders today"
    },
    {
      title: "Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "bg-indigo-100 text-indigo-600",
      change: "+3 new this week"
    }
  ];

  // Additional cards for all users
  const additionalStatCards = [
    {
      title: "Low Stock",
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: "bg-yellow-100 text-yellow-600",
      change: `${stats.outOfStockItems} out of stock`
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Receipt,
      color: "bg-orange-100 text-orange-600",
      change: "Requires attention"
    }
  ];

  if (inventoryLoading || salesLoading || customersLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-slate-100 rounded"></div>
              <div className="h-8 w-8 bg-slate-100 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-slate-100 rounded mb-2"></div>
              <div className="h-3 w-32 bg-slate-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <IconComponent className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        );
      })}
      
      {additionalStatCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={`additional-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <IconComponent className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}