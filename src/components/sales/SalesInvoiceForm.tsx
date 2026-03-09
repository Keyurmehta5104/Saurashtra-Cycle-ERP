import { useState } from "react";
import { X, Plus } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { COLLECTIONS } from "@/lib/firebaseCollections";
import { InventoryItem, LineItem, SaleOrder } from "@/types/firebase";

interface SalesInvoiceFormProps {
  onSubmit: (sale: Omit<SaleOrder, "id">) => void;
  onCancel: () => void;
}

export function SalesInvoiceForm({ onSubmit, onCancel }: SalesInvoiceFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [bookNo, setBookNo] = useState("");
  const [payment, setPayment] = useState<"Paid" | "Pending" | "Partial">("Pending");
  const [paymentType, setPaymentType] = useState<"Cash" | "UPI" | "Card" | "Bank Transfer" | "Cheque" | "Other" | undefined>();
  const [status, setStatus] = useState<"Delivered" | "Processing" | "Shipped" | "Cancelled">("Processing");
  const [notes, setNotes] = useState("");
  
  // Bank-related fields
  const [bankName, setBankName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [bankReference, setBankReference] = useState("");
  
  // Card-related fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  const { data: inventoryData } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * tax) / 100;
  const total = subtotal + taxAmount - discount;

  const handleAddProduct = () => {
    const product = inventoryData.find(p => p.id === selectedProduct);
    if (!product) {
      alert("Please select a product");
      return;
    }
    if (quantity <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }
    if (quantity > product.stock) {
      alert(`Only ${product.stock} units available`);
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

  const handlePaymentTypeChange = (type: "Cash" | "UPI" | "Card" | "Bank Transfer" | "Cheque" | "Other" | "") => {
    setPaymentType(type || undefined);
    // Reset all payment-related fields when payment type changes
    setBankName("");
    setTransactionId("");
    setChequeNumber("");
    setBankReference("");
    setCardNumber("");
    setCardExpiry("");
    setCardCVV("");
    setCardHolderName("");
  };

  const handleSubmit = () => {
    if (!customerName) {
      alert("Customer name is required");
      return;
    }
    if (lineItems.length === 0) {
      alert("Add at least one product");
      return;
    }

    const saleOrder: Omit<SaleOrder, "id"> = {
      orderId: `SO-${Date.now()}`,
      customerName,
      customerPhone,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      items: lineItems.reduce((sum, item) => sum + item.quantity, 0),
      lineItems,
      subtotal,
      tax: taxAmount,
      discount,
      grandTotal: total,
      payment,
      paymentType,
      status,
      notes,
      invoiceNo: invoiceNo || undefined,
      bookNo: bookNo || undefined,
      bankName: bankName || undefined,
      transactionId: transactionId || undefined,
      chequeNumber: chequeNumber || undefined,
      bankReference: bankReference || undefined,
      cardNumber: cardNumber || undefined,
      cardExpiry: cardExpiry || undefined,
      cardCVV: cardCVV || undefined,
      cardHolderName: cardHolderName || undefined,
    };

    onSubmit(saleOrder);
  };

  return (
    <div className="space-y-6">
      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Customer Name *</Label>
          <Input 
            value={customerName} 
            onChange={(e) => setCustomerName(e.target.value)} 
            placeholder="John Doe"
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input 
            value={customerPhone} 
            onChange={(e) => setCustomerPhone(e.target.value)} 
            placeholder="+91 98765 43210"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Invoice No.</Label>
          <Input 
            value={invoiceNo} 
            onChange={(e) => setInvoiceNo(e.target.value)} 
            placeholder="INV-001"
          />
        </div>
        <div>
          <Label>Book No.</Label>
          <Input 
            value={bookNo} 
            onChange={(e) => setBookNo(e.target.value)} 
            placeholder="Book 1"
          />
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
            value={tax}
            onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label>Discount (₹)</Label>
          <Input
            type="number"
            min="0"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Payment Status</Label>
          <Select value={payment} onValueChange={(v: "Paid" | "Pending" | "Partial") => setPayment(v)}>
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
          <Select value={status} onValueChange={(v: "Delivered" | "Processing" | "Shipped" | "Cancelled") => setStatus(v)}>
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
          <Select value={paymentType || ""} onValueChange={handlePaymentTypeChange}>
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
      {(paymentType === "Bank Transfer" || paymentType === "Cheque") && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{paymentType === "Cheque" ? "Cheque Number" : "Bank Name"}</Label>
            <Input
              value={paymentType === "Cheque" ? chequeNumber : bankName}
              onChange={(e) => paymentType === "Cheque" ? setChequeNumber(e.target.value) : setBankName(e.target.value)}
              placeholder={paymentType === "Cheque" ? "Enter cheque number" : "Enter bank name"}
            />
          </div>
          <div>
            <Label>{paymentType === "Cheque" ? "Bank Name" : "Transaction ID"}</Label>
            <Input
              value={paymentType === "Cheque" ? bankName : transactionId}
              onChange={(e) => paymentType === "Cheque" ? setBankName(e.target.value) : setTransactionId(e.target.value)}
              placeholder={paymentType === "Cheque" ? "Enter bank name" : "Enter transaction ID"}
            />
          </div>
        </div>
      )}

      {(paymentType === "Bank Transfer" || paymentType === "Cheque") && (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>Bank Reference</Label>
            <Input
              value={bankReference}
              onChange={(e) => setBankReference(e.target.value)}
              placeholder="Enter bank reference number"
            />
          </div>
        </div>
      )}

      {/* Card-related fields - shown only for Card payments */}
      {paymentType === "Card" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Card Number</Label>
            <Input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="Enter card number"
              type="text"
              inputMode="numeric"
              pattern="[0-9\s]{13,23}"
            />
          </div>
          <div>
            <Label>Card Holder Name</Label>
            <Input
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              placeholder="Enter card holder name"
            />
          </div>
        </div>
      )}

      {paymentType === "Card" && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Expiry Date</Label>
            <Input
              value={cardExpiry}
              onChange={(e) => setCardExpiry(e.target.value)}
              placeholder="MM/YY"
              maxLength={5}
            />
          </div>
          <div>
            <Label>CVV</Label>
            <Input
              value={cardCVV}
              onChange={(e) => setCardCVV(e.target.value)}
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
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax ({tax}%):</span>
              <span className="font-semibold">₹{taxAmount.toFixed(2)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>Discount:</span>
              <span className="font-semibold">-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
            <span>Total:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit}>
          Create Invoice
        </Button>
      </div>
    </div>
  );
}