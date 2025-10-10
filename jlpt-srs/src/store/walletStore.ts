import { create } from 'zustand';
import { getWallet } from '@/lib/api/wallet';
import type { Wallet, WalletTransaction, WalletResponse } from '@/lib/api/types';
import { friendlyMessage } from '@/lib/api/http';

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

function applyResponse(snapshot: WalletResponse) {
  return {
    wallet: snapshot.wallet ?? null,
    transactions: snapshot.transactions ?? [],
    lastSyncAt: Date.now(),
    error: null,
  } satisfies Partial<WalletStoreState>;
}

export const useWalletStore = create<WalletStoreState>((set, get) => ({
  ...DEFAULT_STATE,

  async syncWallet() {
    set(state => ({ ...state, loading: true, error: null }));
    try {
      const response = await getWallet();
      console.info('[wallet] sync_success', { ts: Date.now() });
      set(state => ({ ...state, ...applyResponse(response), loading: false }));
    } catch (error) {
      const message = friendlyMessage(error);
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
