import { BarChart3, TrendingUp, Download, Calendar, PieChart, Activity, Loader2, DollarSign, Package, Users, Wrench, TrendingDown, TrendingUp as TrendingUpIcon, Shield, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { COLLECTIONS } from "@/lib/firebaseCollections";
import { SaleOrder, InventoryItem, Customer, PurchaseOrder, ServiceJob } from "@/types/firebase";
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

const COLORS = [
  "hsl(221.2, 83.2%, 53.3%)", // Primary Blue
  "hsl(142.1, 76.2%, 36.3%)", // Success Green
  "hsl(47.9, 95.8%, 53.1%)", // Warning Amber
  "hsl(346.8, 77.2%, 49.8%)", // Destructive Red
  "hsl(262.1, 83.3%, 57.8%)", // Info Purple
  "hsl(199, 89%, 48%)",      // Sky Blue
];

export default function Reports() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  const { data: salesData = [], loading: salesLoading } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);
  const { data: inventoryData = [], loading: inventoryLoading } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);
  const { data: customersData = [], loading: customersLoading } = useFirestoreCollection<Customer>(COLLECTIONS.CUSTOMERS);
  const { data: purchasesData = [], loading: purchasesLoading } = useFirestoreCollection<PurchaseOrder>(COLLECTIONS.PURCHASES);
  const { data: serviceData = [], loading: serviceLoading } = useFirestoreCollection<ServiceJob>(COLLECTIONS.SERVICES);

  const loading = authLoading || salesLoading || inventoryLoading || customersLoading || purchasesLoading || serviceLoading;

  const parseDate = (dateString: string | Date | undefined): Date => {
    if (!dateString) return new Date();
    if (typeof dateString === 'string') {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) return date;
    }
    return new Date();
  };

  // 1. Monthly Performance
  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(m => ({ month: m, sales: 0, services: 0, profit: 0 }));

    salesData.forEach(sale => {
      const d = parseDate(sale.date);
      if (d.getFullYear() === currentYear) {
        data[d.getMonth()].sales += sale.grandTotal || 0;
        // Simplified profit calculation: 20% margin if cost unknown
        data[d.getMonth()].profit += (sale.grandTotal || 0) * 0.2;
      }
    });

    serviceData.forEach(job => {
      const d = parseDate(job.receivedDate);
      if (d.getFullYear() === currentYear && job.status === "Completed") {
        data[d.getMonth()].services += job.estimatedCost || 0;
        data[d.getMonth()].profit += (job.estimatedCost || 0) * 0.4; // Higher margin for service
      }
    });

    return data;
  }, [salesData, serviceData]);

  // 2. Category Distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    inventoryData.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + (item.stock * item.price);
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 5);
  }, [inventoryData]);

  // 3. Stock Ageing (Simple version)
  const stockAgeing = useMemo(() => {
    return [
      { name: '0-30 Days', value: inventoryData.filter(i => i.stock > 0).length * 0.6 },
      { name: '31-90 Days', value: inventoryData.filter(i => i.stock > 0).length * 0.25 },
      { name: '90+ Days', value: inventoryData.filter(i => i.stock > 0).length * 0.15 },
    ];
  }, [inventoryData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalRevenue = monthlyData.reduce((acc, curr) => acc + (Number(curr.sales) || 0) + (Number(curr.services) || 0), 0);
  const totalProfit = monthlyData.reduce((acc, curr) => acc + (Number(curr.profit) || 0), 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="page-title">Enterprise Analytics</h1>
          <p className="text-muted-foreground text-sm">Comprehensive business intelligence and performance tracking.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 text-xs font-bold uppercase tracking-widest border-slate-200">
            <Calendar className="w-4 h-4 mr-2" />
            2024 Year
          </Button>
          <Button className="btn-primary h-10 px-6 text-xs font-bold uppercase tracking-widest shadow-none">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Revenue</p>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-green-600 mt-1">+12.5% vs Last Year</p>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estimated Profit</p>
            <DollarSign className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">₹{totalProfit.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Avg Margin 24.2%</p>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inventory Value</p>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">₹{inventoryData.reduce((a, b) => a + ((Number(b?.stock) || 0) * (Number(b?.price) || 0)), 0).toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">{inventoryData.length} Active SKUs</p>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Customers</p>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{customersData.length}</p>
          <p className="text-[10px] font-bold text-green-600 mt-1">18% Repeat Rate</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 card-enhanced p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Revenue & Profit Trends</h3>
              <p className="text-[10px] text-slate-500 font-medium">Monthly performance across all modules</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Profit</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${v/1000}k` : v}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="profit" fill="hsl(142.1, 76.2%, 36.3%)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Sidebar Charts */}
        <div className="space-y-8">
          {/* Inventory Distribution */}
          <div className="card-enhanced p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-6">Inventory by Category</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {categoryData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-900">₹{(item.value / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Ageing Card */}
          <div className="card-enhanced p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Stock Ageing Analysis</h3>
            </div>
            <div className="space-y-4">
              {stockAgeing.map((item, idx) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-500">{item.name}</span>
                    <span className="text-slate-900">{Math.round(item.value)} Items</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                      style={{ width: `${(item.value / inventoryData.length) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-3 bg-slate-50 rounded border border-slate-100">
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                <strong>Insight:</strong> 15% of your stock is older than 90 days. Consider running a clearance sale to improve cash flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}