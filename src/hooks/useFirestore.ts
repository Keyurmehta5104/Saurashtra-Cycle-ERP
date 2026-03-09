import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  addDocument, 
  updateDocument, 
  deleteDocument,
  COLLECTIONS 
} from "@/lib/firebaseCollections";

export function useFirestoreCollection<T>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        setData(documents);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  const add = useCallback(async (item: Omit<T, "id">) => {
    return addDocument(collectionName, item);
  }, [collectionName]);

  const update = useCallback(async (id: string, item: Partial<T>) => {
    return updateDocument(collectionName, id, item);
  }, [collectionName]);

  const remove = useCallback(async (id: string) => {
    return deleteDocument(collectionName, id);
  }, [collectionName]);

  return { data, loading, error, add, update, remove };
}

// Typed hooks for each collection
export function useInventory() {
  return useFirestoreCollection(COLLECTIONS.INVENTORY);
}

export function useSales() {
  return useFirestoreCollection(COLLECTIONS.SALES);
}

export function usePurchases() {
  return useFirestoreCollection(COLLECTIONS.PURCHASES);
}

export function useCustomers() {
  return useFirestoreCollection(COLLECTIONS.CUSTOMERS);
}

export function useServices() {
  return useFirestoreCollection(COLLECTIONS.SERVICES);
}

export function useInvoices() {
  return useFirestoreCollection(COLLECTIONS.INVOICES);
}
