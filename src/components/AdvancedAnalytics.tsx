import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  Calendar,
  Filter,
  Download,
  Eye,
  Target,
  Award,
  Activity,
  BarChart,
  PieChart,
  LineChart,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bar,
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area
} from 'recharts';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { SaleOrder, InventoryItem, Customer, PurchaseOrder } from '@/types/firebase';

interface ReportData {
  period: string;
  sales: number;
  expenses: number;
  profit: number;
  orders: number;
}

interface PieChartData {
  name: string;
  value: number;
}

interface AnalyticsProps {
  isAdmin?: boolean;
  role?: 'admin' | 'employee' | 'customer';
}

export default function AdvancedAnalytics({ isAdmin = false, role = 'admin' }: AnalyticsProps) {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [pieData, setPieData] = useState<PieChartData[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  // Mock data - in a real app, this would come from aggregated Firestore data
  useEffect(() => {
    const mockReportData: ReportData[] = [
      { period: 'Jan', sales: 4000, expenses: 2400, profit: 1600, orders: 24 },
      { period: 'Feb', sales: 3000, expenses: 1398, profit: 1602, orders: 19 },
      { period: 'Mar', sales: 2000, expenses: 1800, profit: 200, orders: 15 },
      { period: 'Apr', sales: 2780, expenses: 2000, profit: 780, orders: 22 },
      { period: 'May', sales: 1890, expenses: 1200, profit: 690, orders: 18 },
      { period: 'Jun', sales: 2390, expenses: 1500, profit: 890, orders: 21 },
      { period: 'Jul', sales: 3490, expenses: 2100, profit: 1390, orders: 28 },
    ];

    const mockPieData: PieChartData[] = [
      { name: 'Electronics', value: 400 },
      { name: 'Accessories', value: 300 },
      { name: 'Parts', value: 300 },
      { name: 'Services', value: 200 },
    ];

    setReportData(mockReportData);
    setPieData(mockPieData);
    setLoading(false);
  }, [timeRange]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const topPerformingProducts = [
    { name: 'Mountain Bike', sales: 120, revenue: 240000 },
    { name: 'Road Bike', sales: 95, revenue: 190000 },
    { name: 'Helmet', sales: 200, revenue: 40000 },
    { name: 'Gloves', sales: 180, revenue: 18000 },
  ];

  const recentTransactions = [
    { id: 'ORD-001', customer: 'Rajesh Kumar', amount: 12500, date: '2024-01-15', status: 'Completed' },
    { id: 'ORD-002', customer: 'Priya Sharma', amount: 8750, date: '2024-01-14', status: 'Processing' },
    { id: 'ORD-003', customer: 'Vikram Singh', amount: 15600, date: '2024-01-14', status: 'Delivered' },
    { id: 'ORD-004', customer: 'Meera Patel', amount: 6400, date: '2024-01-13', status: 'Cancelled' },
  ];

  // Filter data based on user role
  const filteredReportData = reportData;
  const filteredPieData = pieData;

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Advanced Analytics
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive insights into your business performance
          </p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
            className="border border-input rounded-md px-3 py-2 bg-background text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹4,50,000</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                +12.5% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                +8.2% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                +3.1% from last period
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={filteredReportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name="Sales (₹)" />
                  <Bar dataKey="expenses" fill="#82ca9d" name="Expenses (₹)" />
                  <Bar dataKey="profit" fill="#00c4ff" name="Profit (₹)" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={filteredPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {filteredPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformingProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{product.revenue.toLocaleString()}</p>
                      <Badge variant="outline" className="text-xs">Top Seller</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.id}</p>
                      <p className="text-sm text-muted-foreground">{transaction.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{transaction.amount.toLocaleString()}</p>
                      <Badge 
                        variant={transaction.status === 'Completed' || transaction.status === 'Delivered' ? 'default' : 
                                transaction.status === 'Processing' ? 'secondary' : 'destructive'}
                        className="text-xs mt-1"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}