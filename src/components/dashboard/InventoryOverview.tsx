import { ArrowRight, AlertTriangle, Loader2, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { COLLECTIONS } from "@/lib/firebaseCollections";
import { InventoryItem } from "@/types/firebase";

export function InventoryOverview() {
  const { data: inventoryData, loading } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);

  // Group by category and calculate totals
  const categoryStats = inventoryData.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = { stock: 0, capacity: 100 };
    }
    acc[category].stock += item.stock || 0;
    return acc;
  }, {} as Record<string, { stock: number; capacity: number }>);

  const inventoryItems = Object.entries(categoryStats).map(([category, data]) => ({
    category,
    stock: data.stock,
    capacity: Math.max(data.stock, 100),
    lowStock: data.stock < 15,
  }));

  return (
    <div className="card-enhanced bg-card border border-border/50 shadow-lg animate-fade-in">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/50">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" /> Inventory Overview
        </h3>
        <Link to="/inventory">
          <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/10 hover:text-primary">
            Manage
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      <div className="p-4 md:p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : inventoryItems.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No inventory data yet
          </div>
        ) : (
          inventoryItems.map((item) => (
            <div key={item.category} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-foreground bg-secondary/30 px-3 py-1.5 rounded-lg">
                    {item.category}
                  </span>
                  {item.lowStock && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-warning to-warning/70 text-warning-foreground">
                      <AlertTriangle className="w-4 h-4" />
                      Low Stock
                    </span>
                  )}
                </div>
                <span className="text-base font-semibold text-foreground">
                  {item.stock}/{item.capacity}
                </span>
              </div>
              <Progress
                value={(item.stock / item.capacity) * 100}
                className={`h-3 ${item.lowStock ? "[&>div]:bg-gradient-to-r [&>div]:from-warning [&>div]:to-warning/70" : "[&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-primary/70"}`}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}