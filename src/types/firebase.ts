import { Timestamp } from "firebase/firestore";

export interface BaseDocument {
  id: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface InventoryItem extends BaseDocument {
  sku: string;
  name: string;
  category: string;
  brand: string;
  model?: string;
  color?: string;
  size?: string;
  stock: number;
  price: number;
  cost?: number; // Purchase cost
  reorderLevel?: number; // Minimum stock level before reorder
  supplier?: string;
  supplierContact?: string;
  warrantyPeriod?: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  description?: string;
}

export interface LineItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SaleOrder extends BaseDocument {
  orderId: string;
  customerName: string;
  customerPhone?: string;
  customerId?: string;
  date: string;
  items: number; // Total item count
  lineItems?: LineItem[]; // Detailed line items
  subtotal: number;
  tax?: number;
  discount?: number;
  grandTotal: number;
  payment: "Paid" | "Pending" | "Partial";
  paymentType?: "Cash" | "UPI" | "Card" | "Bank Transfer" | "Cheque" | "Other";
  status: "Delivered" | "Processing" | "Shipped" | "Cancelled";
  notes?: string;
  invoiceNo?: string;
  bookNo?: string;
  partyGstin?: string;
  brand?: string;
  model?: string;
  colour?: string;
  size?: string;
  frameNo?: string;
  seat?: string;
  carrier?: string;
  standDoubleSide?: string;
  lock?: string;
  chainCover?: string;
  bankName?: string;
  transactionId?: string;
  chequeNumber?: string;
  bankReference?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCVV?: string;
  cardHolderName?: string;
  amountPaid?: number;
  paymentHistory?: {
    date: string;
    amount: number;
    method: string;
    notes?: string;
  }[];
  // Cancellation fields
  cancelReason?: string;
  cancelledAt?: Timestamp;
}

export interface PurchaseOrder extends BaseDocument {
  poNumber: string;
  supplier: string;
  supplierPhone?: string;
  orderDate: string;
  expectedDate: string;
  invoiceNo?: string;
  bookNo?: string;
  partyGstin?: string;
  brand?: string;
  model?: string;
  colour?: string;
  size?: string;
  frameNo?: string;
  seat?: string;
  carrier?: string;
  standDoubleSide?: string;
  lock?: string;
  chainCover?: string;
  items: number; // Total item count
  lineItems?: LineItem[]; // Detailed line items
  subtotal: number;
  tax?: number;
  total: number;
  status: "Pending" | "Approved" | "Received" | "Cancelled";
  payment: "Paid" | "Unpaid" | "Partial";
  paymentType?: "Cash" | "UPI" | "Card" | "Bank Transfer" | "Cheque" | "Credit" | "Other";
  notes?: string;
  bankName?: string;
  transactionId?: string;
  chequeNumber?: string;
  bankReference?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCVV?: string;
  cardHolderName?: string;
}

export interface Customer extends BaseDocument {
  name: string;
  email: string;
  phone: string;
  address: string;
  type: "Premium" | "Regular" | "New";
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastOrder: string;
  avatar?: string;
}

export interface ServiceJob extends BaseDocument {
  jobId: string;
  customer: string;
  phone: string;
  cycle: string;
  issue: string;
  receivedDate: string;
  expectedDate: string;
  status: "Pending" | "In Progress" | "Completed" | "Awaiting Parts";
  priority: "High" | "Medium" | "Low";
  estimatedCost: number;
  technician: string;
  payment?: "Paid" | "Unpaid" | "Partial";
  amountPaid?: number;
  actualCost?: number;
  partsUsed?: string;
  deliveredDate?: string;
  completionNotes?: string;
  paymentType?: "Cash" | "UPI" | "Card" | "Bank Transfer" | "Cheque" | "Credit" | "Other";
}

export interface Invoice extends BaseDocument {
  invoiceNumber: string;
  customer: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue" | "Draft";
}

export interface User extends BaseDocument {
  email: string;
  displayName: string;
  role: 'admin' | 'employee' | 'customer';
  approved: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export interface StockLedgerEntry extends BaseDocument {
  productId: string;
  productName: string;
  sku: string;
  changeType: "sale" | "purchase" | "sale_return" | "purchase_received" | "manual_adjustment";
  quantity: number;          // positive = added, negative = removed
  stockBefore: number;
  stockAfter: number;
  referenceId: string;       // sale ID or purchase order ID
  referenceType: "sale" | "sale_cancel" | "purchase_received" | "manual";
  notes?: string;
  changedBy: string;         // user ID
  date: Timestamp;
}

