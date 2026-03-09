import { useState, useEffect } from 'react';
import { Activity, Search, Filter, Download, Eye, Clock, User, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'failed' | 'warning';
  ip: string;
  userAgent?: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock data for audit logs
  useEffect(() => {
    const mockLogs: AuditLog[] = [
      {
        id: 'log-001',
        timestamp: '2024-01-10 14:30:25',
        user: 'Admin User',
        action: 'Login',
        resource: 'Authentication',
        status: 'success',
        ip: '192.168.1.100',
        userAgent: 'Chrome 120.0.0.0'
      },
      {
        id: 'log-002',
        timestamp: '2024-01-10 14:32:10',
        user: 'Employee John',
        action: 'Created Sale',
        resource: 'Sales',
        status: 'success',
        ip: '192.168.1.101',
        userAgent: 'Firefox 121.0.0.0'
      },
      {
        id: 'log-003',
        timestamp: '2024-01-10 14:35:45',
        user: 'Customer Rajesh',
        action: 'Updated Profile',
        resource: 'Customer',
        status: 'success',
        ip: '203.0.113.45',
        userAgent: 'Mobile Safari'
      },
      {
        id: 'log-004',
        timestamp: '2024-01-10 15:02:18',
        user: 'Unknown',
        action: 'Failed Login',
        resource: 'Authentication',
        status: 'failed',
        ip: '198.51.100.23',
        userAgent: 'Unknown'
      },
      {
        id: 'log-005',
        timestamp: '2024-01-10 15:15:33',
        user: 'Admin User',
        action: 'Updated Inventory',
        resource: 'Inventory',
        status: 'success',
        ip: '192.168.1.100',
        userAgent: 'Chrome 120.0.0.0'
      },
      {
        id: 'log-006',
        timestamp: '2024-01-10 15:20:12',
        user: 'Employee Sarah',
        action: 'Started Service',
        resource: 'Service',
        status: 'success',
        ip: '192.168.1.102',
        userAgent: 'Edge 120.0.0.0'
      },
      {
        id: 'log-007',
        timestamp: '2024-01-10 15:45:08',
        user: 'Admin User',
        action: 'Exported Reports',
        resource: 'Reports',
        status: 'success',
        ip: '192.168.1.100',
        userAgent: 'Chrome 120.0.0.0'
      },
      {
        id: 'log-008',
        timestamp: '2024-01-10 16:10:22',
        user: 'Employee Mike',
        action: 'Added Customer',
        resource: 'Customers',
        status: 'success',
        ip: '192.168.1.103',
        userAgent: 'Safari 17.0.0'
      },
    ];

    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  useEffect(() => {
    let result = logs;

    if (searchTerm) {
      result = result.filter(log => 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      result = result.filter(log => log.status === filterType);
    }

    setFilteredLogs(result);
  }, [searchTerm, filterType, logs]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground">Track all system activities and user actions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button>
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Events</p>
              <p className="text-xl font-semibold">{logs.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Successful</p>
              <p className="text-xl font-semibold">{logs.filter(l => l.status === 'success').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Failed Attempts</p>
              <p className="text-xl font-semibold">{logs.filter(l => l.status === 'failed').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Events</p>
              <p className="text-xl font-semibold">{logs.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Filter className="w-4 h-4 mr-2" />
                Apply
              </Button>
              <Button variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {log.timestamp}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {log.user}
                        </div>
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.ip}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}