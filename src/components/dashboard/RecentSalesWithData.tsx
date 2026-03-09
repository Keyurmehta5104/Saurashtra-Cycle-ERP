import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SaleOrder } from "@/types/firebase";

interface RecentSalesWithDataProps {
  sales: SaleOrder[];
  loading: boolean;
}

const statusClasses = {
  Delivered: "bg-success/10 text-success",
  Processing: "bg-warning/10 text-warning",
  Shipped: "bg-primary/10 text-primary",
  Cancelled: "bg-destructive/10 text-destructive",
};

export function RecentSalesWithData({ sales, loading }: RecentSalesWithDataProps) {
  const recentSales = sales.slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/50">
        <h3 className="section-title text-foreground">Recent Sales</h3>
        <Link to="/sales">
          <Button variant="ghost" size="sm" className="text-primary">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      <div className="divide-y divide-border/50">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : recentSales.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sales yet
          </div>
        ) : (
          recentSales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between p-4 md:px-6 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {sale.orderId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusClasses[sale.status as keyof typeof statusClasses] || statusClasses.Processing
                    }`}
                  >
                    {sale.status}
                  </span>
                </div>
                <p className="font-medium text-foreground truncate">
                  {typeof sale.customerName === 'string' ? sale.customerName : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {typeof sale.items === 'number' ? sale.items : 0} items
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-foreground">₹{typeof sale.grandTotal === 'number' ? sale.grandTotal.toLocaleString() : '0'}</p>
                <p className="text-sm text-muted-foreground">{sale.date}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}