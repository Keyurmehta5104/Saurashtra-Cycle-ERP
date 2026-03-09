import { BarChart3, TrendingUp, Download, Calendar, PieChart, Activity, Loader2, DollarSign, Package, Users, Wrench, TrendingDown, TrendingUp as TrendingUpIcon, Shield, AlertCircle } from "lucide-react";
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { COLLECTIONS } from "@/lib/firebaseCollections";
import { SaleOrder, InventoryItem, Customer, PurchaseOrder, ServiceJob } from "@/types/firebase";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const COLORS = [
  "hsl(173, 58%, 39%)",
  "hsl(24, 95%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(210, 40%, 50%)",
  "hsl(340, 82%, 52%)",
  "hsl(280, 65%, 60%)",
];

const reports = [
  {
    title: "Sales Summary",
    description: "Complete sales analysis with trends",
    icon: TrendingUp,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Inventory Report",
    description: "Stock levels and movement",
    icon: BarChart3,
    color: "bg-accent/10 text-accent",
  },
  {
    title: "Customer Analytics",
    description: "Customer behavior insights",
    icon: Activity,
    color: "bg-success/10 text-success",
  },
  {
    title: "Financial Summary",
    description: "Profit & loss statements",
    icon: PieChart,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Service Reports",
    description: "Service job performance",
    icon: Wrench,
    color: "bg-info/10 text-info",
  },
  {
    title: "Profit Analysis",
    description: "Profit margins and costs",
    icon: DollarSign,
    color: "bg-success/10 text-success",
  },
];

