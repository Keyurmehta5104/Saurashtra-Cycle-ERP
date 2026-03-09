import { useState } from "react";
import { Sidebar, MobileHeader } from "./Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import LowStockAlerts from "@/components/LowStockAlerts";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import AIChatbot from "@/components/AIChatbot";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/90">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
      
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-2 md:p-4 lg:p-6">
          <BreadcrumbNav />
          <div className="animate-fade-in text-foreground">
            {children}
          </div>
        </div>
        <LowStockAlerts />
        <AIChatbot />
      </main>
    </div>
  );
}