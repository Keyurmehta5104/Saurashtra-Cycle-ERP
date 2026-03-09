import { useState } from "react";
import { Search, Plus, Truck, Calendar, Eye, Loader2, X, Package, FileText, Settings, CheckCircle2, XCircle } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { COLLECTIONS } from "@/lib/firebaseCollections";
import { PurchaseOrder, InventoryItem, LineItem } from "@/types/firebase";
import { useToast } from "@/hooks/use-toast";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";

const statusClasses = {
  Received: "bg-success/10 text-success",
  Approved: "bg-primary/10 text-primary",
  Pending: "bg-warning/10 text-warning",
  Cancelled: "bg-destructive/10 text-destructive",
};

const paymentClasses = {
  Paid: "bg-success/10 text-success",
  Unpaid: "bg-destructive/10 text-destructive",
  Partial: "bg-warning/10 text-warning",
};

export default function Purchases() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Status update state
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<"Pending" | "Approved" | "Received" | "Cancelled">();
  
  // Payment update state
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState<"Paid" | "Unpaid" | "Partial">();
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [poData, setPoData] = useState<PurchaseOrder | null>(null);
  const [showPO, setShowPO] = useState(false);
  const [newPO, setNewPO] = useState<{
    supplier: string;
    supplierPhone: string;
    orderDate: string;
    expectedDate: string;
    invoiceNo: string;
    bookNo: string;
    partyGstin: string;
    brand: string;
    model: string;
    colour: string;
    size: string;
    frameNo: string;
    seat: string;
    carrier: string;
    standDoubleSide: string;
    lock: string;
    chainCover: string;
    status: "Pending" | "Approved" | "Received" | "Cancelled";
    payment: "Paid" | "Unpaid" | "Partial";
    paymentType?: "Cash" | "UPI" | "Card" | "Bank Transfer" | "Cheque" | "Credit" | "Other";
    tax: number;
    notes: string;
    bankName?: string;
    transactionId?: string;
    chequeNumber?: string;
    bankReference?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCVV?: string;
    cardHolderName?: string;
  }>({
    supplier: "",
    supplierPhone: "",
    orderDate: "",
    expectedDate: "",
    invoiceNo: "",
    bookNo: "",
    partyGstin: "",
    brand: "",
    model: "",
    colour: "",
    size: "",
    frameNo: "",
    seat: "",
    carrier: "",
    standDoubleSide: "",
    lock: "",
    chainCover: "",
    status: "Pending",
    payment: "Unpaid",
    tax: 0,
    notes: "",
  });

  const { data: purchaseOrders, loading: poLoading, add: addPO, update } = useFirestoreCollection<PurchaseOrder>(COLLECTIONS.PURCHASES);
  const { data: inventoryData, loading: inventoryLoading } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);
  const { toast } = useToast();

  const loading = poLoading || inventoryLoading;

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * newPO.tax) / 100;
  const total = subtotal + taxAmount;

  const handleAddProduct = () => {
    const product = inventoryData.find(p => p.id === selectedProduct);
    if (!product) {
      toast({ title: "Please select a product", variant: "destructive" });
      return;
    }
    if (quantity <= 0) {
      toast({ title: "Quantity must be greater than 0", variant: "destructive" });
      return;
    }
    if (unitPrice <= 0) {
      toast({ title: "Unit price must be greater than 0", variant: "destructive" });
      return;
    }

    const lineItem: LineItem = {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    };

    setLineItems([...lineItems, lineItem]);
    setSelectedProduct("");
    setQuantity(1);
    setUnitPrice(0);
  };

  const handleRemoveProduct = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleCreatePO = async () => {
    if (!newPO.supplier) {
      toast({ title: "Supplier name is required", variant: "destructive" });
      return;
    }
    if (lineItems.length === 0) {
      toast({ title: "Add at least one product", variant: "destructive" });
      return;
    }

    try {
      const purchaseOrder: Omit<PurchaseOrder, "id"> = {
        poNumber: `PO-${Date.now()}`,
        supplier: newPO.supplier,
        supplierPhone: newPO.supplierPhone,
        orderDate: newPO.orderDate || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        expectedDate: newPO.expectedDate,
        invoiceNo: newPO.invoiceNo,
        bookNo: newPO.bookNo,
        partyGstin: newPO.partyGstin,
        brand: newPO.brand,
        model: newPO.model,
        colour: newPO.colour,
        size: newPO.size,
        frameNo: newPO.frameNo,
        seat: newPO.seat,
        carrier: newPO.carrier,
        standDoubleSide: newPO.standDoubleSide,
        lock: newPO.lock,
        chainCover: newPO.chainCover,
        items: lineItems.reduce((sum, item) => sum + item.quantity, 0),
        lineItems,
        subtotal,
        tax: taxAmount,
        total,
        status: newPO.status,
        payment: newPO.payment,
        notes: newPO.notes,
        bankName: newPO.bankName,
        transactionId: newPO.transactionId,
        chequeNumber: newPO.chequeNumber,
        bankReference: newPO.bankReference,
        cardNumber: newPO.cardNumber,
        cardExpiry: newPO.cardExpiry,
        cardCVV: newPO.cardCVV,
        cardHolderName: newPO.cardHolderName,
      };

      await addPO(purchaseOrder);
      
      // Show PO document
      setPoData(purchaseOrder as PurchaseOrder);
      setShowPO(true);
      
      // Reset form
      setIsAddOpen(false);
      setLineItems([]);
      setNewPO({
        supplier: "",
        supplierPhone: "",
        orderDate: "",
        expectedDate: "",
        invoiceNo: "",
        bookNo: "",
        partyGstin: "",
        brand: "",
        model: "",
        colour: "",
        size: "",
        frameNo: "",
        seat: "",
        carrier: "",
        standDoubleSide: "",
        lock: "",
        chainCover: "",
        status: "Pending",
        payment: "Unpaid",
        paymentType: undefined,
        tax: 0,
        notes: "",
        bankName: undefined,
        transactionId: undefined,
        chequeNumber: undefined,
        bankReference: undefined,
        cardNumber: undefined,
        cardExpiry: undefined,
        cardCVV: undefined,
        cardHolderName: undefined,
      });
      toast({ title: "Purchase order created successfully" });
    } catch (error) {
      toast({ title: "Error creating purchase order", variant: "destructive" });
    }
  };

  const filteredOrders = purchaseOrders.filter(
    (order) =>
      order.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.poNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = purchaseOrders.reduce((acc, p) => acc + (typeof p.total === 'number' ? p.total : 0), 0);
  const pendingPayments = purchaseOrders.filter(p => p.payment !== "Paid").reduce((acc, p) => acc + (typeof p.total === 'number' ? p.total : 0), 0);
  const inTransit = purchaseOrders.filter(p => p.status === "Approved" || p.status === "Pending").length;
  
  // Additional ERP metrics
  const avgOrderValue = purchaseOrders.length > 0 ? totalAmount / purchaseOrders.length : 0;
  const receivedOrders = purchaseOrders.filter(p => p.status === "Received").length;
  const cancelledOrders = purchaseOrders.filter(p => p.status === "Cancelled").length;
  const paidOrders = purchaseOrders.filter(p => p.payment === "Paid").length;
  
  // Top suppliers by purchase amount
  const supplierPurchaseMap = purchaseOrders.reduce((acc, order) => {
    const supplier = typeof order.supplier === 'string' ? order.supplier : 'Unknown';
    acc[supplier] = (acc[supplier] || 0) + (typeof order.total === 'number' ? order.total : 0);
    return acc;
  }, {} as Record<string, number>);
  
  const topSuppliers = Object.entries(supplierPurchaseMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount]) => ({ name, amount }));

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
          <h1 className="page-title text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage supplier orders and inventory restocking
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Purchase Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Bill and Supplier Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Book No.</Label>
                  <Input value={newPO.bookNo} onChange={(e) => setNewPO({ ...newPO, bookNo: e.target.value })} placeholder="e.g. P-1" />
                </div>
                <div>
                  <Label>Invoice No.</Label>
                  <Input value={newPO.invoiceNo} onChange={(e) => setNewPO({ ...newPO, invoiceNo: e.target.value })} placeholder="Supplier bill no" />
                </div>
                <div>
                  <Label>Order Date</Label>
                  <Input type="date" value={newPO.orderDate} onChange={(e) => setNewPO({ ...newPO, orderDate: e.target.value })} />
                </div>
                <div>
                  <Label>Expected Delivery Date</Label>
                  <Input value={newPO.expectedDate} onChange={(e) => setNewPO({ ...newPO, expectedDate: e.target.value })} placeholder="e.g. Jan 15, 2025" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier Name *</Label>
                  <Input
                    value={newPO.supplier}
                    onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })}
                    placeholder="ABC Traders"
                  />
                </div>
                <div>
                  <Label>Supplier Phone</Label>
                  <Input
                    value={newPO.supplierPhone}
                    onChange={(e) => setNewPO({ ...newPO, supplierPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Party GSTIN</Label>
                  <Input value={newPO.partyGstin} onChange={(e) => setNewPO({ ...newPO, partyGstin: e.target.value })} placeholder="Optional" />
                </div>
              </div>

              {/* Cycle Particulars (bill format) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label>Brand</Label>
                  <Input value={newPO.brand} onChange={(e) => setNewPO({ ...newPO, brand: e.target.value })} placeholder="EM" />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input value={newPO.model} onChange={(e) => setNewPO({ ...newPO, model: e.target.value })} placeholder="Sondel 13" />
                </div>
                <div>
                  <Label>Colour</Label>
                  <Input value={newPO.colour} onChange={(e) => setNewPO({ ...newPO, colour: e.target.value })} placeholder="Black" />
                </div>
                <div>
                  <Label>Size</Label>
                  <Input value={newPO.size} onChange={(e) => setNewPO({ ...newPO, size: e.target.value })} placeholder="-" />
                </div>
                <div>
                  <Label>Frame No.</Label>
                  <Input value={newPO.frameNo} onChange={(e) => setNewPO({ ...newPO, frameNo: e.target.value })} placeholder="Frame number" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label>Seat</Label>
                  <Input value={newPO.seat} onChange={(e) => setNewPO({ ...newPO, seat: e.target.value })} placeholder="Yes/No" />
                </div>
                <div>
                  <Label>Carrier</Label>
                  <Input value={newPO.carrier} onChange={(e) => setNewPO({ ...newPO, carrier: e.target.value })} placeholder="Yes/No" />
                </div>
                <div>
                  <Label>Stand Double/Side</Label>
                  <Input value={newPO.standDoubleSide} onChange={(e) => setNewPO({ ...newPO, standDoubleSide: e.target.value })} placeholder="Yes/No" />
                </div>
                <div>
                  <Label>Lock</Label>
                  <Input value={newPO.lock} onChange={(e) => setNewPO({ ...newPO, lock: e.target.value })} placeholder="Yes/No" />
                </div>
                <div>
                  <Label>Chain Cover</Label>
                  <Input value={newPO.chainCover} onChange={(e) => setNewPO({ ...newPO, chainCover: e.target.value })} placeholder="Yes/No" />
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-3 border border-border/50 rounded-lg p-4 bg-secondary/20">
                <Label>Add Products</Label>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <Select value={selectedProduct} onValueChange={(val) => {
                      setSelectedProduct(val);
                      const product = inventoryData.find(p => p.id === val);
                      if (product && product.cost) {
                        setUnitPrice(product.cost);
                      } else if (product) {
                        setUnitPrice(product.price * 0.7); // Default to 70% of selling price
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryData.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      placeholder="Quantity"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                      placeholder="Unit Price"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button type="button" onClick={handleAddProduct} variant="outline" className="w-full">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              {lineItems.length > 0 && (
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lineItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">₹{item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-semibold">₹{item.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRemoveProduct(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tax (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newPO.tax}
                    onChange={(e) => setNewPO({ ...newPO, tax: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={newPO.status} onValueChange={(v: "Pending" | "Approved" | "Received" | "Cancelled") => setNewPO({ ...newPO, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Received">Received</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Status</Label>
                  <Select value={newPO.payment} onValueChange={(v: "Paid" | "Unpaid" | "Partial") => setNewPO({ ...newPO, payment: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Type</Label>
                  <Select value={newPO.paymentType || ""} onValueChange={(v: "Cash" | "UPI" | "Card" | "Bank Transfer" | "Cheque" | "Credit" | "Other" | "") => {
                    setNewPO({ 
                      ...newPO, 
                      paymentType: v || undefined,
                      // Reset all payment-related fields when payment type changes
                      bankName: undefined,
                      transactionId: undefined,
                      chequeNumber: undefined,
                      bankReference: undefined,
                      cardNumber: undefined,
                      cardExpiry: undefined,
                      cardCVV: undefined,
                      cardHolderName: undefined
                    });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select payment type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Bank-related fields - shown only for Bank Transfer and Cheque */}
              {(newPO.paymentType === "Bank Transfer" || newPO.paymentType === "Cheque") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{newPO.paymentType === "Cheque" ? "Cheque Number" : "Bank Name"}</Label>
                    <Input
                      value={newPO[newPO.paymentType === "Cheque" ? "chequeNumber" : "bankName"] || ""}
                      onChange={(e) => setNewPO({ 
                        ...newPO, 
                        [newPO.paymentType === "Cheque" ? "chequeNumber" : "bankName"]: e.target.value 
                      })}
                      placeholder={newPO.paymentType === "Cheque" ? "Enter cheque number" : "Enter bank name"}
                    />
                  </div>
                  <div>
                    <Label>{newPO.paymentType === "Cheque" ? "Bank Name" : "Transaction ID"}</Label>
                    <Input
                      value={newPO[newPO.paymentType === "Cheque" ? "bankName" : "transactionId"] || ""}
                      onChange={(e) => setNewPO({ 
                        ...newPO, 
                        [newPO.paymentType === "Cheque" ? "bankName" : "transactionId"]: e.target.value 
                      })}
                      placeholder={newPO.paymentType === "Cheque" ? "Enter bank name" : "Enter transaction ID"}
                    />
                  </div>
                </div>
              )}
              
              {(newPO.paymentType === "Bank Transfer" || newPO.paymentType === "Cheque") && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Bank Reference</Label>
                    <Input
                      value={newPO.bankReference || ""}
                      onChange={(e) => setNewPO({ ...newPO, bankReference: e.target.value })}
                      placeholder="Enter bank reference number"
                    />
                  </div>
                </div>
              )}
              
              {/* Card-related fields - shown only for Card payments */}
              {newPO.paymentType === "Card" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Card Number</Label>
                    <Input
                      value={newPO.cardNumber || ""}
                      onChange={(e) => setNewPO({ ...newPO, cardNumber: e.target.value })}
                      placeholder="Enter card number"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9\s]{13,23}"
                    />
                  </div>
                  <div>
                    <Label>Card Holder Name</Label>
                    <Input
                      value={newPO.cardHolderName || ""}
                      onChange={(e) => setNewPO({ ...newPO, cardHolderName: e.target.value })}
                      placeholder="Enter card holder name"
                    />
                  </div>
                </div>
              )}
              
              {newPO.paymentType === "Card" && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Expiry Date</Label>
                    <Input
                      value={newPO.cardExpiry || ""}
                      onChange={(e) => setNewPO({ ...newPO, cardExpiry: e.target.value })}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label>CVV</Label>
                    <Input
                      value={newPO.cardCVV || ""}
                      onChange={(e) => setNewPO({ ...newPO, cardCVV: e.target.value })}
                      placeholder="CVV"
                      type="password"
                      maxLength={4}
                    />
                  </div>
                </div>
              )}
              
              <div>
                <Label>Notes</Label>
                <Input
                  value={newPO.notes}
                  onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>

              {/* Summary */}
              {lineItems.length > 0 && (
                <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {newPO.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax ({newPO.tax}%):</span>
                      <span className="font-semibold">₹{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button onClick={handleCreatePO} className="w-full" disabled={lineItems.length === 0}>
                <Package className="w-4 h-4 mr-2" />
                Create Purchase Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">In Transit</span>
          </div>
          <p className="text-2xl font-bold font-heading text-foreground">{inTransit}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-2xl font-bold font-heading text-foreground">₹{typeof totalAmount === 'number' ? totalAmount.toLocaleString() : '0'}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground">Pending Payments</p>
          <p className="text-2xl font-bold font-heading text-warning">₹{typeof pendingPayments === 'number' ? pendingPayments.toLocaleString() : '0'}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold font-heading text-foreground">{purchaseOrders.length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground">Avg Order</p>
          <p className="text-2xl font-bold font-heading text-foreground">₹{avgOrderValue.toFixed(2)}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground">Payment Rate</p>
          <p className="text-2xl font-bold font-heading text-foreground">{purchaseOrders.length > 0 ? Math.round((paidOrders / purchaseOrders.length) * 100) : 0}%</p>
        </div>
      </div>
      
      {/* Supplier Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <h3 className="font-semibold mb-3">Top Suppliers</h3>
          <div className="space-y-2">
            {topSuppliers.map((supplier, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{supplier.name}</span>
                <span className="text-sm font-medium">₹{supplier.amount.toLocaleString()}</span>
              </div>
            ))}
            {topSuppliers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">No supplier data available</p>
            )}
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <h3 className="font-semibold mb-3">Order Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Pending</span>
              <span className="text-sm font-medium">{purchaseOrders.filter(p => p.status === "Pending").length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Approved</span>
              <span className="text-sm font-medium">{purchaseOrders.filter(p => p.status === "Approved").length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Received</span>
              <span className="text-sm font-medium">{receivedOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-destructive">Cancelled</span>
              <span className="text-sm font-medium text-destructive">{cancelledOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search orders or suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Date Range
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead>Order ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Payment</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No purchase orders found. Create your first PO!
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-secondary/30">
                    <TableCell className="font-mono text-sm">{order.poNumber}</TableCell>
                    <TableCell className="font-medium">{typeof order.supplier === 'string' ? order.supplier : 'N/A'}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {order.orderDate}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{typeof order.items === 'number' ? order.items : 0}</TableCell>
                    <TableCell className="font-semibold">₹{typeof order.total === 'number' ? order.total.toLocaleString() : '0'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusClasses[order.status as keyof typeof statusClasses] || statusClasses.Pending
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          paymentClasses[order.payment as keyof typeof paymentClasses] || paymentClasses.Unpaid
                        }`}
                      >
                        {order.payment}
                      </span>
                    </TableCell>
                    <TableCell className="text-right flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          setPoData(order);
                          setShowPO(true);
                        }}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <div className="relative">
                        {editingStatusId === order.id ? (
                          <div className="flex gap-1">
                            <Select value={newStatus} onValueChange={(v: "Pending" | "Approved" | "Received" | "Cancelled") => setNewStatus(v)}>
                              <SelectTrigger className="w-28">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Received">Received</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="sm" onClick={async () => {
                              if (newStatus) {
                                try {
                                  await update(order.id, { status: newStatus });
                                  toast({ title: "Status updated successfully" });
                                  setEditingStatusId(null);
                                  setNewStatus(undefined);
                                } catch (error) {
                                  toast({ title: "Error updating status", variant: "destructive" });
                                }
                              }
                            }}>
                              <CheckCircle2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingStatusId(null);
                              setNewStatus(undefined);
                            }}>
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingStatusId(order.id);
                            setNewStatus(order.status);
                          }}>
                            <Settings className="w-3 h-3" />
                            Status
                          </Button>
                        )}
                      </div>
                      <div className="relative">
                        {editingPaymentId === order.id ? (
                          <div className="flex gap-1">
                            <Select value={newPaymentStatus} onValueChange={(v: "Paid" | "Unpaid" | "Partial") => setNewPaymentStatus(v)}>
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="Select payment" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Unpaid">Unpaid</SelectItem>
                                <SelectItem value="Partial">Partial</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                              </SelectContent>
                            </Select>
                            {newPaymentStatus === "Partial" && (
                              <Input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                                placeholder="Amount"
                                className="w-20"
                              />
                            )}
                            <Button size="sm" onClick={async () => {
                              if (newPaymentStatus) {
                                try {
                                  const updateData: { payment: "Paid" | "Unpaid" | "Partial"; paymentAmount?: number } = { payment: newPaymentStatus };
                                  if (newPaymentStatus === "Partial" && paymentAmount > 0) {
                                    updateData.paymentAmount = paymentAmount;
                                  }
                                  await update(order.id, updateData);
                                  toast({ title: "Payment status updated successfully" });
                                  setEditingPaymentId(null);
                                  setNewPaymentStatus(undefined);
                                  setPaymentAmount(0);
                                } catch (error) {
                                  toast({ title: "Error updating payment status", variant: "destructive" });
                                }
                              }
                            }}>
                              <CheckCircle2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingPaymentId(null);
                              setNewPaymentStatus(undefined);
                              setPaymentAmount(0);
                            }}>
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingPaymentId(order.id);
                            setNewPaymentStatus(order.payment);
                          }}>
                            <Settings className="w-3 h-3" />
                            Payment
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Purchase Order Generator */}
      {poData && (
        <InvoiceGenerator
          open={showPO}
          onClose={() => setShowPO(false)}
          type="purchase"
          data={poData}
        />
      )}
    </div>
  );
}




