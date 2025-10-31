import { useCallback } from 'react';
import { postWalletSpend, postWalletReward } from '@/lib/api/wallet';
import { useWalletStore } from '@/store/walletStore';
import { friendlyMessage } from '@/lib/api/http';

export function useWalletActions() {
  const refreshSoon = useWalletStore(state => state.refreshSoon);
  const setError = useWalletStore(state => state.setError);

  const spend = useCallback(async (params: {
    action: 'missed_lesson' | 'extra_lesson';
    count?: number;
    note?: string;
    dayISO?: string;   // preferred casing
    dayIso?: string;   // backend variant casing
    lessonId?: string; // legacy single id
    lessonNos?: number[]; // preferred: explicit list for missed flow
  }) => {
    setError(null);
    try {
      const res = await postWalletSpend(params);
      refreshSoon();
      return res;
    } catch (err) {
      const msg = friendlyMessage(err);
      setError(msg);
      throw Object.assign(new Error(msg), { cause: err });
    }
  }, [refreshSoon, setError]);

  const reward = useCallback(async (params: {
    type: 'streak_7' | 'level_complete';
    note?: string;
    level?: string | number;
  }) => {
    setError(null);
    try {
      const res = await postWalletReward(params);
      refreshSoon();
      return res;
    } catch (err) {
      const msg = friendlyMessage(err);
      setError(msg);
      throw Object.assign(new Error(msg), { cause: err });
    }
  }, [refreshSoon, setError]);

  return { spend, reward };
}
