/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// 🔧 In-memory Firestore for tests (resettable)
vi.mock('firebase/firestore', () => {
  const store = new Map<string, any>();

  const keyOf = (ref: any) => ref.__key as string;

  const makeSnap = (data?: any) => ({
    exists: () => data !== undefined,
    data: () => (data ?? {}),
  });

  return {
    // APIs your code uses
    serverTimestamp: vi.fn(() => ({ __mock: 'serverTimestamp' })),
    doc: vi.fn((_db: any, ...path: string[]) => ({ __key: path.join('/') })),
    getDoc: vi.fn(async (ref: any) => makeSnap(store.get(keyOf(ref)))),
    setDoc: vi.fn(async (ref: any, val: any) => {
      store.set(keyOf(ref), val);
    }),
    updateDoc: vi.fn(async (ref: any, patch: Record<string, any>) => {
      const prev = store.get(keyOf(ref)) ?? {};
      store.set(keyOf(ref), { ...prev, ...patch });
    }),
    // (not used in these tests but present in your app elsewhere)
    collection: vi.fn(),
    addDoc: vi.fn(async () => ({ id: 'mock-id' })),
    getDocs: vi.fn(async () => ({ docs: [] })),
    onSnapshot: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    runTransaction: vi.fn(async (_db: any, fn: any) => {
      // a minimal tx shim, not needed by ensureDailyQueue
      const tx = {
        get: vi.fn(async (ref: any) => ({ exists: () => !!store.get(keyOf(ref)), data: () => store.get(keyOf(ref)) })),
        set: vi.fn((ref: any, val: any) => store.set(keyOf(ref), val)),
        update: vi.fn((ref: any, patch: any) => {
          const prev = store.get(keyOf(ref)) ?? {};
          store.set(keyOf(ref), { ...prev, ...patch });
        }),
      };
      return fn(tx);
    }),

    // Helpers for tests
    __fsReset: () => store.clear(),
    __fsGet: (key: string) => store.get(key),
    __fsSet: (key: string, val: any) => store.set(key, val),
  };
});

// 🧩 Minimal firebase entry so imports of `db`/`auth` are satisfied
vi.mock('@/lib/firebase', () => {
  return {
    db: {}, // dummy DB
    auth: { currentUser: { uid: 'test-user' } },
  };
});

// 🧰 Bootstrap cache (simple memory)
vi.mock('@/lib/bootstrap', () => {
  let boot: any = null;
  return {
    loadBootstrap: () => boot,
    saveBootstrap: (b: any) => { boot = b; },
  };
});

// 📅 If some code calls jstTodayISO without override, keep it predictable
vi.mock('@/lib/cache/lessons', () => {
  let T = '2025-10-18';
  return {
    jstTodayISO: () => T,
    __setToday: (iso: string) => { T = iso; },
  };
});

// localStorage stable for tests
const ls = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => ls.get(k) ?? null,
  setItem: (k: string, v: string) => { ls.set(k, v); },
  removeItem: (k: string) => { ls.delete(k); },
  clear: () => { ls.clear(); },
  key: (i: number) => Array.from(ls.keys())[i] ?? null,
  get length() { return ls.size; },
});
