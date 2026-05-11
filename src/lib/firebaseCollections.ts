import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";

// Collection names
export const COLLECTIONS = {
  INVENTORY: "inventory",
  SALES: "sales",
  PURCHASES: "purchases",
  CUSTOMERS: "customers",
  SERVICES: "services",
  INVOICES: "invoices",
  USERS: "users",
  ACTIVITY_LOGS: "activity_logs",
  STOCK_LEDGER: "stockLedger",
} as const;

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as T;
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      if (val === undefined) return;
      result[key] = stripUndefinedDeep(val);
    });
    return result as T;
  }

  return value;
}

// Generic CRUD operations
export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  const cleanData = stripUndefinedDeep(data);
  const docRef = await addDoc(collection(db, collectionName), {
    ...cleanData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  const cleanData = stripUndefinedDeep(data);
  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
}

export async function getDocument<T>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
}

export async function getAllDocuments<T>(
  collectionName: string
): Promise<T[]> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as T[];
}

export async function queryDocuments<T>(
  collectionName: string,
  fieldPath: string,
  operator: "==" | "!=" | "<" | "<=" | ">" | ">=",
  value: unknown
): Promise<T[]> {
  const q = query(
    collection(db, collectionName),
    where(fieldPath, operator, value)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as T[];
}
