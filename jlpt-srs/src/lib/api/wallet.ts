import { apiFetch } from '@/lib/api/http';
import type { WalletResponse } from '@/lib/api/types';

/** Fetches the user's current wallet snapshot and recent transactions. */
export function getWallet(): Promise<WalletResponse> {
  return apiFetch<WalletResponse>('/wallet');
}

export function postWalletSpend(body: {
  action: 'missed_lesson' | 'extra_lesson';
  count?: number;
  note?: string;
  dayISO?: string;
  lessonId?: string; // legacy
  lessonNos?: number[]; // preferred: send explicit lesson numbers when purchasing missed
}): Promise<WalletResponse | { ok: true }> {
  return apiFetch<WalletResponse | { ok: true }>('/wallet-spend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function postWalletReward(body: {
  type: 'streak_7' | 'level_complete';
  note?: string;
  level?: string | number;
}): Promise<WalletResponse | { ok: true }> {
  return apiFetch<WalletResponse | { ok: true }>('/wallet-reward', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
