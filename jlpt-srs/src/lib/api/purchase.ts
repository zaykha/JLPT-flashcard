import { apiFetch } from '@/lib/api/http';
import type { WalletResponse } from '@/lib/api/types';

export type PurchaseInput = {
  action: string;
  payload?: unknown;
};

export function postPurchase(input: PurchaseInput): Promise<WalletResponse | { ok: true }> {
  return apiFetch<WalletResponse | { ok: true }>('/purchase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
}
