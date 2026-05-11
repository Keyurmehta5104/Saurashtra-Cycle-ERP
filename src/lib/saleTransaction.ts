import {
  writeBatch,
  doc,
  collection,
  increment,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS } from "./firebaseCollections";
import { SaleOrder, LineItem } from "@/types/firebase";

/**
 * Creates a sale AND atomically reduces inventory stock for each sold item.
 * Uses Firestore batch write so either ALL operations succeed or NONE do.
 *
 * Also logs each stock movement to the stockLedger collection for audit trail.
 *
 * @returns The Firestore document ID of the created sale.
 * @throws If any product has insufficient stock.
 */
export async function createSaleWithStockUpdate(
  saleData: Omit<SaleOrder, "id">,
  lineItems: LineItem[],
  createdBy: string = "system"
): Promise<string> {
  // ── 1. Pre-flight stock check ────────────────────────────────────────────
  // Read every product first so we can give a clear error before touching DB
  for (const item of lineItems) {
    const productRef = doc(db, COLLECTIONS.INVENTORY, item.productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      throw new Error(`Product not found: ${item.productName}`);
    }

    const currentStock = productSnap.data().stock ?? 0;
    if (currentStock < item.quantity) {
      throw new Error(
        `Insufficient stock for "${item.productName}". Available: ${currentStock}, Requested: ${item.quantity}`
      );
    }
  }

  // ── 2. Build batch ───────────────────────────────────────────────────────
  const batch = writeBatch(db);

  // 2a. Create the sale document
  const saleRef = doc(collection(db, COLLECTIONS.SALES));
  batch.set(saleRef, {
    ...saleData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // 2b. Reduce stock + update status for each line item
  for (const item of lineItems) {
    const productRef = doc(db, COLLECTIONS.INVENTORY, item.productId);
    const productSnap = await getDoc(productRef);
    const currentStock = productSnap.data()!.stock ?? 0;
    const newStock = currentStock - item.quantity;
    const reorderLevel = productSnap.data()!.reorderLevel ?? 10;

    // Determine new status
    let newStatus: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
    if (newStock === 0) newStatus = "Out of Stock";
    else if (newStock < reorderLevel) newStatus = "Low Stock";

    batch.update(productRef, {
      stock: increment(-item.quantity),
      status: newStatus,
      updatedAt: Timestamp.now(),
    });

    // 2c. Log this stock movement to stockLedger
    const ledgerRef = doc(collection(db, COLLECTIONS.STOCK_LEDGER));
    batch.set(ledgerRef, {
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      changeType: "sale",
      quantity: -item.quantity,          // negative = stock went down
      stockBefore: currentStock,
      stockAfter: newStock,
      referenceId: saleRef.id,
      referenceType: "sale",
      notes: `Sale to ${saleData.customerName}`,
      changedBy: createdBy,
      date: Timestamp.now(),
    });
  }
  // 2d. Update Customer Loyalty Points and Spend
  if (saleData.customerId) {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, saleData.customerId);
    const pointsEarned = Math.floor(saleData.grandTotal / 100); // 1 point per ₹100
    
    batch.update(customerRef, {
      loyaltyPoints: increment(pointsEarned),
      totalSpent: increment(saleData.grandTotal),
      totalOrders: increment(1),
      lastOrder: saleData.date,
      updatedAt: Timestamp.now(),
    });
  }

  // ── 3. Commit ─────────────────────────────────────────────────────────────
  await batch.commit();

  return saleRef.id;
}

/**
 * Cancels a sale and restores inventory stock atomically.
 * Should only be called when sale status changes to "Cancelled".
 */
export async function cancelSaleWithStockRestore(
  saleId: string,
  lineItems: LineItem[],
  cancelReason: string = "",
  cancelledBy: string = "system"
): Promise<void> {
  const batch = writeBatch(db);

  // Update sale status to Cancelled
  const saleRef = doc(db, COLLECTIONS.SALES, saleId);
  batch.update(saleRef, {
    status: "Cancelled",
    cancelReason,
    cancelledAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // Restore stock for each line item
  for (const item of lineItems) {
    const productRef = doc(db, COLLECTIONS.INVENTORY, item.productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) continue; // product may have been deleted

    const currentStock = productSnap.data().stock ?? 0;
    const newStock = currentStock + item.quantity;
    const reorderLevel = productSnap.data().reorderLevel ?? 10;

    let newStatus: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
    if (newStock === 0) newStatus = "Out of Stock";
    else if (newStock < reorderLevel) newStatus = "Low Stock";

    batch.update(productRef, {
      stock: increment(item.quantity),
      status: newStatus,
      updatedAt: Timestamp.now(),
    });

    // Log stock restoration
    const ledgerRef = doc(collection(db, COLLECTIONS.STOCK_LEDGER));
    batch.set(ledgerRef, {
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      changeType: "sale_return",
      quantity: item.quantity,           // positive = stock went up
      stockBefore: currentStock,
      stockAfter: newStock,
      referenceId: saleId,
      referenceType: "sale_cancel",
      notes: cancelReason || "Sale cancelled",
      changedBy: cancelledBy,
      date: Timestamp.now(),
    });
  }
  // 2d. Deduct Loyalty Points from Customer
  if (lineItems.length > 0) {
    // We need to find the sale to get the customerId and total
    const saleSnap = await getDoc(saleRef);
    if (saleSnap.exists()) {
      const saleData = saleSnap.data() as SaleOrder;
      if (saleData.customerId) {
        const customerRef = doc(db, COLLECTIONS.CUSTOMERS, saleData.customerId);
        const pointsToDeduct = Math.floor(saleData.grandTotal / 100);
        
        batch.update(customerRef, {
          loyaltyPoints: increment(-pointsToDeduct),
          totalSpent: increment(-saleData.grandTotal),
          totalOrders: increment(-1),
          updatedAt: Timestamp.now(),
        });
      }
    }
  }

  await batch.commit();
}
