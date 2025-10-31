// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { useWalletStore } from '@/store/walletStore';

// vi.mock('@/lib/api/wallet', () => ({
//   getWallet: vi.fn(),
// }));

// const { getWallet } = await import('@/lib/api/wallet');

// beforeEach(() => {
//   useWalletStore.setState({
//     wallet: null,
//     transactions: [],
//     loading: false,
//     error: null,
//     lastSyncAt: null,
//   });
//   vi.resetAllMocks();
// });

// describe('walletStore', () => {
//   it('syncWallet stores snapshot and clears loading', async () => {
//     (getWallet as vi.Mock).mockResolvedValue({
//       wallet: { shards: 42 },
//       transactions: [],
//     });

//     const store = useWalletStore.getState();
//     await store.syncWallet();

//     const state = useWalletStore.getState();
//     expect(state.loading).toBe(false);
//     expect(state.wallet?.shards).toBe(42);
//     expect(state.error).toBeNull();
//     expect(state.lastSyncAt).toBeTruthy();
//   });

//   it('syncWallet records error on failure', async () => {
//     (getWallet as vi.Mock).mockRejectedValue(new Error('nope'));

//     const store = useWalletStore.getState();
//     await expect(store.syncWallet()).rejects.toThrow();

//     const state = useWalletStore.getState();
//     expect(state.loading).toBe(false);
//     expect(state.error).toBe('nope');
//   });
// });
