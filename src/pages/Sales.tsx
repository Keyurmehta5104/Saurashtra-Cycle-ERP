import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Calendar, 
  Eye, 
  Loader2, 
  FileText, 
  X, 
  ShoppingCart,
  Settings,
  CheckCircle2,
  XCircle
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { COLLECTIONS } from "@/lib/firebaseCollections";
import { SaleOrder } from "@/types/firebase";
import { useToast } from "@/hooks/use-toast";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { createSaleWithStockUpdate, cancelSaleWithStockRestore } from "@/lib/saleTransaction";
import { useAuth } from "@/contexts/AuthContext";
import { getNextNumber } from "@/lib/autoInvoiceNumber";

// Define missing types
interface LineItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

const paymentVariants = {
  Paid: "success",
  Pending: "destructive",
  Partial: "warning",
} as const;

const statusVariants = {
  Delivered: "default",
  Processing: "secondary",
  Shipped: "outline",
  Cancelled: "destructive",
} as const;

export default function Sales() {
  const { user, isStaff } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);

  useEffect(() => {
    if (location.pathname === "/sales/new") {
      setIsAddOpen(true);
    }
  }, [location.pathname]);

  // Auto-generate invoice number each time the dialog opens
  useEffect(() => {
    if (isAddOpen) {
      setIsGeneratingNumber(true);
      getNextNumber("invoice")
        .then((num) => {
          setNewSale((prev) => ({ ...prev, invoiceNo: num }));
        })
        .catch((err) => {
          console.error("Failed to generate invoice number:", err);
        })
        .finally(() => setIsGeneratingNumber(false));
    }
  }, [isAddOpen]);
  
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [invoiceData, setInvoiceData] = useState<SaleOrder | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  
  // Status update state
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<"Delivered" | "Processing" | "Shipped" | "Cancelled">();
  
  // Payment update state
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState<"Paid" | "Pending" | "Partial">();
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  
  const [newSale, setNewSale] = useState<{
    customer: string;
    customerPhone: string;
    date: string;
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
    payment: "Paid" | "Pending" | "Partial";
    paymentType?: "Cash" | "UPI" | "Card" | "Bank Transfer" | "Cheque" | "Other";
    status: "Delivered" | "Processing" | "Shipped" | "Cancelled";
    discount: number;
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
    customer: "",
    customerPhone: "",
    date: "",
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
    payment: "Pending",
    status: "Processing",
    discount: 0,
    tax: 0,
    notes: "",
  });

  const { data: salesData, loading: salesLoading, update } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);
  const { data: inventoryData, loading: inventoryLoading } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);
  const { toast } = useToast();
  const { user } = useAuth();

  const loading = salesLoading || inventoryLoading;

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * newSale.tax) / 100;
  const total = subtotal + taxAmount - newSale.discount;

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
    if (quantity > product.stock) {
      toast({ title: `Only ${product.stock} units available`, variant: "destructive" });
      return;
    }

    const lineItem: LineItem = {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity,
      unitPrice: product.price,
      total: quantity * product.price,
    };

    setLineItems([...lineItems, lineItem]);
    setSelectedProduct("");
    setQuantity(1);
  };

  const handleRemoveProduct = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleCreateSale = async () => {
    if (!newSale.customer) {
      toast({ title: "Customer name is required", variant: "destructive" });
      return;
    }
    if (lineItems.length === 0) {
      toast({ title: "Add at least one product", variant: "destructive" });
      return;
    }

    try {
      const saleOrder: Omit<SaleOrder, "id"> = {
        orderId: `SO-${Date.now()}`,
        customerName: newSale.customer,
        customerPhone: newSale.customerPhone,
        date: newSale.date || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        invoiceNo: newSale.invoiceNo,
        bookNo: newSale.bookNo,
        partyGstin: newSale.partyGstin,
        brand: newSale.brand,
        model: newSale.model,
        colour: newSale.colour,
        size: newSale.size,
        frameNo: newSale.frameNo,
        seat: newSale.seat,
        carrier: newSale.carrier,
        standDoubleSide: newSale.standDoubleSide,
        lock: newSale.lock,
        chainCover: newSale.chainCover,
        items: lineItems.reduce((sum, item) => sum + item.quantity, 0),
        lineItems,
        subtotal,
        tax: taxAmount,
        discount: newSale.discount,
        grandTotal: total,
        payment: newSale.payment,
        paymentType: newSale.paymentType,
        status: newSale.status,
        notes: newSale.notes,
        bankName: newSale.bankName,
        transactionId: newSale.transactionId,
        chequeNumber: newSale.chequeNumber,
        bankReference: newSale.bankReference,
        cardNumber: newSale.cardNumber,
        cardExpiry: newSale.cardExpiry,
        cardCVV: newSale.cardCVV,
        cardHolderName: newSale.cardHolderName,
      };

      // Atomic: creates sale + deducts stock in one Firestore batch
      const saleId = await createSaleWithStockUpdate(
        saleOrder,
        lineItems,
        user?.uid ?? "system"
      );

      // Show invoice with real Firestore document ID
      setInvoiceData({ ...saleOrder, id: saleId } as SaleOrder);
      setShowInvoice(true);
      
      // Reset form
      setIsAddOpen(false);
      setLineItems([]);
      setNewSale({
        customer: "",
        customerPhone: "",
        date: "",
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
        payment: "Pending",
        paymentType: undefined,
        status: "Processing",
        discount: 0,
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
      toast({ title: "Sale created successfully" });
    } catch (error) {
      console.error("Error creating sale:", error);
      toast({ title: "Error creating sale", variant: "destructive" });
    }
  };

  const filteredData = salesData.filter(
    (item) =>
      (item.customerName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (item.orderId?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const totalSales = salesData.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  const pendingAmount = salesData.filter(s => s.payment !== "Paid").reduce((acc, s) => acc + (s.grandTotal || 0), 0);
  
  // Additional ERP metrics
  const avgOrderValue = salesData.length > 0 ? totalSales / salesData.length : 0;
  const completedOrders = salesData.filter(s => s.status === "Delivered").length;
  const cancelledOrders = salesData.filter(s => s.status === "Cancelled").length;
  const paidOrders = salesData.filter(s => s.payment === "Paid").length;
  
  // Top customers by purchase amount
  const customerSalesMap = salesData.reduce((acc, sale) => {
    const customerName = typeof sale.customerName === 'string' ? sale.customerName : 'Unknown';
    acc[customerName] = (acc[customerName] || 0) + (sale.grandTotal || 0);
    return acc;
  }, {} as Record<string, number>);
  
  const topCustomers = Object.entries(customerSalesMap)
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
          <h1 className="page-title text-foreground">Sales Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all sales transactions
          </p>
        </div>
        {isStaff && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Sale Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
              {/* Bill and Party Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Book No.</Label>
                  <Input
                    value={newSale.bookNo}
                    onChange={(e) => setNewSale({ ...newSale, bookNo: e.target.value })}
                    placeholder="e.g. 43"
                  />
                </div>
                <div>
                  <Label>Invoice No.</Label>
                  <div className="relative">
                    <Input
                      value={newSale.invoiceNo}
                      readOnly
                      className="bg-secondary/50 font-mono font-semibold text-primary cursor-default"
                      placeholder={isGeneratingNumber ? "Generating..." : "INV-XXXX"}
                    />
                    {isGeneratingNumber && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div>
                  <Label>Invoice Date</Label>
                  <Input
                    type="date"
                    value={newSale.date}
                    onChange={(e) => setNewSale({ ...newSale, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Party GSTIN</Label>
                  <Input
                    value={newSale.partyGstin}
                    onChange={(e) => setNewSale({ ...newSale, partyGstin: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name *</Label>
                  <Input
                    value={newSale.customer}
                    onChange={(e) => setNewSale({ ...newSale, customer: e.target.value })}
                    placeholder="ABC"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newSale.customerPhone}
                    onChange={(e) => setNewSale({ ...newSale, customerPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Cycle Particulars (bill format) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label>Brand</Label>
                  <Input value={newSale.brand} onChange={(e) => setNewSale({ ...newSale, brand: e.target.value })} placeholder="EM" />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input value={newSale.model} onChange={(e) => setNewSale({ ...newSale, model: e.target.value })} placeholder="Sondel 13" />
                </div>
                <div>
                  <Label>Colour</Label>
                  <Input value={newSale.colour} onChange={(e) => setNewSale({ ...newSale, colour: e.target.value })} placeholder="Black" />
                </div>
                <div>
                  <Label>Size</Label>
                  <Input value={newSale.size} onChange={(e) => setNewSale({ ...newSale, size: e.target.value })} placeholder="-" />
                </div>
                <div>
                  <Label>Frame No.</Label>
                  <Input value={newSale.frameNo} onChange={(e) => setNewSale({ ...newSale, frameNo: e.target.value })} placeholder="Frame number" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label>Seat</Label>
                  <Input value={newSale.seat} onChange={(e) => setNewSale({ ...newSale, seat: e.target.value })} placeholder="Yes/No" />
                </div>
                <div>
                  <Label>Carrier</Label>
                  <Input value={newSale.carrier} onChange={(e) => setNewSale({ ...newSale, carrier: e.target.value })} placeholder="Yes/No" />
                </div>
                <div>
                  <Label>Stand Double/Side</Label>
                  <Input value={newSale.standDoubleSide} onChange={(e) => setNewSale({ ...newSale, standDoubleSide: e.target.value })} placeholder="Yes/No" />
                </div>
                <div>
                  <Label>Lock</Label>
                  <Input value={newSale.lock} onChange={(e) => setNewSale({ ...newSale, lock: e.target.value })} placeholder="Yes/No" />
                </div>
                <div>
                  <Label>Chain Cover</Label>
                  <Input value={newSale.chainCover} onChange={(e) => setNewSale({ ...newSale, chainCover: e.target.value })} placeholder="Yes/No" />
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-3 border border-border/50 rounded-lg p-4 bg-secondary/20">
                <Label>Add Products</Label>
                <div className="flex gap-2">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryData
                        .filter(p => p.stock > 0)
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ₹{product.price} (Stock: {product.stock})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-24"
                    placeholder="Qty"
                  />
                  <Button type="button" onClick={handleAddProduct} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
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
                        <TableHead className="text-right">Price</TableHead>
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
                          <TableCell className="text-right">₹{item.unitPrice}</TableCell>
                          <TableCell className="text-right font-semibold">₹{item.total}</TableCell>
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

              {/* Totals & Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tax (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newSale.tax}
                    onChange={(e) => setNewSale({ ...newSale, tax: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Discount (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newSale.discount}
                    onChange={(e) => setNewSale({ ...newSale, discount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Status</Label>
                  <Select value={newSale.payment} onValueChange={(v: "Paid" | "Pending" | "Partial") => setNewSale({ ...newSale, payment: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Order Status</Label>
                  <Select value={newSale.status} onValueChange={(v: "Delivered" | "Processing" | "Shipped" | "Cancelled") => setNewSale({ ...newSale, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Type</Label>
                  <Select value={newSale.paymentType || ""} onValueChange={(v: "Cash" | "UPI" | "Card" | "Bank Transfer" | "Cheque" | "Other" | "") => {
                    setNewSale({ 
                      ...newSale, 
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
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Bank-related fields - shown only for Bank Transfer and Cheque */}
              {(newSale.paymentType === "Bank Transfer" || newSale.paymentType === "Cheque") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{newSale.paymentType === "Cheque" ? "Cheque Number" : "Bank Name"}</Label>
                    <Input
                      value={newSale[newSale.paymentType === "Cheque" ? "chequeNumber" : "bankName"] || ""}
                      onChange={(e) => setNewSale({ 
                        ...newSale, 
                        [newSale.paymentType === "Cheque" ? "chequeNumber" : "bankName"]: e.target.value 
                      })}
                      placeholder={newSale.paymentType === "Cheque" ? "Enter cheque number" : "Enter bank name"}
                    />
                  </div>
                  <div>
                    <Label>{newSale.paymentType === "Cheque" ? "Bank Name" : "Transaction ID"}</Label>
                    <Input
                      value={newSale[newSale.paymentType === "Cheque" ? "bankName" : "transactionId"] || ""}
                      onChange={(e) => setNewSale({ 
                        ...newSale, 
                        [newSale.paymentType === "Cheque" ? "bankName" : "transactionId"]: e.target.value 
                      })}
                      placeholder={newSale.paymentType === "Cheque" ? "Enter bank name" : "Enter transaction ID"}
                    />
                  </div>
                </div>
              )}
              
              {(newSale.paymentType === "Bank Transfer" || newSale.paymentType === "Cheque") && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>Bank Reference</Label>
                    <Input
                      value={newSale.bankReference || ""}
                      onChange={(e) => setNewSale({ ...newSale, bankReference: e.target.value })}
                      placeholder="Enter bank reference number"
                    />
                  </div>
                </div>
              )}
              
              {/* Card-related fields - shown only for Card payments */}
              {newSale.paymentType === "Card" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Card Number</Label>
                    <Input
                      value={newSale.cardNumber || ""}
                      onChange={(e) => setNewSale({ ...newSale, cardNumber: e.target.value })}
                      placeholder="Enter card number"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9\s]{13,23}"
                    />
                  </div>
                  <div>
                    <Label>Card Holder Name</Label>
                    <Input
                      value={newSale.cardHolderName || ""}
                      onChange={(e) => setNewSale({ ...newSale, cardHolderName: e.target.value })}
                      placeholder="Enter card holder name"
                    />
                  </div>
                </div>
              )}
              
              {newSale.paymentType === "Card" && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Expiry Date</Label>
                    <Input
                      value={newSale.cardExpiry || ""}
                      onChange={(e) => setNewSale({ ...newSale, cardExpiry: e.target.value })}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label>CVV</Label>
                    <Input
                      value={newSale.cardCVV || ""}
                      onChange={(e) => setNewSale({ ...newSale, cardCVV: e.target.value })}
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
                  value={newSale.notes}
                  onChange={(e) => setNewSale({ ...newSale, notes: e.target.value })}
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
                  {newSale.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax ({newSale.tax}%):</span>
                      <span className="font-semibold">₹{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {newSale.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">-₹{newSale.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button onClick={handleCreateSale} className="w-full" disabled={lineItems.length === 0}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Create Sale Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="metric-card">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-foreground">₹{(totalSales || 0).toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Orders</p>
          <p className="text-2xl font-bold text-foreground">{salesData.length}</p>
        </div>
        <div className="metric-card border-l-4 border-l-destructive">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Pending Amount</p>
          <p className="text-2xl font-bold text-destructive">₹{pendingAmount.toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Delivered</p>
          <p className="text-2xl font-bold text-foreground">{completedOrders}</p>
        </div>
        <div className="metric-card">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Avg Order</p>
          <p className="text-2xl font-bold text-foreground">₹{avgOrderValue.toFixed(2)}</p>
        </div>
        <div className="metric-card">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Payment Rate</p>
          <p className="text-2xl font-bold text-foreground">{salesData.length > 0 ? Math.round((paidOrders / salesData.length) * 100) : 0}%</p>
        </div>
      </div>
      
      {/* Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <h3 className="font-semibold mb-3">Top Customers</h3>
          <div className="space-y-2">
            {topCustomers.map((customer, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{customer.name}</span>
                <span className="text-sm font-medium">₹{customer.amount.toLocaleString()}</span>
              </div>
            ))}
            {topCustomers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">No customer data available</p>
            )}
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <h3 className="font-semibold mb-3">Order Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Processing</span>
              <span className="text-sm font-medium">{salesData.filter(s => s.status === "Processing").length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Shipped</span>
              <span className="text-sm font-medium">{salesData.filter(s => s.status === "Shipped").length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Delivered</span>
              <span className="text-sm font-medium">{completedOrders}</span>
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
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 input-enhanced"
          />
        </div>
        <Button variant="outline" className="btn-secondary h-10">
          <Calendar className="w-4 h-4 mr-2" />
          Date Range
        </Button>
      </div>

      {/* Table */}
      <div className="card-enhanced">
        <div className="overflow-x-auto">
          <Table className="table-enhanced">
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No sales found. Create your first sale!
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-secondary/30">
                    <TableCell className="font-mono text-sm">{item.orderId}</TableCell>
                    <TableCell className="font-medium">{typeof item.customerName === 'string' ? item.customerName : 'N/A'}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {item.date}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{typeof item.items === 'number' ? item.items : 0}</TableCell>
                    <TableCell className="font-semibold">₹{typeof item.grandTotal === 'number' ? item.grandTotal.toLocaleString() : '0'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={paymentVariants[item.payment as keyof typeof paymentVariants] || "default"}
                      >
                        {item.payment}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={statusVariants[item.status as keyof typeof statusVariants] || "default"}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          setInvoiceData(item);
                          setShowInvoice(true);
                        }}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <div className="relative">
                        {editingStatusId === item.id ? (
                          <div className="flex gap-1">
                            <Select value={newStatus} onValueChange={(v: "Delivered" | "Processing" | "Shipped" | "Cancelled") => setNewStatus(v)}>
                              <SelectTrigger className="w-28">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Processing">Processing</SelectItem>
                                <SelectItem value="Shipped">Shipped</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="sm" onClick={async () => {
                              if (newStatus) {
                                try {
                                  if (newStatus === "Cancelled" && item.lineItems && item.lineItems.length > 0) {
                                    // Atomic: restore stock + mark cancelled in one batch
                                    await cancelSaleWithStockRestore(
                                      item.id,
                                      item.lineItems,
                                      "Cancelled by user",
                                      user?.uid ?? "system"
                                    );
                                  } else {
                                    await update(item.id, { status: newStatus });
                                  }
                                  toast({ title: newStatus === "Cancelled" ? "Sale cancelled & stock restored" : "Status updated successfully" });
                                  setEditingStatusId(null);
                                  setNewStatus(undefined);
                                } catch (error) {
                                  console.error("Status update error:", error);
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
                            setEditingStatusId(item.id);
                            setNewStatus(item.status);
                          }}>
                            <Settings className="w-3 h-3" />
                            Status
                          </Button>
                        )}
                      </div>
                      <div className="relative">
                        {editingPaymentId === item.id ? (
                          <div className="flex gap-1">
                            <Select value={newPaymentStatus} onValueChange={(v: "Paid" | "Pending" | "Partial") => setNewPaymentStatus(v)}>
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="Select payment" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
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
                                  const updateData: { payment: "Paid" | "Pending" | "Partial"; paymentAmount?: number } = { payment: newPaymentStatus };
                                  if (newPaymentStatus === "Partial" && paymentAmount > 0) {
                                    updateData.paymentAmount = paymentAmount;
                                  }
                                  await update(item.id, updateData);
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
                            setEditingPaymentId(item.id);
                            setNewPaymentStatus(item.payment);
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

      {/* Invoice Generator */}
      {invoiceData && (
        <InvoiceGenerator
          open={showInvoice}
          onClose={() => setShowInvoice(false)}
          type="sales"
          data={invoiceData}
        />
      )}
    </div>
  );
}



