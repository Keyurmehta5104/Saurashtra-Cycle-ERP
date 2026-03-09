import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { COLLECTIONS } from "@/lib/firebaseCollections";
import { SaleOrder } from "@/types/firebase";

const statusClasses = {
  Delivered: "bg-gradient-to-r from-success to-success/70 text-success-foreground",
  Processing: "bg-gradient-to-r from-warning to-warning/70 text-warning-foreground",
  Shipped: "bg-gradient-to-r from-primary to-primary/70 text-primary-foreground",
  Cancelled: "bg-gradient-to-r from-destructive to-destructive/70 text-destructive-foreground",
};

export function RecentSales() {
  const { data: salesData, loading } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);
  
  const recentSales = salesData.slice(0, 5);

  return (
    <div className="card-enhanced bg-card border border-border/50 shadow-lg animate-fade-in">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/50">
        <h3 className="text-xl font-bold text-foreground">Recent Sales</h3>
        <Link to="/sales">
          <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/10 hover:text-primary">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      <div className="divide-y divide-border/50">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : recentSales.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No sales yet
          </div>
        ) : (
          recentSales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between p-5 md:px-6 hover:bg-secondary/30 transition-colors duration-300"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-lg">
                    {sale.orderId}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      statusClasses[sale.status as keyof typeof statusClasses] || statusClasses.Processing
                    }`}
                  >
                    {sale.status}
                  </span>
                </div>
                <p className="font-bold text-lg text-foreground truncate mb-1">
                  {typeof sale.customerName === 'string' ? sale.customerName : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <span className="bg-secondary/30 px-2 py-0.5 rounded-md mr-2">
                    {typeof sale.items === 'number' ? sale.items : 0} items
                  </span>
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-xl text-foreground">₹{typeof sale.grandTotal === 'number' ? sale.grandTotal.toLocaleString() : '0'}</p>
                <p className="text-sm text-muted-foreground mt-1">{sale.date}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}