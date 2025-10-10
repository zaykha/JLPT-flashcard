import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { useWalletSync } from '@/hooks/useWalletSync';
import { BuyShardsModal } from '@/features/wallet/BuyShardsModal';

export type WalletContextValue = ReturnType<typeof useWalletSync> & {
  buyModalOpen: boolean;
  openBuyModal: (sku?: string) => void;
  closeBuyModal: () => void;
  initialSku: string | null;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { wallet, transactions, loading, error, refresh } = useWalletSync();
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [initialSku, setInitialSku] = useState<string | null>(null);

  const openBuyModal = useCallback((sku?: string) => {
    setInitialSku(sku ?? null);
    setBuyModalOpen(true);
    console.info('wallet.open_buy', { sku: sku ?? null, ts: Date.now() });
  }, []);

  const closeBuyModal = useCallback(() => {
    setBuyModalOpen(false);
    setInitialSku(null);
  }, []);

  const value = useMemo(
    () => ({ wallet, transactions, loading, error, refresh, buyModalOpen, openBuyModal, closeBuyModal, initialSku }),
    [wallet, transactions, loading, error, refresh, buyModalOpen, openBuyModal, closeBuyModal, initialSku]
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
      <BuyShardsModal open={buyModalOpen} onClose={closeBuyModal} initialSku={initialSku ?? undefined} />
    </WalletContext.Provider>
  );
};

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('useWalletContext called outside of WalletProvider; returning fallback value.');
    }
    const fallback: WalletContextValue = {
      wallet: null,
      transactions: [],
      loading: false,
      error: null,
      refresh: async () => {},
      buyModalOpen: false,
      openBuyModal: () => {},
      closeBuyModal: () => {},
      initialSku: null,
    };
    return fallback;
  }
  return ctx;
}
