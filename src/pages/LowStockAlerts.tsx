import { useState, useEffect } from 'react';
import { Bell, Package, AlertTriangle, ShoppingCart, Mail, Phone, Search, Filter, Edit, Trash2, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { InventoryItem } from '@/types/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function LowStockAlerts() {
  const { data: inventoryData, loading, update } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    if (!loading) {
      const lowStock = inventoryData.filter(item => {
        const reorderLevel = item.reorderLevel || 10;
        return item.stock < reorderLevel && item.stock >= 0;
      });
      setLowStockItems(lowStock);
    }
  }, [inventoryData, loading]);

  useEffect(() => {
    let result = lowStockItems;

    // Apply search filter
    if (searchQuery) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => {
        const reorderLevel = item.reorderLevel || 10;
        if (statusFilter === 'Out of Stock') return item.stock === 0;
        if (statusFilter === 'Low Stock') return item.stock < reorderLevel && item.stock > 0;
        return true;
      });
    }

    setFilteredItems(result);
  }, [lowStockItems, searchQuery, statusFilter]);

  const getStatus = (stock: number, reorderLevel?: number): "In Stock" | "Low Stock" | "Out of Stock" => {
    if (stock === 0) return "Out of Stock";
    if (stock < (reorderLevel || 10)) return "Low Stock";
    return "In Stock";
  };

  const statusClasses = {
    "In Stock": "bg-success/10 text-success",
    "Low Stock": "bg-warning/10 text-warning",
    "Out of Stock": "bg-destructive/10 text-destructive",
  };

  const handleReorder = async (item: InventoryItem) => {
    // This would typically open a reorder dialog or navigate to purchase page
    toast({
      title: "Reorder Initiated",
      description: `Reorder process started for ${item.name}.`,
    });
  };

  const handleContactSupplier = (item: InventoryItem) => {
    if (item.supplierContact) {
      // In a real app, this might open a modal to contact supplier
      toast({
        title: "Contact Supplier",
        description: `Contacting ${item.supplier} at ${item.supplierContact}`,
      });
    } else {
      toast({
        title: "No Supplier Contact",
        description: "No contact information available for this supplier.",
        variant: "destructive"
      });
    }
  };

  // Allow all users to access low stock alerts - removing admin-only restriction
  /*
  // Check if user is admin
  if (!isAdmin && !authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to view low stock alerts. This feature is only available to administrators.
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

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Low Stock Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage inventory items that are running low
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.hash = '#/inventory'}
          >
            <Package className="w-4 h-4 mr-2" />
            Inventory
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Low Stock Items</p>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock Items</p>
                <p className="text-2xl font-bold text-destructive">{lowStockItems.filter(item => item.stock === 0).length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Items Needing Reorder</p>
                <p className="text-2xl font-bold">{lowStockItems.filter(item => item.stock > 0 && item.stock < (item.reorderLevel || 10)).length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search low stock items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Low Stock">Low Stock</SelectItem>
            <SelectItem value="Out of Stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts Table */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="w-[100px]">SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden sm:table-cell">Brand</TableHead>
                <TableHead className="w-[80px]">Stock</TableHead>
                <TableHead className="w-[100px]">Reorder Level</TableHead>
                <TableHead className="hidden lg:table-cell">Supplier</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No low stock items found. All items are well-stocked!
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-secondary/30">
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {item.category}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {item.brand}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-1">
                        {item.stock}
                        {item.reorderLevel && item.stock < item.reorderLevel && item.stock > 0 && (
                          <span className="text-xs text-warning">(Low)</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.reorderLevel || 10}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {item.supplier || "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusClasses[getStatus(item.stock, item.reorderLevel)] || statusClasses["In Stock"]
                        }`}
                      >
                        {getStatus(item.stock, item.reorderLevel)}
                      </span>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReorder(item)}
                        className="text-xs"
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Reorder
                      </Button>
                      {item.supplierContact && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleContactSupplier(item)}
                          className="text-xs"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Contact
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Action Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Management Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <span>Set appropriate reorder levels for each product to avoid stockouts</span>
            </li>
            <li className="flex items-start gap-2">
              <ShoppingCart className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Review supplier contact information regularly to ensure timely reordering</span>
            </li>
            <li className="flex items-start gap-2">
              <Package className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              <span>Consider seasonal demand patterns when setting reorder levels</span>
            </li>
            <li className="flex items-start gap-2">
              <Bell className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <span>Set up automated alerts to notify you when stock levels are low</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}