import { useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { useAuth } from '@/store/auth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';

/**
 * Synchronises the wallet whenever the authenticated user changes and exposes wallet state.
 */
export function useWalletSync() {
  const WALLET_ENABLED = import.meta.env.VITE_WALLET_ENABLED === 'true';
  const user = useAuth(state => state.user);
  const wallet = useWalletStore(state => state.wallet);
  const transactions = useWalletStore(state => state.transactions);
  const loading = useWalletStore(state => state.loading);
  const error = useWalletStore(state => state.error);
  const setError = useWalletStore(state => state.setError);
  const setStateDirect = useWalletStore.setState;

  useEffect(() => {
    if (!WALLET_ENABLED) return;
    if (!user) return;
    // Start loading state
    setStateDirect(state => ({ ...state, loading: true, error: null }));

    // New structure: users/{uid}/wallet/meta (doc) with subcollection transactions
    const walletRef = doc(db, 'users', user.uid, 'wallet', 'meta');
    const unsubWallet = onSnapshot(
      walletRef,
      (snap) => {
        const data = snap.data() as any | undefined;
        const wallet = data
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
        setStateDirect(state => ({ ...state, wallet, lastSyncAt: Date.now(), loading: false }));
      },
      (err) => {
        console.warn('[wallet] wallet_snapshot_failed', err);
        setError(err?.message ?? 'Failed to fetch wallet');
        setStateDirect(state => ({ ...state, loading: false }));
      }
    );

    const txQ = query(collection(walletRef, 'transactions'), orderBy('createdAt', 'desc'), limit(10));
    const unsubTx = onSnapshot(
      txQ,
      (qs) => {
        const transactions = qs.docs.map((d) => {
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
        setStateDirect(state => ({ ...state, transactions }));
      },
      (err) => {
        console.warn('[wallet] tx_snapshot_failed', err);
      }
    );

    return () => { unsubWallet(); unsubTx(); };
  }, [WALLET_ENABLED, user?.uid]);

  useEffect(() => {
    if (!WALLET_ENABLED) return;
    if (user) return;
    useWalletStore.setState({
      wallet: null,
      transactions: [],
      error: null,
      lastSyncAt: null,
      loading: false,
    });
  }, [WALLET_ENABLED, user]);

  return {
    wallet: WALLET_ENABLED ? wallet : null,
    transactions: WALLET_ENABLED ? transactions : [],
    loading: WALLET_ENABLED ? loading : false,
    error: WALLET_ENABLED ? error : null,
    refresh: WALLET_ENABLED ? () => useWalletStore.getState().syncWallet() : async () => {},
  };
}
