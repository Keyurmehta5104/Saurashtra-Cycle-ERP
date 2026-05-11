import { runTransaction, doc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Supported counter types and their display prefixes.
 *
 *  invoice  → INV-0001, INV-0002, ...
 *  purchase → PO-0001,  PO-0002,  ...
 *  service  → SRV-0001, SRV-0002, ...
 */
export type CounterType = "invoice" | "purchase" | "service";

const PREFIX: Record<CounterType, string> = {
  invoice: "INV",
  purchase: "PO",
  service: "SRV",
};

/**
 * Atomically increments a Firestore counter and returns the next
 * formatted document number, e.g. "INV-0042".
 *
 * Uses `runTransaction` so concurrent users can never get the same number.
 * Counter state is stored in the `counters/{type}` document.
 *
 * @param type - "invoice" | "purchase" | "service"
 * @param padding - zero-padding width (default 4 → 0001)
 */
export async function getNextNumber(
  type: CounterType,
  padding = 4
): Promise<string> {
  const counterRef = doc(db, "counters", type);

  const nextNum = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(counterRef);

    const current: number = snap.exists() ? (snap.data().lastNumber ?? 0) : 0;
    const next = current + 1;

    transaction.set(
      counterRef,
      { lastNumber: next, updatedAt: new Date() },
      { merge: true } // safe if doc doesn't exist yet
    );

    return next;
  });

  return `${PREFIX[type]}-${String(nextNum).padStart(padding, "0")}`;
}

/**
 * Peeks at the NEXT number that would be generated WITHOUT incrementing.
 * Useful for displaying a preview in a read-only field.
 *
 * NOTE: two concurrent users might get the same preview — this is for display
 * only. Always call `getNextNumber()` on actual form submission.
 */
export async function peekNextNumber(
  type: CounterType,
  padding = 4
): Promise<string> {
  const counterRef = doc(db, "counters", type);
  const { getDoc } = await import("firebase/firestore");
  const snap = await getDoc(counterRef);
  const current: number = snap.exists() ? (snap.data().lastNumber ?? 0) : 0;
  return `${PREFIX[type]}-${String(current + 1).padStart(padding, "0")}`;
}
