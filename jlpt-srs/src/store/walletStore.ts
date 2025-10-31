import { create } from 'zustand';
import type { Wallet, WalletTransaction } from '@/lib/api/types';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, orderBy, limit, query } from 'firebase/firestore';

export type WalletStoreState = {
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  loading: boolean;
  error: string | null;
  lastSyncAt: number | null;
  syncWallet: () => Promise<void>;
  refreshSoon: (ms?: number) => void;
  setError: (msg: string | null) => void;
};

const DEFAULT_STATE = {
  wallet: null,
  transactions: [],
  loading: false,
  error: null,
  lastSyncAt: null,
};

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

async function fetchWalletOnce(): Promise<{ wallet: Wallet | null; transactions: WalletTransaction[] }> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw Object.assign(new Error('Not signed in'), { code: 'auth/no_user' });
  // New structure: users/{uid}/wallet/meta (doc) with subcollection transactions
  const walletRef = doc(db, 'users', uid, 'wallet', 'meta');
  const snap = await getDoc(walletRef);
  const data = snap.data() as any | undefined;
  const wallet: Wallet | null = data
    ? {
        shards: typeof data.shards === 'number' ? data.shards : 0,
        updatedAt: data.updatedAt,
        premium: data.premium
          ? {
              status: data.premium.status ?? 'none',
              subscriptionId: data.premium.subscriptionId ?? undefined,
              currentPeriodEnd: data.premium.currentPeriodEnd,
            }
          : undefined,
      }
    : null;

  const txQ = query(
    collection(walletRef, 'transactions'),
    orderBy('createdAt', 'desc'),
    limit(10),
  );
  const txSnap = await getDocs(txQ);
  const transactions: WalletTransaction[] = txSnap.docs.map((d) => {
    const row = d.data() as any;
    return {
      id: d.id,
      type: String(row.type ?? ''),
      amount: Number(row.amount ?? 0),
      balanceAfter: typeof row.balanceAfter === 'number' ? row.balanceAfter : undefined,
      source: row.source,
      note: row.note,
      createdAt: row.createdAt,
    } as any;
  });
  return { wallet, transactions };
}

export const useWalletStore = create<WalletStoreState>((set, get) => ({
  ...DEFAULT_STATE,

  async syncWallet() {
    set(state => ({ ...state, loading: true, error: null }));
    try {
      const { wallet, transactions } = await fetchWalletOnce();
      console.info('[wallet] sync_success', { ts: Date.now() });
      set(state => ({ ...state, wallet, transactions, lastSyncAt: Date.now(), loading: false, error: null }));
    } catch (error: any) {
      const message = error?.message ?? 'Failed to fetch';
      console.warn('[wallet] sync_failed', { message, error });
      set(state => ({ ...state, loading: false, error: message }));
      throw error;
    }
  },

  refreshSoon(ms = 1500) {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      refreshTimer = null;
      void get().syncWallet();
    }, ms);
  },

  setError(msg) {
    set(state => ({ ...state, error: msg }));
  },
}));
