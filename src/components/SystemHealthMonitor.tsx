import { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Wifi, 
  HardDrive, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Shield,
  Zap,
  Thermometer,
  BarChart3,
  TrendingUp,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SystemStatus {
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkStatus: 'online' | 'degraded' | 'offline';
  databaseStatus: 'operational' | 'degraded' | 'down';
  lastBackup: string;
  securityStatus: 'secure' | 'warning' | 'critical';
}

export default function SystemHealthMonitor() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    uptime: 99.9,
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 78,
    networkStatus: 'online',
    databaseStatus: 'operational',
    lastBackup: '2024-01-10 14:30:25',
    securityStatus: 'secure'
  });

  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        cpuUsage: Math.max(10, Math.min(95, prev.cpuUsage + (Math.random() * 10 - 5))),
        memoryUsage: Math.max(20, Math.min(90, prev.memoryUsage + (Math.random() * 8 - 4))),
        diskUsage: Math.max(60, Math.min(95, prev.diskUsage + (Math.random() * 3 - 1.5)))
      }));
      setLastUpdated(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const refreshStatus = () => {
    // Simulate refreshing status
    setSystemStatus({
      ...systemStatus,
      cpuUsage: Math.max(10, Math.min(95, systemStatus.cpuUsage + (Math.random() * 10 - 5))),
      memoryUsage: Math.max(20, Math.min(90, systemStatus.memoryUsage + (Math.random() * 8 - 4))),
      diskUsage: Math.max(60, Math.min(95, systemStatus.diskUsage + (Math.random() * 3 - 1.5)))
    });
    setLastUpdated(new Date());
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online':
      case 'operational':
      case 'secure':
        return 'bg-green-100 text-green-800';
      case 'degraded':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
      case 'down':
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsageColor = (value: number) => {
    if (value < 50) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getUsageLabel = (value: number) => {
    if (value < 50) return 'Normal';
    if (value < 80) return 'Moderate';
    return 'High';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          System Health Monitor
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={refreshStatus}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Uptime */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="font-medium">Uptime</h3>
            </div>
            <div className="text-2xl font-bold">{systemStatus.uptime}%</div>
            <Badge variant="outline" className="w-fit">99.9% this month</Badge>
          </div>

          {/* CPU Usage */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="font-medium">CPU Usage</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Progress value={systemStatus.cpuUsage} className="h-2" />
              </div>
              <span className="text-sm font-medium">{systemStatus.cpuUsage}%</span>
            </div>
            <Badge className={getUsageColor(systemStatus.cpuUsage)}>
              {getUsageLabel(systemStatus.cpuUsage)}
            </Badge>
          </div>

          {/* Memory Usage */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-purple-500" />
              <h3 className="font-medium">Memory Usage</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Progress value={systemStatus.memoryUsage} className="h-2" />
              </div>
              <span className="text-sm font-medium">{systemStatus.memoryUsage}%</span>
            </div>
            <Badge className={getUsageColor(systemStatus.memoryUsage)}>
              {getUsageLabel(systemStatus.memoryUsage)}
            </Badge>
          </div>

          {/* Disk Usage */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-red-500" />
              <h3 className="font-medium">Disk Usage</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Progress value={systemStatus.diskUsage} className="h-2" />
              </div>
              <span className="text-sm font-medium">{systemStatus.diskUsage}%</span>
            </div>
            <Badge className={getUsageColor(systemStatus.diskUsage)}>
              {getUsageLabel(systemStatus.diskUsage)}
            </Badge>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-5 h-5 text-blue-500" />
              <h4 className="font-medium">Network</h4>
            </div>
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(systemStatus.networkStatus)}>
                {systemStatus.networkStatus.charAt(0).toUpperCase() + systemStatus.networkStatus.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">100 Mbps</span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-green-500" />
              <h4 className="font-medium">Database</h4>
            </div>
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(systemStatus.databaseStatus)}>
                {systemStatus.databaseStatus.charAt(0).toUpperCase() + systemStatus.databaseStatus.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">32ms</span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-yellow-500" />
              <h4 className="font-medium">Security</h4>
            </div>
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(systemStatus.securityStatus)}>
                {systemStatus.securityStatus.charAt(0).toUpperCase() + systemStatus.securityStatus.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <h4 className="font-medium">Last Backup</h4>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{systemStatus.lastBackup}</span>
              <Badge variant="outline">Success</Badge>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="mt-6">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            System Alerts
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium">Disk usage at 78%</p>
                <p className="text-sm text-muted-foreground">Consider cleanup to prevent performance issues</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Database connection stable</p>
                <p className="text-sm text-muted-foreground">All queries responding normally</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            System Settings
          </Button>
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Performance Reports
          </Button>
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Usage Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}