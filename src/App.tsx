import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import Customers from "./pages/Customers";
import Service from "./pages/Service";
import Invoices from "./pages/Invoices";
import InvoiceView from "./pages/InvoiceView";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import AdminSettings from "./pages/AdminSettings";
import LowStockAlerts from "./pages/LowStockAlerts";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import AuditLogs from "./pages/AuditLogs";
import Rewards from "./pages/Rewards";
import OrderTracking from "./pages/OrderTracking";
import VisibilityCenter from "./pages/VisibilityCenter";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import { initializeAdminUser } from "@/lib/initializeAdminUser";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Wrapper component for pages with layout
const PageWithLayout = ({ children }: { children: React.ReactNode }) => (
  <AppLayout>{children}</AppLayout>
);

const App = () => {
  useEffect(() => {
    // Initialize admin user automatically when the app starts
    const initAdmin = async () => {
      try {
        await initializeAdminUser();
      } catch (error) {
        console.error('Error initializing admin user:', error);
      }
    };
    
    initAdmin();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<PageWithLayout><ProtectedRoute><Dashboard /></ProtectedRoute></PageWithLayout>} />
              <Route path="/employee-dashboard" element={<PageWithLayout><ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute></PageWithLayout>} />
              <Route path="/customer-dashboard" element={<PageWithLayout><ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute></PageWithLayout>} />
              <Route path="/admin" element={<PageWithLayout><ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute></PageWithLayout>} />
              <Route path="/admin/users" element={<PageWithLayout><ProtectedRoute requireAdmin={true}><UserManagement /></ProtectedRoute></PageWithLayout>} />
              <Route path="/admin/settings" element={<PageWithLayout><ProtectedRoute requireAdmin={true}><AdminSettings /></ProtectedRoute></PageWithLayout>} />
              <Route path="/admin/analytics" element={<PageWithLayout><ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute></PageWithLayout>} />
              <Route path="/admin/logs" element={<PageWithLayout><ProtectedRoute requireAdmin={true}><AuditLogs /></ProtectedRoute></PageWithLayout>} />
              <Route path="/audit-logs" element={<PageWithLayout><ProtectedRoute requireAdmin={true}><AuditLogs /></ProtectedRoute></PageWithLayout>} />
              <Route path="/inventory" element={<PageWithLayout><ProtectedRoute><Inventory /></ProtectedRoute></PageWithLayout>} />
              <Route path="/sales" element={<PageWithLayout><ProtectedRoute><Sales /></ProtectedRoute></PageWithLayout>} />
              <Route path="/sales/new" element={<PageWithLayout><ProtectedRoute><Sales /></ProtectedRoute></PageWithLayout>} />
              <Route path="/customer/orders" element={<PageWithLayout><ProtectedRoute allowedRoles={['customer']}><Sales /></ProtectedRoute></PageWithLayout>} />
              <Route path="/customer/services" element={<PageWithLayout><ProtectedRoute allowedRoles={['customer']}><Service /></ProtectedRoute></PageWithLayout>} />
              <Route path="/customer/rewards" element={<PageWithLayout><ProtectedRoute allowedRoles={['customer']}><Rewards /></ProtectedRoute></PageWithLayout>} />
              <Route path="/customer/support" element={<PageWithLayout><ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute></PageWithLayout>} />
              <Route path="/employee/performance" element={<PageWithLayout><ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute></PageWithLayout>} />
              <Route path="/employee/schedule" element={<PageWithLayout><ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute></PageWithLayout>} />
              <Route path="/purchases" element={<PageWithLayout><ProtectedRoute><Purchases /></ProtectedRoute></PageWithLayout>} />
              <Route path="/customers" element={<PageWithLayout><ProtectedRoute><Customers /></ProtectedRoute></PageWithLayout>} />
              <Route path="/customers/new" element={<PageWithLayout><ProtectedRoute><Customers /></ProtectedRoute></PageWithLayout>} />
              <Route path="/service" element={<PageWithLayout><ProtectedRoute><Service /></ProtectedRoute></PageWithLayout>} />
              <Route path="/service/new" element={<PageWithLayout><ProtectedRoute><Service /></ProtectedRoute></PageWithLayout>} />
              <Route path="/service/schedule" element={<PageWithLayout><ProtectedRoute><Service /></ProtectedRoute></PageWithLayout>} />
              <Route path="/invoices" element={<PageWithLayout><ProtectedRoute><Invoices /></ProtectedRoute></PageWithLayout>} />
              <Route path="/invoices/new" element={<PageWithLayout><ProtectedRoute><Invoices /></ProtectedRoute></PageWithLayout>} />
              <Route path="/invoices/view/:id" element={<PageWithLayout><ProtectedRoute><InvoiceView /></ProtectedRoute></PageWithLayout>} />
              <Route path="/reports" element={<PageWithLayout><ProtectedRoute><Reports /></ProtectedRoute></PageWithLayout>} />
              <Route path="/settings" element={<PageWithLayout><ProtectedRoute><Settings /></ProtectedRoute></PageWithLayout>} />
              <Route path="/inventory/add" element={<PageWithLayout><ProtectedRoute><Inventory /></ProtectedRoute></PageWithLayout>} />
              <Route path="/quick-entry" element={<PageWithLayout><ProtectedRoute><Inventory /></ProtectedRoute></PageWithLayout>} />
              <Route path="/low-stock-alerts" element={<PageWithLayout><ProtectedRoute requireAdmin={true}><LowStockAlerts /></ProtectedRoute></PageWithLayout>} />
              <Route path="/orders/track" element={<PageWithLayout><ProtectedRoute allowedRoles={['customer']}><OrderTracking /></ProtectedRoute></PageWithLayout>} />
              <Route path="/rewards" element={<PageWithLayout><ProtectedRoute allowedRoles={['customer']}><Rewards /></ProtectedRoute></PageWithLayout>} />
              <Route path="/visibility" element={<PageWithLayout><ProtectedRoute><VisibilityCenter /></ProtectedRoute></PageWithLayout>} />
              <Route path="/enhanced-dashboard" element={<PageWithLayout><ProtectedRoute><EnhancedDashboard /></ProtectedRoute></PageWithLayout>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;