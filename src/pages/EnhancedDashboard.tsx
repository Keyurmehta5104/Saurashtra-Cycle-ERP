import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import QuickStats from "@/components/QuickStats";
import PersonalizedWelcome from "@/components/PersonalizedWelcome";
import ERPVisibilityDashboard from "@/components/ERPVisibilityDashboard";
import ModuleStatusCards from "@/components/ModuleStatusCards";
import ActivityStream from "@/components/ActivityStream";
import { Navigate } from "react-router-dom";

export default function EnhancedDashboard() {
  const { logout } = useAuth();

  return (
    <div className="space-y-6 p-2 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Complete visibility into your ERP operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-secondary transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Personalized Welcome */}
      <PersonalizedWelcome isAdmin={false} onLogout={logout} />

      {/* Quick Stats */}
      <QuickStats isAdmin={false} />

      {/* ERP Visibility Center - Main Feature */}
      <ERPVisibilityDashboard />

      {/* Module Status Cards */}
      <ModuleStatusCards />

      {/* Activity Stream & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityStream />
        
        {/* Notifications Panel */}
        <div className="glass-card bg-gradient-to-br from-card/90 to-background/50 border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-up">
          <div className="p-5 md:p-7 border-b border-border/50">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notifications
            </h3>
          </div>
          <div className="p-4 md:p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors border border-border/30">
                <Bell className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">New sale order</p>
                  <p className="text-sm text-muted-foreground">Order #SCH-00123 has been placed</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors border border-border/30">
                <Bell className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Low stock alert</p>
                  <p className="text-sm text-muted-foreground">Bicycle Chain has low stock</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors border border-border/30">
                <Bell className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Service completed</p>
                  <p className="text-sm text-muted-foreground">Rajesh's bicycle repair is complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