export default function Reports() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  // Allow all users to access reports - removing admin-only restriction
  /*
  // Check if user is admin
  if (!isAdmin && !authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to view reports. This feature is only available to administrators.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
  */
  
  const { data: salesData = [], loading: salesLoading } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);
  const { data: inventoryData = [], loading: inventoryLoading } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);
  const { data: customersData = [], loading: customersLoading } = useFirestoreCollection<Customer>(COLLECTIONS.CUSTOMERS);
  const { data: purchasesData = [], loading: purchasesLoading } = useFirestoreCollection<PurchaseOrder>(COLLECTIONS.PURCHASES);
  const { data: serviceData = [], loading: serviceLoading } = useFirestoreCollection<ServiceJob>(COLLECTIONS.SERVICES);

  const loading = authLoading || salesLoading || inventoryLoading || customersLoading || purchasesLoading || serviceLoading;

  // Helper function to parse dates safely
  const parseDate = (dateString: string | Date | undefined): Date => {
    if (!dateString) return new Date();
    
    if (typeof dateString === 'string') {
      // Try to parse the date string
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) return date;
      
      // Try alternative format parsing
      try {
        const cleaned = dateString.replace(/,\s*/g, ' ').replace(/\s+/g, ' ');
        const parsed = new Date(cleaned);
        if (!isNaN(parsed.getTime())) return parsed;
      } catch (error) {
        console.warn('Failed to parse date:', dateString, error);
      }
    }
    
    return new Date();
  };

  // Calculate monthly sales for current year
  const monthlySales = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyData = months.map((month, index) => ({
      month,
      sales: 0,
      purchases: 0,
      serviceRevenue: 0,
      profit: 0,
      monthIndex: index,
    }));

    // Sales data
    salesData?.forEach(sale => {
      if (!sale) return;
      
      const saleDate = parseDate(sale.date);
      if (saleDate.getFullYear() === currentYear) {
        const monthIndex = saleDate.getMonth();
        const grandTotal = typeof sale.grandTotal === 'number' && !isNaN(sale.grandTotal) ? sale.grandTotal : 0;
        monthlyData[monthIndex].sales += grandTotal;
      }
    });

    // Purchase data
    purchasesData?.forEach(purchase => {
      if (!purchase) return;
      
      const purchaseDate = parseDate(purchase.orderDate);
      if (purchaseDate.getFullYear() === currentYear) {
        const monthIndex = purchaseDate.getMonth();
        const purchaseTotal = typeof purchase.total === 'number' && !isNaN(purchase.total) ? purchase.total : 0;
        monthlyData[monthIndex].purchases += purchaseTotal;
      }
    });

    // Service data
    serviceData?.forEach(service => {
      if (!service) return;
      
      const serviceDate = parseDate(service.receivedDate);
      if (serviceDate.getFullYear() === currentYear && service.status === "Completed") {
        const monthIndex = serviceDate.getMonth();
        const serviceCost = typeof service.estimatedCost === 'number' && !isNaN(service.estimatedCost) ? service.estimatedCost : 0;
        monthlyData[monthIndex].serviceRevenue += serviceCost;
      }
    });

    // Calculate profit (simplified - actual profit would require cost data)
    monthlyData.forEach(data => {
      const sales = typeof data.sales === 'number' && !isNaN(data.sales) ? data.sales : 0;
      const purchases = typeof data.purchases === 'number' && !isNaN(data.purchases) ? data.purchases : 0;
      data.profit = sales - purchases;
    });

    return monthlyData;
  }, [salesData, purchasesData, serviceData]);

  // Calculate category distribution from inventory
  const categoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    
    inventoryData?.forEach(item => {
      if (!item) return;
      const category = item.category || 'Other';
      const stock = typeof item.stock === 'number' ? item.stock : 0;
      const price = typeof item.price === 'number' ? item.price : 0;
      categoryMap[category] = (categoryMap[category] || 0) + (stock * price);
    });

    const totalValue = Object.values(categoryMap).reduce((sum, val) => sum + val, 0);
    
    if (totalValue === 0) return [];

    return Object.entries(categoryMap)
      .map(([name, value], index) => {
        const calculatedValue = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
        return {
          name,
          value: isNaN(calculatedValue) ? 0 : calculatedValue,
          actualValue: value,
          color: COLORS[index % COLORS.length],
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 7); // Top 7 categories
  }, [inventoryData]);

  // Calculate profit margins by product - FIXED: Ensure no NaN values
  const profitMarginData = useMemo(() => {
    const profitData = inventoryData?.map(item => {
      if (!item) return null;
      
      const price = typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0;
      const cost = typeof item.cost === 'number' && !isNaN(item.cost) ? item.cost : 0;
      const profit = price && cost ? price - cost : 0;
      let profitMargin = 0;
      
      if (cost && price && price !== 0) {
        profitMargin = ((price - cost) / price) * 100;
      }
      
      return {
        name: item.name?.substring(0, 20) || "Unknown", // Limit name length
        profit: isNaN(profit) ? 0 : profit,
        profitMargin: isNaN(profitMargin) ? 0 : parseFloat(profitMargin.toFixed(1)),
        cost: isNaN(cost) ? 0 : cost,
        price: isNaN(price) ? 0 : price,
      };
    }).filter(item => item !== null) || [];
    
    // Filter out items with invalid profit margins and ensure all values are valid numbers
    const validData = profitData.filter(item => 
      item && 
      !isNaN(item.profitMargin) && 
      isFinite(item.profitMargin) && 
      item.profitMargin >= 0
    );
    
    return validData.sort((a, b) => b.profitMargin - a.profitMargin).slice(0, 10); // Top 10
  }, [inventoryData]);

  // Calculate customer lifetime value
  const customerLTV = useMemo(() => {
    const customerSales: Record<string, number> = {};
    
    salesData?.forEach(sale => {
      if (!sale) return;
      const customer = sale.customerName || 'Unknown';
      customerSales[customer] = (customerSales[customer] || 0) + (sale.grandTotal || 0);
    });

    return Object.entries(customerSales)
      .map(([customer, total]) => ({ 
        name: customer?.substring(0, 20) || 'Unknown', // Limit name length
        total: isNaN(total) ? 0 : total 
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // Top 5 customers
  }, [salesData]);

  // Calculate service performance
  const servicePerformance = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    const revenueByTechnician: Record<string, number> = {};

    serviceData?.forEach(job => {
      if (!job) return;
      
      // Count statuses
      const status = job.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      // Calculate revenue by technician
      if (job.status === "Completed" && job.technician) {
        revenueByTechnician[job.technician] = (revenueByTechnician[job.technician] || 0) + (job.estimatedCost || 0);
      }
    });

    return {
      statusCounts,
      revenueByTechnician,
      // Convert to array for charts
      statusData: Object.entries(statusCounts).map(([name, value], index) => ({
        name,
        value: isNaN(value) ? 0 : value,
        color: COLORS[index % COLORS.length]
      }))
    };
  }, [serviceData]);

  // Calculate inventory turnover - FIXED: Ensure no NaN values
  const inventoryTurnoverData = useMemo(() => {
    const turnoverData = inventoryData?.map(item => {
      if (!item) return null;
      
      // Calculate how many times inventory has turned over
      const salesForItem = salesData?.filter(sale => {
        if (!sale || !Array.isArray(sale.items)) return false;
        
        return sale.items.some(saleItem => 
          typeof saleItem?.name === 'string' && saleItem.name === item.name
        );
      }).reduce((sum, sale) => {
        if (!sale || !Array.isArray(sale.items)) return sum;
        
        const itemInSale = sale.items.find(saleItem => 
          typeof saleItem?.name === 'string' && saleItem.name === item.name
        );
        return sum + (itemInSale?.quantity || 0);
      }, 0) || 0;
      
      const stock = typeof item.stock === 'number' && !isNaN(item.stock) ? item.stock : 0;
      const turnover = stock > 0 ? salesForItem / stock : 0;
      
      return {
        name: item.name?.substring(0, 20) || "Unknown", // Limit name length
        turnover: isNaN(turnover) ? 0 : parseFloat(turnover.toFixed(2)),
        stock: isNaN(stock) ? 0 : stock,
        sold: salesForItem,
      };
    }).filter(item => item !== null) || [];
    
    // Filter out invalid turnover values
    const validData = turnoverData.filter(item => 
      item && 
      !isNaN(item.turnover) && 
      isFinite(item.turnover) && 
      item.turnover >= 0
    );
    
    return validData.sort((a, b) => b.turnover - a.turnover).slice(0, 10); // Top 10
  }, [inventoryData, salesData]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    // Current year sales
    const currentYearSales = salesData?.filter(sale => {
      if (!sale) return false;
      const saleDate = parseDate(sale.date);
      return saleDate.getFullYear() === currentYear;
    }) || [];
    
    const lastYearSales = salesData?.filter(sale => {
      if (!sale) return false;
      const saleDate = parseDate(sale.date);
      return saleDate.getFullYear() === lastYear;
    }) || [];

    const totalRevenue = currentYearSales.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
    const lastYearRevenue = lastYearSales.reduce((sum, sale) => sum + (sale.grandTotal || 0), 0);
    
    let revenueGrowth = "0.0";
    if (lastYearRevenue > 0 && !isNaN(totalRevenue) && !isNaN(lastYearRevenue)) {
      const growth = ((totalRevenue - lastYearRevenue) / lastYearRevenue) * 100;
      revenueGrowth = isNaN(growth) ? "0.0" : growth.toFixed(1);
    }

    // Average order value
    const avgOrderValue = currentYearSales.length > 0 && totalRevenue !== 0
      ? Math.round(totalRevenue / currentYearSales.length)
      : 0;
    const lastYearAvg = lastYearSales.length > 0 && lastYearRevenue !== 0
      ? Math.round(lastYearRevenue / lastYearSales.length)
      : 0;
    
    let avgGrowth = "0.0";
    if (lastYearAvg > 0 && lastYearAvg !== 0) {
      const growth = ((avgOrderValue - lastYearAvg) / lastYearAvg) * 100;
      avgGrowth = isNaN(growth) ? "0.0" : growth.toFixed(1);
    }

    // Customer retention (customers who made multiple orders)
    const customerOrderCounts: Record<string, number> = {};
    salesData?.forEach(sale => {
      if (!sale) return;
      customerOrderCounts[sale.customerName || 'Unknown'] = (customerOrderCounts[sale.customerName || 'Unknown'] || 0) + 1;
    });
    const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
    const totalCustomers = (customersData?.length || 0) || Object.keys(customerOrderCounts).length;
    const retentionRate = totalCustomers > 0
      ? Math.round((repeatCustomers / totalCustomers) * 100)
      : 0;

    // Inventory turnover (approximation)
    const totalInventoryValue = inventoryData?.reduce((sum, item) => {
      if (!item) return sum;
      const stock = typeof item.stock === 'number' ? item.stock : 0;
      const price = typeof item.price === 'number' ? item.price : 0;
      return sum + (stock * price);
    }, 0) || 0;
    
    let inventoryTurnover = "0.0";
    if (totalInventoryValue > 0 && totalRevenue !== 0) {
      const turnover = totalRevenue / totalInventoryValue;
      inventoryTurnover = isNaN(turnover) ? "0.0" : turnover.toFixed(1);
    }

    // Service revenue
    const currentYearServiceRevenue = serviceData?.filter(job => {
      if (!job) return false;
      const jobDate = parseDate(job.receivedDate);
      return jobDate.getFullYear() === currentYear && job.status === "Completed";
    }).reduce((sum, job) => sum + (job.estimatedCost || 0), 0) || 0;

    // Total business revenue (sales + service)
    const totalBusinessRevenue = totalRevenue + currentYearServiceRevenue;

    return {
      totalRevenue,
      currentYearServiceRevenue,
      totalBusinessRevenue,
      revenueGrowth,
      avgOrderValue,
      avgGrowth,
      retentionRate,
      inventoryTurnover,
    };
  }, [salesData, inventoryData, customersData, serviceData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            This Year
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Report Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {reports.map((report) => (
          <button
            key={report.title}
            className="bg-card p-4 rounded-xl border border-border/50 text-left hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg ${report.color} flex items-center justify-center mb-3`}>
              <report.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground">{report.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
          </button>
        ))}
      </div>

      {/* Business Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{metrics.totalBusinessRevenue >= 100000 
                ? `${(metrics.totalBusinessRevenue / 100000).toFixed(2)}L` 
                : metrics.totalBusinessRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Sales + Service revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Revenue</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{metrics.totalRevenue >= 100000 
                ? `${(metrics.totalRevenue / 100000).toFixed(2)}L` 
                : metrics.totalRevenue.toLocaleString()}
            </div>
            <p className={`text-xs ${Number(metrics.revenueGrowth) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {Number(metrics.revenueGrowth) >= 0 ? '+' : ''}{metrics.revenueGrowth}% vs last year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Revenue</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{metrics.currentYearServiceRevenue >= 100000 
                ? `${(metrics.currentYearServiceRevenue / 100000).toFixed(2)}L` 
                : metrics.currentYearServiceRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              from completed service jobs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Retention</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.retentionRate}%</div>
            <p className="text-xs text-muted-foreground">
              repeat customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Business Revenue Chart */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm">
          <div className="p-4 md:p-6 border-b border-border/50">
            <h3 className="section-title text-foreground">Monthly Business Revenue (2024)</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sales, Service, and Profit trends
            </p>
          </div>
          <div className="p-4 md:p-6">
            {monthlySales.every(d => d.sales === 0 && d.serviceRevenue === 0) ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No revenue data available for this year
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySales} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "hsl(210, 15%, 45%)", fontSize: 12 }}
                      axisLine={{ stroke: "hsl(210, 20%, 90%)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "hsl(210, 15%, 45%)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(210, 20%, 90%)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => [
                        `₹${value.toLocaleString()}`,
                        name === 'sales' ? 'Sales' : 
                        name === 'serviceRevenue' ? 'Service Revenue' : 
                        name === 'profit' ? 'Profit' : name
                      ]}
                    />
                    <Bar dataKey="sales" fill="hsl(173, 58%, 39%)" name="Sales" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="serviceRevenue" fill="hsl(24, 95%, 53%)" name="Service Revenue" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" fill="hsl(142, 71%, 45%)" name="Profit" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm">
          <div className="p-4 md:p-6 border-b border-border/50">
            <h3 className="section-title text-foreground">Sales by Category</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Revenue distribution across product types
            </p>
          </div>
          <div className="p-4 md:p-6">
            {categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No category data available
              </div>
            ) : (
              <div className="h-[300px] flex items-center">
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, "Share"]}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.name}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 md:p-6">
        <h3 className="section-title text-foreground mb-4">Key Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Revenue (YTD)</p>
            <p className="text-2xl font-bold font-heading text-foreground">
              ₹{metrics.totalRevenue >= 100000 
                ? `${(metrics.totalRevenue / 100000).toFixed(2)}L` 
                : metrics.totalRevenue.toLocaleString()}
            </p>
            <p className={`text-xs mt-1 ${!isNaN(parseFloat(metrics.revenueGrowth)) && Number(metrics.revenueGrowth) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {!isNaN(parseFloat(metrics.revenueGrowth)) && Number(metrics.revenueGrowth) >= 0 ? '+' : ''}{!isNaN(parseFloat(metrics.revenueGrowth)) ? metrics.revenueGrowth : '0.0'}% vs last year
            </p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Avg. Order Value</p>
            <p className="text-2xl font-bold font-heading text-foreground">₹{metrics.avgOrderValue.toLocaleString()}</p>
            <p className={`text-xs mt-1 ${!isNaN(parseFloat(metrics.avgGrowth)) && Number(metrics.avgGrowth) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {!isNaN(parseFloat(metrics.avgGrowth)) && Number(metrics.avgGrowth) >= 0 ? '+' : ''}{!isNaN(parseFloat(metrics.avgGrowth)) ? metrics.avgGrowth : '0.0'}% vs last year
            </p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Customer Retention</p>
            <p className="text-2xl font-bold font-heading text-foreground">{metrics.retentionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Repeat customers</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Inventory Turnover</p>
            <p className="text-2xl font-bold font-heading text-foreground">{metrics.inventoryTurnover}x</p>
            <p className="text-xs text-muted-foreground mt-1">Times per year</p>
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profit Margin Analysis - FIXED: Added data validation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="w-5 h-5" />
              Top Products by Profit Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {profitMarginData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No profit margin data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={profitMarginData} 
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      domain={['auto', 'auto']} 
                      tickFormatter={(value) => `${value}%`} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, "Profit Margin"]}
                      labelFormatter={(label) => `Product: ${label}`}
                    />
                    <Bar 
                      dataKey="profitMargin" 
                      fill="hsl(142, 71%, 45%)" 
                      name="Profit Margin" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Lifetime Value */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Customers by Lifetime Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {customerLTV.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No customer data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={customerLTV} 
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Total Spent"]}
                      labelFormatter={(label) => `Customer: ${label}`}
                    />
                    <Bar 
                      dataKey="total" 
                      fill="hsl(24, 95%, 53%)" 
                      name="Total Spent" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Service Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Service Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {servicePerformance.statusData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No service data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={servicePerformance.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {servicePerformance.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Jobs"]} />
                  </RePieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Turnover */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Top Products by Inventory Turnover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {inventoryTurnoverData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No inventory turnover data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={inventoryTurnoverData} 
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'turnover') return [value, "Turnover Ratio"];
                        return [value, name];
                      }}
                      content={({ payload }) => {
                        if (payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border p-2 rounded shadow-sm">
                              <p className="font-medium">{data.name}</p>
                              <p>Turnover: {data.turnover}</p>
                              <p>Stock: {data.stock}</p>
                              <p>Sold: {data.sold}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="turnover" 
                      fill="hsl(210, 40%, 50%)" 
                      name="Turnover" 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}