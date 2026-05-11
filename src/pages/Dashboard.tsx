import { Package, ShoppingCart, Users, IndianRupee, Bell, Loader2, LucideIcon } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { InventoryOverview } from "@/components/dashboard/InventoryOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { Button } from "@/components/ui/button";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { COLLECTIONS } from "@/lib/firebaseCollections";
import { SaleOrder, InventoryItem, Customer, ServiceJob } from "@/types/firebase";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import QuickStats from "@/components/QuickStats";
import UserActivityLogs from "@/components/UserActivityLogs";
import PersonalizedWelcome from "@/components/PersonalizedWelcome";
import ERPVisibilityDashboard from "@/components/ERPVisibilityDashboard";
import ModuleStatusCards from "@/components/ModuleStatusCards";
import ActivityStream from "@/components/ActivityStream";
import { Navigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: salesData, loading: salesLoading } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);
  const { data: inventoryData, loading: inventoryLoading } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);
  const { data: customersData, loading: customersLoading } = useFirestoreCollection<Customer>(COLLECTIONS.CUSTOMERS);
  const { data: serviceJobs, loading: serviceLoading } = useFirestoreCollection<ServiceJob>(COLLECTIONS.SERVICES);

  const loading = salesLoading || inventoryLoading || customersLoading || serviceLoading;

  // Allow all users to access the general dashboard - removing role-based redirection
  /*
  // Redirect user to their specific dashboard if they have a role
  if (user?.role && user.role !== 'admin') {
    if (user.role === 'employee') {
      return <Navigate to="/employee-dashboard" replace />;
    } else if (user.role === 'customer') {
      return <Navigate to="/customer-dashboard" replace />;
    }
  }
  */

  // Calculate stats with defensive checks
  const totalSales = salesData?.reduce((sum, sale) => sum + (Number(sale?.grandTotal) || 0), 0) || 0;
  const totalInventoryValue = inventoryData?.reduce((sum, item) => sum + ((Number(item?.price) || 0) * (Number(item?.stock) || 0)), 0) || 0;
  const totalCustomers = customersData?.length || 0;
  const totalItems = inventoryData?.length || 0;

  // Compute real notifications
  const notifications = useMemo(() => {
    const list: Array<{ id: string, title: string, description: string, type: 'info' | 'warning' | 'success', icon: LucideIcon }> = [];

    // 1. Most recent sale
    if (salesData && salesData.length > 0) {
      const latestSale = [...salesData].sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0))[0];
      list.push({
        id: `sale-${latestSale.id}`,
        title: "New sale order",
        description: `Order ${latestSale.orderId || latestSale.invoiceNo} for ₹${latestSale.grandTotal?.toLocaleString()}`,
        type: 'info',
        icon: ShoppingCart
      });
    }

    // 2. Low stock items
    if (inventoryData) {
      const lowStockItems = inventoryData.filter(item => item.status === "Low Stock" || (item.stock <= (item.reorderLevel || 5)));
      lowStockItems.slice(0, 2).forEach(item => {
      list.push({
        id: `stock-${item.id}`,
        title: "Low stock alert",
        description: `${item.name} has only ${item.stock} left`,
        type: 'warning',
        icon: Package
      });
    });
    }

    // 3. Recently completed services
    if (serviceJobs) {
      const completedServices = serviceJobs.filter(job => job.status === "Completed");
      if (completedServices.length > 0) {
        const latestService = [...completedServices].sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0))[0];
        list.push({
          id: `service-${latestService.id}`,
          title: "Service completed",
          description: `${latestService.customer}'s ${latestService.cycle} is ready`,
          type: 'success',
          icon: Bell
        });
      }
    }

    return list;
  }, [salesData, inventoryData, serviceJobs]);

  return (
    <div className="space-y-6 p-2 md:p-6 lg:p-8">
      {/* Personalized Welcome */}
      <PersonalizedWelcome isAdmin={false} onLogout={logout} />

      {/* Quick Stats */}
      <QuickStats isAdmin={false} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <div className="glass-card bg-gradient-to-br from-card/90 to-background/50 border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-up">
            <div className="p-5 md:p-7 border-b border-border/50">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" /> Notifications
              </h3>
            </div>
            <div className="p-4 md:p-6">
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors border border-border/30">
                      <n.icon className={`w-5 h-5 mt-0.5 ${
                        n.type === 'warning' ? 'text-warning' : 
                        n.type === 'success' ? 'text-success' : 
                        'text-primary'
                      }`} />
                      <div>
                        <p className="font-medium text-foreground">{n.title}</p>
                        <p className="text-sm text-muted-foreground">{n.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No new notifications</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-enhanced bg-card border border-border/50 shadow-lg">
          <RecentSales />
        </div>
        {user?.role !== 'customer' && (
          <div className="card-enhanced bg-card border border-border/50 shadow-lg">
            <UserActivityLogs />
          </div>
        )}
      </div>

      {/* Inventory Overview */}
      <div className="card-enhanced bg-card border border-border/50 shadow-lg">
        <InventoryOverview />
      </div>
    </div>
  );

}
