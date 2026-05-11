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
  Activity,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import NotificationsPanel from "@/components/NotificationsPanel";

const adminNavigation = [
  { 
    group: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { name: "Visibility Center", href: "/visibility", icon: Target },
    ]
  },
  {
    group: "Inventory & Sales",
    items: [
      { name: "Inventory", href: "/inventory", icon: Package },
      { name: "Sales", href: "/sales", icon: ShoppingCart },
      { name: "Purchases", href: "/purchases", icon: Truck },
      { name: "Invoices", href: "/invoices", icon: FileText },
    ]
  },
  {
    group: "Industry Operations",
    items: [
      { name: "Service Center", href: "/service", icon: Wrench },
      { name: "Warranty Registry", href: "/warranty", icon: ShieldCheck },
      { name: "Production & Assembly", href: "/assembly", icon: Wrench },
      { name: "EMI & Payments", href: "/payments", icon: CreditCard },
    ]
  },
  {
    group: "Management",
    items: [
      { name: "Customers", href: "/customers", icon: Users },
      { name: "User Management", href: "/admin/users", icon: Users },
      { name: "Low Stock Alerts", href: "/low-stock-alerts", icon: Package },
      { name: "Audit Logs", href: "/admin/logs", icon: Activity },
      { name: "System Settings", href: "/admin/settings", icon: Settings },
    ]
  }
];

const employeeNavigation = [
  {
    group: "Dashboard",
    items: [
      { name: "My Workspace", href: "/employee-dashboard", icon: LayoutDashboard },
      { name: "My Performance", href: "/employee/performance", icon: Target },
      { name: "Visibility", href: "/visibility", icon: Target },
    ]
  },
  {
    group: "Sales & Inventory",
    items: [
      { name: "Inventory", href: "/inventory", icon: Package },
      { name: "Sales", href: "/sales", icon: ShoppingCart },
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Invoices", href: "/invoices", icon: FileText },
    ]
  },
  {
    group: "Operations",
    items: [
      { name: "Service", href: "/service", icon: Wrench },
      { name: "Warranty", href: "/warranty", icon: ShieldCheck },
      { name: "Production", href: "/assembly", icon: Wrench },
      { name: "EMI Tracking", href: "/payments", icon: CreditCard },
      { name: "My Schedule", href: "/employee/schedule", icon: Settings },
    ]
  },
  {
    group: "Account",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

const customerNavigation = [
  {
    group: "Overview",
    items: [
      { name: "Dashboard", href: "/customer-dashboard", icon: LayoutDashboard },
      { name: "Browse Bikes", href: "/inventory", icon: Bike },
    ]
  },
  {
    group: "My History",
    items: [
      { name: "My Orders", href: "/customer/orders", icon: ShoppingCart },
      { name: "My Services", href: "/customer/services", icon: Wrench },
      { name: "Rewards", href: "/customer/rewards", icon: Award },
    ]
  },
  {
    group: "Account",
    items: [
      { name: "My Profile", href: "/settings", icon: Settings },
      { name: "Support", href: "/customer/support", icon: HelpCircle },
    ]
  }
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
          "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar-background border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-sidebar-border bg-white">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <Bike className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-foreground text-lg leading-tight tracking-tight">
                  Saurashtra
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                  Cycle Hub ERP
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={onToggle}
                className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
            {((): { group: string, items: any[] }[] => {
              if (isAdmin) return adminNavigation;
              if (user?.role === 'employee') return employeeNavigation;
              // Default to customer navigation for all other roles (Member, Auditor, etc.)
              return customerNavigation;
            })().map((group) => (
              <div key={group.group}>
                <p className="px-3 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{group.group}</p>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={`${item.name}-${item.href}`}>
                        <Link
                          to={item.href}
                          onClick={() => {
                            if (window.innerWidth < 1024) onToggle();
                          }}
                          className={cn(
                            "group flex items-center px-3 py-2.5 text-xs font-bold rounded-xl transition-all duration-200",
                            isActive 
                              ? "bg-primary text-white shadow-lg shadow-primary/20" 
                              : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                          )}
                        >
                          {item.icon ? (
                            <item.icon className={cn("mr-3 h-4 w-4 shrink-0 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                          ) : (
                            <LayoutDashboard className={cn("mr-3 h-4 w-4 shrink-0 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                          )}
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 bg-muted/30 border-t border-sidebar-border">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-white shadow-sm">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs border border-slate-200">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.role || 'Member'}
                </p>
              </div>
              <button 
                onClick={logout}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
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