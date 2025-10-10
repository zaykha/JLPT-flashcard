// import { apiFetch } from '@/lib/api/http';
import type { WalletResponse } from '@/lib/api/types';

/** Fetches the user's current wallet snapshot and recent transactions. */
// export function getWallet(): Promise<WalletResponse> {
//   return apiFetch<WalletResponse>('/wallet');
// }

/** Temporary mock until Netlify wallet API is live */
export async function getWallet(): Promise<WalletResponse> {
  console.warn('[wallet] ⚠️ Using mock wallet data — replace when API is live.');

  const mock: WalletResponse = {
    wallet: {
      shards: 250,
      lastResetISO: new Date().toISOString().slice(0, 10),
      daily: {
        lessonsTaken: 1,
        extraLessonsUsed: 0,
        missedLessonsRedeemed: 0,
      },
      quizAttemptsByLesson: {
        '2025-03-17': 1,
        'lesson-0058': 2,
      },
      updatedAt: Date.now(),
    },
    transactions: [
      {
        id: 'txn_demo_001',
        type: 'lesson_reward',
        amount: +5,
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
        payload: { lessonId: '2025-03-17' },
      },
      {
        id: 'txn_demo_002',
        type: 'purchase_avatar',
        amount: -25,
        createdAt: Date.now() - 1000 * 60 * 60 * 12,
        payload: { item: 'kitsune-mask' },
      },
    ],
  };

  // Simulate a small delay
  await new Promise(r => setTimeout(r, 300));
  return mock;
}
