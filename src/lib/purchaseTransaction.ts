import {
  writeBatch,
  doc,
  collection,
  increment,
  Timestamp,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS } from "./firebaseCollections";
import { PurchaseOrder, LineItem } from "@/types/firebase";

/**
 * Creates a purchase order in Firestore.
 * Stock is NOT updated here — stock increases only when status changes to "Received".
 *
 * @returns The Firestore document ID of the created PO.
 */
export async function createPurchaseOrder(
  poData: Omit<PurchaseOrder, "id">
): Promise<string> {
  const batch = writeBatch(db);

  const poRef = doc(collection(db, COLLECTIONS.PURCHASES));
  batch.set(poRef, {
    ...poData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  await batch.commit();
  return poRef.id;
}

/**
 * Marks a purchase order as "Received" and atomically increases inventory
 * stock for each product in the order.
 *
 * If a product from the PO doesn't exist in inventory yet, it does NOT
 * auto-create it (to avoid duplicate entries). A warning is logged instead.
 *
 * Also logs each stock movement to the stockLedger collection.
 *
 * @param orderId - Firestore document ID of the purchase order
 * @param lineItems - The line items from the purchase order
 * @param receivedBy - User ID of who marked it received
 */
export async function receivePurchaseWithStockUpdate(
  orderId: string,
  lineItems: LineItem[],
  receivedBy: string = "system"
): Promise<void> {
  // ── 1. Check order isn't already received ────────────────────────────────
  const orderRef = doc(db, COLLECTIONS.PURCHASES, orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    throw new Error("Purchase order not found");
  }

  const currentStatus = orderSnap.data().status;
  if (currentStatus === "Received") {
    throw new Error("This purchase order has already been marked as received");
  }
  if (currentStatus === "Cancelled") {
    throw new Error("Cannot receive a cancelled purchase order");
  }

  // ── 2. Build batch ───────────────────────────────────────────────────────
  const batch = writeBatch(db);

  // 2a. Update purchase order status to Received
  batch.update(orderRef, {
    status: "Received",
    receivedAt: Timestamp.now(),
    receivedBy,
    updatedAt: Timestamp.now(),
  });

  // 2b. Increase stock for each line item
  const warnings: string[] = [];

  for (const item of lineItems) {
    const productRef = doc(db, COLLECTIONS.INVENTORY, item.productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      warnings.push(
        `Product "${item.productName}" (ID: ${item.productId}) not found in inventory. Stock NOT updated.`
      );
      continue;
    }

    const currentStock = productSnap.data().stock ?? 0;
    const newStock = currentStock + item.quantity;
    const reorderLevel = productSnap.data().reorderLevel ?? 10;

    // Determine new status
    let newStatus: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";
    if (newStock === 0) newStatus = "Out of Stock";
    else if (newStock < reorderLevel) newStatus = "Low Stock";

    batch.update(productRef, {
      stock: increment(item.quantity),
      status: newStatus,
      // Also update cost price if purchase price is available
      ...(item.unitPrice > 0 ? { cost: item.unitPrice } : {}),
      updatedAt: Timestamp.now(),
    });

    // 2c. Log stock movement
    const ledgerRef = doc(collection(db, COLLECTIONS.STOCK_LEDGER));
    batch.set(ledgerRef, {
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      changeType: "purchase",
      quantity: item.quantity,           // positive = stock went up
      stockBefore: currentStock,
      stockAfter: newStock,
      referenceId: orderId,
      referenceType: "purchase_received",
      notes: `Received from PO: ${orderSnap.data().poNumber}`,
      changedBy: receivedBy,
      date: Timestamp.now(),
    });
  }

  // ── 3. Commit ─────────────────────────────────────────────────────────────
  await batch.commit();

  if (warnings.length > 0) {
    console.warn("Purchase receive warnings:", warnings);
    // Return warnings so caller can show them in UI
    throw new Error(`Received with warnings:\n${warnings.join("\n")}`);
  }
}

/**
 * Cancels a purchase order (only if not yet received).
 */
export async function cancelPurchaseOrder(
  orderId: string,
  cancelReason: string = "",
  cancelledBy: string = "system"
): Promise<void> {
  const orderRef = doc(db, COLLECTIONS.PURCHASES, orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) throw new Error("Purchase order not found");
  if (orderSnap.data().status === "Received") {
    throw new Error("Cannot cancel a purchase order that has already been received");
  }

  const batch = writeBatch(db);
  batch.update(orderRef, {
    status: "Cancelled",
    cancelReason,
    cancelledAt: Timestamp.now(),
    cancelledBy,
    updatedAt: Timestamp.now(),
  });

  await batch.commit();
}
