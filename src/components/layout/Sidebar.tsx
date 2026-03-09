import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Truck,
  Wrench,
  BarChart3,
  Settings,
  Menu,
  X,
  Bike,
  ChevronDown,
  LogOut,
  Bell,
  Home,
  CreditCard,
  Award,
  HelpCircle,
  TrendingUp,
  Target,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import NotificationsPanel from "@/components/NotificationsPanel";

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Visibility Center", href: "/visibility", icon: Target },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
  { name: "Audit Logs", href: "/admin/logs", icon: Activity },
  { name: "Low Stock Alerts", href: "/low-stock-alerts", icon: Package },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
  { name: "Purchases", href: "/purchases", icon: Truck },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Service", href: "/service", icon: Wrench },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Reports", href: "/reports", icon: TrendingUp },
];

const employeeNavigation = [
  { name: "Dashboard", href: "/employee-dashboard", icon: LayoutDashboard },
  { name: "Visibility", href: "/visibility", icon: Target },
  { name: "My Performance", href: "/employee/performance", icon: Target },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Service", href: "/service", icon: Wrench },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "My Schedule", href: "/employee/schedule", icon: Settings },
  { name: "Settings", href: "/settings", icon: Settings },
];

const customerNavigation = [
  { name: "Dashboard", href: "/customer-dashboard", icon: LayoutDashboard },
  { name: "My Orders", href: "/customer/orders", icon: ShoppingCart },
  { name: "My Services", href: "/customer/services", icon: Wrench },
  { name: "Browse Products", href: "/inventory", icon: Package },
  { name: "Rewards", href: "/customer/rewards", icon: Award },
  { name: "My Profile", href: "/settings", icon: Settings },
  { name: "Support", href: "/customer/support", icon: HelpCircle },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-sidebar-background to-sidebar-accent/90 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Bike className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-sidebar-foreground text-xl leading-tight">
                  Saurashtra
                </span>
                <span className="text-xs text-sidebar-foreground/90 uppercase tracking-wider font-medium">
                  Cycle Hub
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <NotificationsPanel isAdmin={isAdmin} />
              <button
                onClick={onToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {(() => {
                if (isAdmin) {
                  return adminNavigation;
                } else if (user?.role === 'employee') {
                  return employeeNavigation;
                } else if (user?.role === 'customer') {
                  return customerNavigation;
                } else {
                  // Default navigation for any other case
                  return [
                    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
                    { name: "Inventory", href: "/inventory", icon: Package },
                    { name: "Sales", href: "/sales", icon: ShoppingCart },
                    { name: "Customers", href: "/customers", icon: Users },
                    { name: "Service", href: "/service", icon: Wrench },
                    { name: "Settings", href: "/settings", icon: Settings },
                  ];
                }
              })().map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) onToggle();
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 hover:bg-sidebar-accent/40",
                        isActive 
                          ? "bg-gradient-to-r from-primary to-primary/70 text-primary-foreground shadow-lg" 
                          : "text-sidebar-foreground/90 hover:translate-x-1 hover:bg-sidebar-accent/30"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-semibold">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-sidebar-accent/30">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-sidebar-foreground truncate">
                      {user?.displayName || 'User'}
                    </p>
                    {user?.role && (
                      <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${
                        user.role === 'admin' ? 'bg-gradient-to-r from-destructive to-destructive/70 text-destructive-foreground' :
                        user.role === 'employee' ? 'bg-gradient-to-r from-primary to-primary/70 text-primary-foreground' :
                        'bg-gradient-to-r from-secondary to-secondary/70 text-secondary-foreground'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    )}
                    {!user?.approved && user?.role !== 'customer' && (
                      <span className="px-2.5 py-1 text-xs bg-gradient-to-r from-warning to-warning/70 text-warning-foreground rounded-full font-bold">
                        Unapproved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-sidebar-foreground/80 truncate">
                    {user?.email || 'Not logged in'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-sidebar-foreground/70" />
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-sidebar-accent/40 text-sidebar-foreground transition-all duration-300 hover:translate-x-1"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-30 lg:hidden">
      <div className="flex items-center justify-between h-full px-4">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg hover:bg-secondary shadow-sm"
        >
          <Menu className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
            <Bike className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-foreground text-lg">
            Saurashtra Cycle
          </span>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>
    </header>
  );
}