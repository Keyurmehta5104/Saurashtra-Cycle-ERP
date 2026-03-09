import { useState, useEffect } from 'react';
import { Bell, Package, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { InventoryItem } from '@/types/firebase';

interface LowStockAlertProps {
  onAlertClick?: (item: InventoryItem) => void;
}

export default function LowStockAlerts({ onAlertClick }: LowStockAlertProps) {
  const { data: inventoryData, loading } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(true);

  useEffect(() => {
    if (!loading) {
      const lowStock = inventoryData.filter(item => {
        const reorderLevel = item.reorderLevel || 10;
        return item.stock < reorderLevel && item.stock >= 0;
      });
      setLowStockItems(lowStock);
    }
  }, [inventoryData, loading]);

  const getStatus = (stock: number, reorderLevel?: number): "In Stock" | "Low Stock" | "Out of Stock" => {
    if (stock === 0) return "Out of Stock";
    if (stock < (reorderLevel || 10)) return "Low Stock";
    return "In Stock";
  };

  const getAlertIcon = (status: string) => {
    switch (status) {
      case 'Out of Stock': return <X className="w-4 h-4 text-destructive" />;
      case 'Low Stock': return <AlertTriangle className="w-4 h-4 text-warning" />;
      default: return <Package className="w-4 h-4 text-success" />;
    }
  };

  const getAlertSeverity = (status: string) => {
    switch (status) {
      case 'Out of Stock': return 'destructive';
      case 'Low Stock': return 'warning';
      default: return 'success';
    }
  };

  if (loading || lowStockItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-6 w-80 max-w-full z-[50]">
      <Card className="shadow-lg border border-border/50 bg-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-warning" />
              Stock Alerts
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowNotifications(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {lowStockItems.map(item => {
              const status = getStatus(item.stock, item.reorderLevel);
              return (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => onAlertClick && onAlertClick(item)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-${getAlertSeverity(status)}/10`}>
                      {getAlertIcon(status)}
                    </div>
                    <div>
                      <p className="font-medium truncate max-w-[140px]">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.stock} left</p>
                    </div>
                  </div>
                  <Badge variant={getAlertSeverity(status) === 'destructive' ? 'destructive' : getAlertSeverity(status)}>
                    {status}
                  </Badge>
                </div>
              );
            })}
          </div>
          <Button 
            variant="outline" 
            className="w-full mt-3"
            onClick={() => {
              // Navigate to inventory page
              window.location.hash = '#/inventory';
            }}
          >
            View All Items
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}