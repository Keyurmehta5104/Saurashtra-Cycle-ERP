import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Plus, Filter, Edit, Trash2, Loader2, Package, AlertTriangle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { COLLECTIONS } from "@/lib/firebaseCollections";
import { InventoryItem } from "@/types/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateInventoryWithLedger } from "@/lib/stockLedger";
import { StockHistoryDialog } from "@/components/inventory/StockHistoryDialog";

const statusClasses = {
  "In Stock": "bg-success/10 text-success",
  "Low Stock": "bg-warning/10 text-warning",
  "Out of Stock": "bg-destructive/10 text-destructive",
};

export default function Inventory() {
  const { user, isStaff } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem & {
    model?: string;
    color?: string;
    size?: string;
    supplier?: string;
    supplierContact?: string;
    warrantyPeriod?: string;
  } | null>(null);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === "/inventory/add") {
      setIsAddOpen(true);
    }
  }, [location.pathname]);
  
  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    category: "Mountain Bike",
    brand: "",
    model: "",
    color: "",
    size: "",
    stock: 0,
    price: 0,
    cost: 0,
    reorderLevel: 10,
    supplier: "",
    supplierContact: "",
    warrantyPeriod: "",
    description: "",
  });

  const { data: inventoryData, loading, add, remove, update } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);
  const { toast } = useToast();
  const { user } = useAuth();

  const getStatus = (stock: number, reorderLevel?: number): "In Stock" | "Low Stock" | "Out of Stock" => {
    if (stock === 0) return "Out of Stock";
    if (stock < (reorderLevel || 10)) return "Low Stock";
    return "In Stock";
  };

  const handleAddProduct = async () => {
    // Check for duplicate SKU
    if (inventoryData.some(item => item.sku.toLowerCase() === newProduct.sku.toLowerCase())) {
      toast({ title: "SKU already exists!", description: "Please use a unique SKU.", variant: "destructive" });
      return;
    }

    if (newProduct.stock < 0) {
      toast({ title: "Invalid Stock", description: "Stock cannot be negative.", variant: "destructive" });
      return;
    }

    try {
      await add({
        ...newProduct,
        status: getStatus(newProduct.stock, newProduct.reorderLevel),
      });
      setIsAddOpen(false);
      setNewProduct({ sku: "", name: "", category: "Mountain Bike", brand: "", model: "", color: "", size: "", stock: 0, price: 0, cost: 0, reorderLevel: 10, supplier: "", supplierContact: "", warrantyPeriod: "", description: "" });
      toast({ title: "Product added successfully" });
    } catch (error) {
      toast({ title: "Error adding product", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      toast({ title: "Product deleted" });
    } catch (error) {
      toast({ title: "Error deleting product", variant: "destructive" });
    }
  };

  const handleEditProduct = async () => {
    if (!currentItem) return;

    if (currentItem.stock < 0) {
      toast({ title: "Invalid Stock", description: "Stock cannot be negative.", variant: "destructive" });
      return;
    }

    // Check duplicate SKU if SKU was changed
    const originalItem = inventoryData.find(i => i.id === currentItem.id);
    if (originalItem && originalItem.sku !== currentItem.sku) {
      if (inventoryData.some(item => item.sku.toLowerCase() === currentItem.sku.toLowerCase() && item.id !== currentItem.id)) {
        toast({ title: "SKU already exists!", description: "Please use a unique SKU.", variant: "destructive" });
        return;
      }
    }

    try {
      // If stock changed, use the ledger
      if (originalItem && originalItem.stock !== currentItem.stock) {
        await updateInventoryWithLedger(
          currentItem.id,
          currentItem.name,
          currentItem.sku,
          currentItem.stock,
          originalItem.stock,
          user?.uid || "unknown",
          "Manual adjustment from Inventory UI"
        );
      }

      await update(currentItem.id, {
        ...currentItem,
        status: getStatus(currentItem.stock, currentItem.reorderLevel),
      });
      setIsEditOpen(false);
      setCurrentItem(null);
      toast({ title: "Product updated successfully" });
    } catch (error) {
      toast({ title: "Error updating product", variant: "destructive" });
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setCurrentItem({
      ...item,
      model: item.model || "",
      color: item.color || "",
      size: item.size || "",
      supplier: item.supplier || "",
      supplierContact: item.supplierContact || "",
      warrantyPeriod: item.warrantyPeriod || "",
    });
    setIsEditOpen(true);
  };

  const filteredData = inventoryData.filter((item) => {
    const matchesSearch =
      (item.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item.sku?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = 
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case "stock_asc": return a.stock - b.stock;
      case "stock_desc": return b.stock - a.stock;
      case "price_asc": return a.price - b.price;
      case "price_desc": return b.price - a.price;
      case "name_desc": return (b.name || "").localeCompare(a.name || "");
      case "name_asc": 
      default:
        return (a.name || "").localeCompare(b.name || "");
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title text-foreground">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your stock and products
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            // Export inventory data to CSV
            const csvContent = [
              ['SKU', 'Name', 'Category', 'Brand', 'Model', 'Color', 'Size', 'Stock', 'Price', 'Cost', 'Reorder Level', 'Supplier', 'Supplier Contact', 'Warranty', 'Description'],
              ...inventoryData.map(item => [
                item.sku,
                item.name,
                item.category,
                item.brand,
                item.model || '',
                item.color || '',
                item.size || '',
                item.stock,
                item.price,
                item.cost || 0,
                item.reorderLevel || 0,
                item.supplier || '',
                item.supplierContact || '',
                item.warrantyPeriod || '',
                item.description || ''
              ])
            ].map(row => row.join(',')).join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'inventory-export.csv';
            a.click();
            window.URL.revokeObjectURL(url);
          }}>
            <Package className="w-4 h-4 mr-2" />
            Export
          </Button>
          {isStaff && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>SKU</Label>
                      <Input value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} />
                    </div>
                    <div>
                      <Label>Product Name</Label>
                      <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={newProduct.category} onValueChange={(v) => setNewProduct({ ...newProduct, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mountain Bike">Mountain Bike</SelectItem>
                          <SelectItem value="Road Bike">Road Bike</SelectItem>
                          <SelectItem value="Hybrid Bike">Hybrid Bike</SelectItem>
                          <SelectItem value="Kids Cycle">Kids Cycle</SelectItem>
                          <SelectItem value="Accessories">Accessories</SelectItem>
                          <SelectItem value="Spare Parts">Spare Parts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Brand</Label>
                        <Input value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} />
                      </div>
                      <div>
                        <Label>Model</Label>
                        <Input value={newProduct.model} onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Color</Label>
                        <Input value={newProduct.color} onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })} />
                      </div>
                      <div>
                        <Label>Size</Label>
                        <Input value={newProduct.size} onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Stock</Label>
                        <Input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <Label>Reorder Level</Label>
                        <Input type="number" value={newProduct.reorderLevel} onChange={(e) => setNewProduct({ ...newProduct, reorderLevel: parseInt(e.target.value) || 10 })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Selling Price (₹)</Label>
                        <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <Label>Cost Price (₹)</Label>
                        <Input type="number" value={newProduct.cost} onChange={(e) => setNewProduct({ ...newProduct, cost: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>
                    <div>
                      <Label>Warranty Period</Label>
                      <Input value={newProduct.warrantyPeriod} onChange={(e) => setNewProduct({ ...newProduct, warrantyPeriod: e.target.value })} placeholder="e.g., 1 year, 6 months" />
                    </div>
                    <div>
                      <Label>Supplier</Label>
                      <Input value={newProduct.supplier} onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })} />
                    </div>
                    <div>
                      <Label>Supplier Contact</Label>
                      <Input value={newProduct.supplierContact} onChange={(e) => setNewProduct({ ...newProduct, supplierContact: e.target.value })} />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Product description..." />
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Button onClick={handleAddProduct} className="w-full">Add Product</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 input-enhanced"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40 h-10 border-border">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Mountain Bike">Mountain Bike</SelectItem>
              <SelectItem value="Road Bike">Road Bike</SelectItem>
              <SelectItem value="Hybrid Bike">Hybrid Bike</SelectItem>
              <SelectItem value="Kids Cycle">Kids Cycle</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
              <SelectItem value="Spare Parts">Spare Parts</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 h-10 border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48 h-10 border-border">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
              <SelectItem value="stock_asc">Stock (Low-High)</SelectItem>
              <SelectItem value="stock_desc">Stock (High-Low)</SelectItem>
              <SelectItem value="price_asc">Price (Low-High)</SelectItem>
              <SelectItem value="price_desc">Price (High-Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Products</h3>
              <p className="text-2xl font-bold">{inventoryData.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">In Stock</h3>
              <p className="text-2xl font-bold">{inventoryData.filter(item => item.status === 'In Stock').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Low Stock</h3>
              <p className="text-2xl font-bold text-warning">{inventoryData.filter(item => item.status === 'Low Stock').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Out of Stock</h3>
              <p className="text-2xl font-bold text-destructive">{inventoryData.filter(item => item.status === 'Out of Stock').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Inventory Value</h3>
              <p className="text-2xl font-bold">₹{inventoryData.reduce((sum, item) => sum + (item.price || 0) * item.stock, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {inventoryData.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock').length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Stock Alerts
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            {inventoryData.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock').slice(0, 3).map(item => (
              <li key={item.id} className="flex justify-between">
                <span>{item.name}</span>
                <span className="font-medium">{item.stock} left</span>
              </li>
            ))}
            {inventoryData.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock').length > 3 && (
              <li className="text-center">+ {inventoryData.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock').length - 3} more items</li>
            )}
          </ul>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="w-[100px]">SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden sm:table-cell">Brand</TableHead>
                <TableHead className="hidden lg:table-cell">Model</TableHead>
                <TableHead className="hidden lg:table-cell w-[80px]">Color</TableHead>
                <TableHead className="w-[80px]">Stock</TableHead>
                <TableHead className="w-[100px]">Selling Price</TableHead>
                <TableHead className="hidden lg:table-cell w-[100px]">Cost</TableHead>
                <TableHead className="hidden xl:table-cell w-[100px]">Profit Margin</TableHead>
                <TableHead className="hidden xl:table-cell">Supplier</TableHead>
                <TableHead className="hidden xl:table-cell w-[100px]">Warranty</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                    No products found. Add your first product!
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-secondary/30">
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {item.category}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {item.brand}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {item.model || "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {item.color || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.stock}
                      {item.reorderLevel && item.stock < item.reorderLevel && item.stock > 0 && (
                        <span className="text-xs text-warning ml-1">(Low)</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-right">₹{item.price?.toLocaleString()}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-right">
                      {item.cost ? `₹${item.cost.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-right">
                      {item.cost && item.price ? (
                        <span className={`font-medium ${item.price > item.cost ? 'text-success' : 'text-destructive'}`}>
                          {((item.price - item.cost) / item.cost * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground">
                      {item.supplier || "-"}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground">
                      {item.warrantyPeriod || "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusClasses[item.status as keyof typeof statusClasses] || statusClasses["In Stock"]
                        }`}
                      >
                        {item.status}
                      </span>
                    </TableCell>
                     <TableCell className="text-right">
                      {isStaff && (
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-muted" 
                            onClick={() => openEditDialog(item)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-slate-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-muted" 
                            onClick={() => {
                              setHistoryItem(item);
                              setIsHistoryOpen(true);
                            }}
                            title="Stock History"
                          >
                            <History className="w-4 h-4 text-slate-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>SKU</Label>
                <Input 
                  value={currentItem?.sku || ""}
                  onChange={(e) => currentItem && setCurrentItem({...currentItem, sku: e.target.value})} 
                />
              </div>
              <div>
                <Label>Product Name</Label>
                <Input 
                  value={currentItem?.name || ""}
                  onChange={(e) => currentItem && setCurrentItem({...currentItem, name: e.target.value})} 
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select 
                  value={currentItem?.category || "Mountain Bike"}
                  onValueChange={(v) => currentItem && setCurrentItem({...currentItem, category: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mountain Bike">Mountain Bike</SelectItem>
                    <SelectItem value="Road Bike">Road Bike</SelectItem>
                    <SelectItem value="Hybrid Bike">Hybrid Bike</SelectItem>
                    <SelectItem value="Kids Cycle">Kids Cycle</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="Spare Parts">Spare Parts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Brand</Label>
                  <Input 
                    value={currentItem?.brand || ""}
                    onChange={(e) => currentItem && setCurrentItem({...currentItem, brand: e.target.value})} 
                  />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input 
                    value={currentItem?.model || ""}
                    onChange={(e) => currentItem && setCurrentItem({...currentItem, model: e.target.value})} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Color</Label>
                  <Input 
                    value={currentItem?.color || ""}
                    onChange={(e) => currentItem && setCurrentItem({...currentItem, color: e.target.value})} 
                  />
                </div>
                <div>
                  <Label>Size</Label>
                  <Input 
                    value={currentItem?.size || ""}
                    onChange={(e) => currentItem && setCurrentItem({...currentItem, size: e.target.value})} 
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stock</Label>
                  <Input 
                    type="number" 
                    value={currentItem?.stock || 0}
                    onChange={(e) => currentItem && setCurrentItem({...currentItem, stock: parseInt(e.target.value) || 0})} 
                  />
                </div>
                <div>
                  <Label>Reorder Level</Label>
                  <Input 
                    type="number" 
                    value={currentItem?.reorderLevel || 10}
                    onChange={(e) => currentItem && setCurrentItem({...currentItem, reorderLevel: parseInt(e.target.value) || 10})} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Selling Price (₹)</Label>
                  <Input 
                    type="number" 
                    value={currentItem?.price || 0}
                    onChange={(e) => currentItem && setCurrentItem({...currentItem, price: parseInt(e.target.value) || 0})} 
                  />
                </div>
                <div>
                  <Label>Cost Price (₹)</Label>
                  <Input 
                    type="number" 
                    value={currentItem?.cost || 0}
                    onChange={(e) => currentItem && setCurrentItem({...currentItem, cost: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </div>
              <div>
                <Label>Warranty Period</Label>
                <Input 
                  value={currentItem?.warrantyPeriod || ""}
                  onChange={(e) => currentItem && setCurrentItem({...currentItem, warrantyPeriod: e.target.value})} 
                  placeholder="e.g., 1 year, 6 months"
                />
              </div>
              <div>
                <Label>Supplier</Label>
                <Input 
                  value={currentItem?.supplier || ""}
                  onChange={(e) => currentItem && setCurrentItem({...currentItem, supplier: e.target.value})} 
                />
              </div>
              <div>
                <Label>Supplier Contact</Label>
                <Input 
                  value={currentItem?.supplierContact || ""}
                  onChange={(e) => currentItem && setCurrentItem({...currentItem, supplierContact: e.target.value})} 
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input 
                  value={currentItem?.description || ""}
                  onChange={(e) => currentItem && setCurrentItem({...currentItem, description: e.target.value})} 
                  placeholder="Product description..."
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleEditProduct} className="flex-1">Update Product</Button>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
      <StockHistoryDialog 
        item={historyItem} 
        open={isHistoryOpen} 
        onOpenChange={setIsHistoryOpen} 
      />

    </div>
  );
}