import { useCallback } from 'react';
import { postPurchase } from '@/lib/api/purchase';
import { friendlyMessage } from '@/lib/api/http';
import { useWalletStore } from '@/store/walletStore';

export type PurchaseResult = Awaited<ReturnType<typeof postPurchase>>;

export const SHARD_COSTS: Record<string, number> = {
  'settings.change_identity': 10,
  'change_settings': 30,
  'quiz.retry': 5,
  'lesson.retake_missed': 10,
  'lesson.extra_daily': 15,
};

/**
 * Returns a helper for executing shard-based purchases through the backend.
 */
export function usePurchase() {
  const refreshSoon = useWalletStore(state => state.refreshSoon);
  const setError = useWalletStore(state => state.setError);

  return useCallback(async (action: string, payload?: unknown): Promise<PurchaseResult> => {
    setError(null);
    console.info('[wallet] purchase_attempt', { action, ts: Date.now() });
    try {
      const result = await postPurchase({ action, payload });
      refreshSoon();
      console.info('[wallet] purchase_result', { action, success: true, ts: Date.now() });
      return result;
    } catch (error) {
      const message = friendlyMessage(error);
      setError(message);
      console.warn('[wallet] purchase_result', { action, success: false, message, error });
      throw Object.assign(new Error(message), { cause: error });
    }
  }, [refreshSoon, setError]);
}
