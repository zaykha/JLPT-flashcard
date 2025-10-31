import { doc, getDoc, setDoc, serverTimestamp, deleteDoc, runTransaction, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function ensureWalletDoc(uid: string, todayISO?: string) {
  // New structure: wallet doc at users/{uid}/wallet/meta (with subcollection transactions)
  const ref = doc(db, 'users', uid, 'wallet', 'meta');
  const snap = await getDoc(ref);
  if (snap.exists()) return false;
  await setDoc(ref, {
    shards: 0,
    updatedAt: serverTimestamp(),
    premium: { status: 'none' },
  } as any, { merge: true });
  return true;
}

/**
 * Dev-only helper: migrate legacy wallet docs to the new structure.
 * - Reads users/{uid}/wallet and users/{uid}/wallet/summary if they exist
 * - Writes users/{uid}/wallet/meta with minimal fields
 * - Deletes the legacy docs
 */
export async function migrateLegacyWalletDoc(uid: string) {
  const legacyA = doc(db, 'users', uid, 'wallet');
  const legacyB = doc(db, 'users', uid, 'wallet', 'summary');
  const metaRef = doc(db, 'users', uid, 'wallet', 'meta');

  const [aSnap, bSnap, metaSnap] = await Promise.all([getDoc(legacyA), getDoc(legacyB), getDoc(metaRef)]);
  if (!metaSnap.exists()) {
    await setDoc(metaRef, { shards: 0, updatedAt: serverTimestamp(), premium: { status: 'none' } } as any, { merge: true });
  }
  // Delete legacy docs if present
  if (aSnap.exists() && legacyA.path.split('/').length % 2 === 0) {
    await deleteDoc(legacyA).catch(() => {});
  }
  if (bSnap.exists()) {
    await deleteDoc(bSnap.ref).catch(() => {});
  }
}

/** DEV ONLY: Credit shards directly in Firestore (no Stripe). */
export async function devTopupShards(uid: string, amount: number, note: string = 'Dev topup') {
  if (process.env.NODE_ENV === 'production') throw new Error('devTopupShards is dev-only');
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be positive');
  const metaRef = doc(db, 'users', uid, 'wallet', 'meta');
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(metaRef);
    const cur = (snap.exists() ? (snap.data() as any)?.shards : 0) || 0;
    const next = cur + amount;
    tx.set(metaRef, { shards: next, updatedAt: serverTimestamp() } as any, { merge: true });
    const txCol = collection(metaRef, 'transactions');
    await addDoc(txCol, {
      type: 'shard_topup',
      amount,
      balanceAfter: next,
      source: { provider: 'system' },
      note,
      createdAt: serverTimestamp(),
    } as any);
  });
}
