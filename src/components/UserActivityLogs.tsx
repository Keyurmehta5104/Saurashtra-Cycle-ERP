import { useState, useEffect } from 'react';
import { Activity, Clock, User, Package, ShoppingCart, FileText, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

export default function UserActivityLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Mock activity logs data - in a real app this would come from Firestore
    const mockLogs: ActivityLog[] = [
      {
        id: '1',
        user: user?.displayName || 'Current User',
        action: 'Created new sale order',
        module: 'Sales',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'success'
      },
      {
        id: '2',
        user: user?.displayName || 'Current User',
        action: 'Updated inventory item',
        module: 'Inventory',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'success'
      },
      {
        id: '3',
        user: user?.displayName || 'Current User',
        action: 'Generated monthly report',
        module: 'Reports',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'success'
      },
      {
        id: '4',
        user: user?.displayName || 'Current User',
        action: 'Low stock alert triggered',
        module: 'Inventory',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        status: 'warning'
      },
      {
        id: '5',
        user: user?.displayName || 'Current User',
        action: 'Processed customer payment',
        module: 'Sales',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        status: 'success'
      }
    ];
    
    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, [user]);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(logs.filter(log => log.status === filter));
    }
  }, [filter, logs]);

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'Inventory': return <Package className="w-4 h-4" />;
      case 'Sales': return <ShoppingCart className="w-4 h-4" />;
      case 'Reports': return <FileText className="w-4 h-4" />;
      case 'Users': return <Users className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'success' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('success')}
            >
              Success
            </Button>
            <Button 
              variant={filter === 'warning' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('warning')}
            >
              Warning
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredLogs.slice(0, 5).map(log => (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50">
              <div className="mt-0.5">
                {getStatusIcon(log.status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{log.action}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{log.module}</span>
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(log.timestamp)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-xs">{log.user.split(' ')[0]}</span>
              </div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}