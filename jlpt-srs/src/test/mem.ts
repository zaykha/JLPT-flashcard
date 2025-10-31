// src/test/mem.ts
import { vi } from 'vitest';

/**
 * Tiny shared test helper for clearing state between tests.
 * Import { mem } in your specs and call mem.clear().
 */
export const mem = {
  clear() {
    // reset timers/mocks/spies
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.resetModules();

    // reset jsdom localStorage (your setupTest.ts stubs it)
    try {
      (globalThis as any).localStorage?.clear?.();
    } catch { /* ignore */ }

    // clean any global test state your specs may use
    delete (globalThis as any).__TEST_PROGRESS__;
    delete (globalThis as any).__TEST_USER__;
  },
};
