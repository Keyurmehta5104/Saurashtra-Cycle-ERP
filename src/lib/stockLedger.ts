import { collection, doc, writeBatch, Timestamp, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS } from "./firebaseCollections";
import { StockLedgerEntry } from "@/types/firebase";

interface LedgerUpdateParams {
  batch: ReturnType<typeof writeBatch>;
  productId: string;
  productName: string;
  sku: string;
  changeType: StockLedgerEntry["changeType"];
  quantityChange: number; // +ve for adding stock, -ve for removing stock
  referenceId: string;
  referenceType: StockLedgerEntry["referenceType"];
  notes?: string;
  userId: string;
}

/**
 * Adds a stock ledger entry to a Firestore batch.
 * This MUST be called inside a batch operation that also updates the inventory document.
 */
export async function addStockLedgerEntry(params: LedgerUpdateParams) {
  const { batch, productId, productName, sku, changeType, quantityChange, referenceId, referenceType, notes, userId } = params;

  // We need to fetch the current stock before we log it.
  const productRef = doc(db, COLLECTIONS.INVENTORY, productId);
  const productSnap = await getDoc(productRef);
  
  if (!productSnap.exists()) {
    throw new Error(`Cannot add ledger entry: Product ${productId} does not exist.`);
  }

  const currentStock = productSnap.data().stock || 0;
  const stockAfter = currentStock + quantityChange;

  if (stockAfter < 0) {
    throw new Error(`Insufficient stock for ${productName}. Current stock: ${currentStock}, Requested reduction: ${Math.abs(quantityChange)}.`);
  }

  const ledgerRef = doc(collection(db, COLLECTIONS.STOCK_LEDGER));
  
  const entry: Omit<StockLedgerEntry, "id"> = {
    productId,
    productName,
    sku,
    changeType,
    quantity: quantityChange,
    stockBefore: currentStock,
    stockAfter,
    referenceId,
    referenceType,
    notes: notes || "",
    changedBy: userId,
    date: Timestamp.now(),
  };

  batch.set(ledgerRef, entry);
}

export async function updateInventoryWithLedger(
  productId: string, 
  productName: string, 
  sku: string, 
  newStock: number, 
  currentStock: number, 
  userId: string, 
  notes: string = "Manual adjustment"
) {
  if (newStock < 0) {
    throw new Error("Stock cannot be negative.");
  }

  const quantityChange = newStock - currentStock;
  
  if (quantityChange === 0) return; // No stock change

  const batch = writeBatch(db);
  const productRef = doc(db, COLLECTIONS.INVENTORY, productId);
  
  batch.update(productRef, {
    stock: newStock,
    updatedAt: Timestamp.now()
  });

  await addStockLedgerEntry({
    batch,
    productId,
    productName,
    sku,
    changeType: "manual_adjustment",
    quantityChange,
    referenceId: "manual",
    referenceType: "manual",
    notes,
    userId
  });

  await batch.commit();
}
