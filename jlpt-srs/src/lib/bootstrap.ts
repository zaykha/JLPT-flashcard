// src/lib/bootstrap.ts
// import type { JLPTLevelStr, UserProfile, LessonProgress, SrsSummary } from '@/lib/user-data';
import type { LessonCatalog, WalletResponse } from '@/lib/api/types';
import { loadLessonCatalog, saveLessonCatalog, type CachedLessonCatalog } from '@/lib/cache/lessons';
import type { LessonProgress, SrsSummary } from '@/types/lessonV1';
import type { JLPTLevelStr, UserProfile } from '@/types/userV1';

const LS_KEY = 'koza.bootstrap.v1';

export type BootstrapBundle = {
  profile: UserProfile;
  lessonCatalog?: LessonCatalog;
  lessonProgress?: LessonProgress; // Add this line
  catalogLevel?: JLPTLevelStr;
  wallet?: WalletResponse;
  srsSummary?: SrsSummary;
  // Optional helper cache for reviews due today (derived from srsSummary)
  srsToday?: number[];
  cachedAt: number;
};

export function loadBootstrap(): BootstrapBundle | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as BootstrapBundle) : null;
  } catch {
    return null;
  }
}

export function saveBootstrap(next: BootstrapBundle): boolean {
  const prev = loadBootstrap();
  const prevKey = JSON.stringify({ p: prev?.profile, lp: prev?.lessonProgress });
  const nextKey = JSON.stringify({ p: next?.profile, lp: next?.lessonProgress });
  const changed = prevKey !== nextKey;

  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch { /* ignore quota */ }

  return changed;
}

// convenience for reading the heavy catalog (lives in kv cache already)
export async function loadBootCatalog(level: JLPTLevelStr): Promise<CachedLessonCatalog | null> {
  return loadLessonCatalog(level);
}
export async function saveBootCatalog(level: JLPTLevelStr, catalog: LessonCatalog) {
  return saveLessonCatalog(level, catalog);
}
