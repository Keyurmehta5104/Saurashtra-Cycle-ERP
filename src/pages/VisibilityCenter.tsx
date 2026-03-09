import { useState } from 'react';
import { BarChart3, Eye, Activity, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ERPVisibilityDashboard from '@/components/ERPVisibilityDashboard';
import ModuleStatusCards from '@/components/ModuleStatusCards';
import ActivityStream from '@/components/ActivityStream';
import FeatureUsageTracker from '@/components/FeatureUsageTracker';
import AdvancedReporting from '@/components/AdvancedReporting';
import PerformanceMetrics from '@/components/PerformanceMetrics';

export default function VisibilityCenter() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Eye className="w-7 h-7 text-primary" />
            ERP Visibility Center
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete transparency and insights into your ERP operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setActiveTab('overview')}>
            <Eye className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('analytics')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <Eye className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="modules">
            <Activity className="w-4 h-4 mr-2" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Zap className="w-4 h-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="usage">
            <BarChart3 className="w-4 h-4 mr-2" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <ERPVisibilityDashboard />
          <ModuleStatusCards />
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          <ModuleStatusCards />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceMetrics />
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <ActivityStream />
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <FeatureUsageTracker />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <AdvancedReporting />
        </TabsContent>
      </Tabs>
    </div>
  );
}
