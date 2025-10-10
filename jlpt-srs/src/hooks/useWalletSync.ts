import { useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { useAuth } from '@/store/auth';

/**
 * Synchronises the wallet whenever the authenticated user changes and exposes wallet state.
 */
export function useWalletSync() {
  const user = useAuth(state => state.user);
  const wallet = useWalletStore(state => state.wallet);
  const transactions = useWalletStore(state => state.transactions);
  const loading = useWalletStore(state => state.loading);
  const error = useWalletStore(state => state.error);
  const syncWallet = useWalletStore(state => state.syncWallet);

  useEffect(() => {
    if (!user) return;
    void syncWallet();
  }, [syncWallet, user?.uid]);

  useEffect(() => {
    if (user) return;
    useWalletStore.setState({
      wallet: null,
      transactions: [],
      error: null,
      lastSyncAt: null,
      loading: false,
    });
  }, [user]);

  return {
    wallet,
    transactions,
    loading,
    error,
    refresh: syncWallet,
  };
}
