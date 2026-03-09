import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { COLLECTIONS } from "@/lib/firebaseCollections";
import { SaleOrder } from "@/types/firebase";
import { useMemo } from "react";
import { Loader2, TrendingUp } from "lucide-react";

export function SalesChart() {
  const { data: salesData, loading } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);

  // Calculate sales data for the last 7 days
  const chartData = useMemo(() => {
    const last7Days = [];
    const today = new Date();
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toDateString();
      
      last7Days.push({
        name: dayName,
        sales: 0,
        date: dateStr,
      });
    }
    
    // Aggregate sales by day
    salesData.forEach(sale => {
      const saleDate = new Date(sale.date).toDateString();
      const dayData = last7Days.find(d => d.date === saleDate);
      if (dayData) {
        dayData.sales += typeof sale.grandTotal === 'number' ? sale.grandTotal : 0;
      }
    });
    
    return last7Days;
  }, [salesData]);
  return (
    <div className="glass-card bg-gradient-to-br from-card/90 to-background/50 border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-up">
      <div className="p-5 md:p-7 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Weekly Sales Trend
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sales performance this week
            </p>
          </div>
          <div className="bg-primary/10 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-[250px] md:h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : chartData.every(d => d.sales === 0) ? (
          <div className="flex flex-col items-center justify-center h-[250px] md:h-[300px] text-muted-foreground">
            <TrendingUp className="w-10 h-10 mb-3 opacity-50" />
            <p>No sales data for the last 7 days</p>
          </div>
        ) : (
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(173, 58%, 45%)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(173, 58%, 35%)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 25%)" strokeOpacity={0.3} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(210, 15%, 70%)", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(210, 20%, 30%)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(210, 15%, 70%)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 40%, 15%)",
                    border: "1px solid hsl(210, 20%, 30%)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)",
                    padding: "12px",
                    color: "hsl(210, 40%, 98%)"
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Sales"]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(173, 58%, 45%)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}