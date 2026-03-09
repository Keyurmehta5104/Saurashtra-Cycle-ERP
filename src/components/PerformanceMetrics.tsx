import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Star,
  Calendar,
  Target,
  Award,
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  Line,
  LineChart as RechartsLineChart
} from 'recharts';

interface PerformanceData {
  name: string;
  value: number;
  target: number;
  color: string;
}

interface SalesData {
  name: string;
  sales: number;
  target: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export default function PerformanceMetrics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  
  // Sample performance data
  const performanceData: PerformanceData[] = [
    { name: 'Sales', value: 85, target: 100, color: '#3b82f6' },
    { name: 'Customer Satisfaction', value: 92, target: 90, color: '#10b981' },
    { name: 'Inventory Turnover', value: 78, target: 85, color: '#f59e0b' },
    { name: 'Service Completion', value: 95, target: 90, color: '#8b5cf6' },
    { name: 'Response Time', value: 88, target: 95, color: '#ef4444' }
  ];

  // Sample sales data
  const salesData: SalesData[] = [
    { name: 'Jan', sales: 4000, target: 4500 },
    { name: 'Feb', sales: 3000, target: 3500 },
    { name: 'Mar', sales: 5000, target: 4000 },
    { name: 'Apr', sales: 6000, target: 5500 },
    { name: 'May', sales: 4500, target: 5000 },
    { name: 'Jun', sales: 7000, target: 6500 },
  ];

  // Sample category data
  const categoryData: CategoryData[] = [
    { name: 'Bicycles', value: 45, color: '#3b82f6' },
    { name: 'Accessories', value: 30, color: '#10b981' },
    { name: 'Spare Parts', value: 15, color: '#f59e0b' },
    { name: 'Services', value: 10, color: '#8b5cf6' },
  ];

  // Sample employee performance
  const employeePerformance = [
    { name: 'John Doe', sales: 12500, target: 12000 },
    { name: 'Jane Smith', sales: 11000, target: 10000 },
    { name: 'Mike Johnson', sales: 9500, target: 10000 },
    { name: 'Sarah Wilson', sales: 13000, target: 12500 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Performance Metrics
        </h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'quarter' | 'year') => setTimeRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-xl font-semibold">₹2,45,000</p>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12.5%
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Customers</p>
              <p className="text-xl font-semibold">128</p>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +8.2%
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inventory Items</p>
              <p className="text-xl font-semibold">245</p>
              <p className="text-xs text-red-500 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> -2.1%
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Rating</p>
              <p className="text-xl font-semibold">4.6/5</p>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +0.2
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Performance vs Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Actual" fill="#3b82f6" />
                  <Bar dataKey="target" name="Target" fill="#d1d5db" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" name="Actual Sales" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="target" name="Target Sales" stroke="#9ca3af" strokeWidth={2} strokeDasharray="3 3" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Employee Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Employee Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" name="Sales (₹)" fill="#8b5cf6" />
                  <Bar dataKey="target" name="Target (₹)" fill="#d1d5db" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="font-medium">Top Performer</h3>
              </div>
              <p className="text-2xl font-bold">Sarah Wilson</p>
              <p className="text-sm text-muted-foreground">₹13,000 in sales</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium">Achievement Rate</h3>
              </div>
              <p className="text-2xl font-bold">92%</p>
              <p className="text-sm text-muted-foreground">Of monthly targets</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <h3 className="font-medium">Customer Rating</h3>
              </div>
              <p className="text-2xl font-bold">4.6/5</p>
              <p className="text-sm text-muted-foreground">Based on 128 reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}