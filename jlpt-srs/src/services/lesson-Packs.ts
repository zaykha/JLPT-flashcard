// services/lesson-packs.ts
// Central cache for catalog + lesson packs. No hard dependency on loadBootstrap at init.
// You must call initLessonPacksFromBoot(boot) from your initial fetch once you have boot.

import type { Word } from '@/types/vocab';
import type { GrammarPoint } from '@/types/grammar';
import { loadBootCatalog } from '@/lib/bootstrap';
import { getVocabByIds, getGrammarByIds } from '@/lib/firestore/content';
import { mapVocabDocToWord as mapWordMaybe } from '@/types/vocab';
import { JLPT_LEVEL_RANGES } from '@/helpers/levelsV1';
import { coerceJLPTLevel, type JLPTLevelStr } from '@/types/userV1';

export type Pack = { lessonNo: number; words: Word[]; grammar: GrammarPoint[] };
type CatalogLesson = { lessonNo: number; vocabIds?: string[]; grammarIds?: string[] };

type LessonProgressShape = {
  completed?: Array<{ lessonNo: number | string } | any>;
  current?: Array<{ lessonNo?: number | string } | (number | string)> | any[];
};

type State = {
  inited: boolean;              // catalog loaded
  error: string | null;
  level: string | null;
  lessons: CatalogLesson[];
  packs: Map<number, Pack>;
  initPromise: Promise<void> | null;
};

const state: State = {
  inited: false,
  error: null,
  level: null,
  lessons: [],
  packs: new Map(),
  initPromise: null,
};

const mapWord = (d: any): Word =>
  typeof mapWordMaybe === 'function'
    ? mapWordMaybe(d)
    : ({
        id: d?.id ?? d?.docId ?? `${Date.now()}-${Math.random()}`,
        kanji: d?.kanji ?? d?.k ?? '',
        hiragana: d?.hiragana ?? d?.h ?? '',
        romaji: d?.romaji ?? d?.r ?? '',
        english: d?.english ?? d?.en ?? '',
      } as Word);

/** Initialize with a known boot object (preferred). */
export function initLessonPacksFromBoot(boot: { catalogLevel?: string; lessonProgress?: LessonProgressShape } | null | undefined): Promise<void> {
  if (!boot || !boot.catalogLevel) {
    // Do NOT throw; return a resolved promise so app boot continues.
    state.inited = false;
    state.level = null;
    state.error = null;
    state.lessons = [];
    state.packs.clear();
    state.initPromise = null;
    return Promise.resolve();
  }

  const level: JLPTLevelStr = coerceJLPTLevel(boot.catalogLevel, 'N5');
  const progress = boot.lessonProgress ?? {};

  // idempotent: same level? just ensure warmed packs once.
  if (state.inited && state.level === level) return Promise.resolve();

  if (state.initPromise) return state.initPromise;

  state.initPromise = (async () => {
    try {
      const cat = await loadBootCatalog(level);
      const lessons = (cat as any)?.lessons as CatalogLesson[];
      if (!Array.isArray(lessons)) throw new Error('Catalog missing lessons');

      state.level = level;
      state.lessons = lessons;
      state.inited = true;
      state.error = null;

      // Warm a useful baseline: completed + current
      const completed = Array.isArray(progress.completed)
        ? progress.completed.map((e: any) => Number(e.lessonNo)).filter(Boolean)
        : [];
      const current = Array.isArray(progress.current)
        ? (progress.current as any[]).map((e: any) => Number(e?.lessonNo ?? e)).filter(Boolean)
        : [];

      const seeds = Array.from(new Set([...completed, ...current]));
      if (seeds.length) {
        await ensurePacks(seeds); // will use lessons we just loaded
      }
    } catch (e: any) {
      state.inited = false;
      state.error = e?.message || 'Failed to init lesson packs';
      state.level = null;
      state.lessons = [];
      state.packs.clear();
      throw e;
    } finally {
      state.initPromise = null;
    }
  })();

  return state.initPromise;
}

/** Backward-compat no-op init (kept so callers don’t crash). */
export function initLessonPacks(): Promise<void> {
  // We no longer pull from loadBootstrap() here to avoid races.
  // If you call this before boot exists, it just resolves and leaves the service uninitialized.
  return Promise.resolve();
}

export function lessonPacksReady(): boolean {
  return state.inited;
}

export function lessonPacksError(): string | null {
  return state.error;
}

export function resetLessonPacks(): void {
  state.inited = false;
  state.error = null;
  state.level = null;
  state.lessons = [];
  state.packs.clear();
  state.initPromise = null;
}

async function buildPack(lessonNo: number): Promise<Pack> {
  const cached = state.packs.get(lessonNo);
  if (cached) return cached;
  if (!state.inited || !state.lessons.length) {
    throw new Error('Lesson packs service not initialized (no catalog loaded). Call initLessonPacksFromBoot(boot) first.');
  }

  const meta =
    state.lessons.find((l) => l.lessonNo === lessonNo) ??
    ({ lessonNo, vocabIds: [], grammarIds: [] } as CatalogLesson);

  const [vDocs, gDocs] = await Promise.all([
    getVocabByIds(meta.vocabIds || []),
    getGrammarByIds(meta.grammarIds || []),
  ]);

  const pack: Pack = {
    lessonNo,
    words: (vDocs || []).map((d: any) => mapWord(d)),
    grammar: (gDocs || []) as GrammarPoint[],
  };
  state.packs.set(lessonNo, pack);
  return pack;
}

/** Ensure packs exist; will throw if service wasn’t initialized with a level yet. */
export async function ensurePacks(lessonNos: number[]): Promise<Pack[]> {
  if (!state.inited) {
    throw new Error('Lesson packs service not initialized yet. You must call initLessonPacksFromBoot(boot) after bootstrap.');
  }
  const unique = Array.from(new Set(lessonNos)).sort((a, b) => a - b);
  const out: Pack[] = [];
  for (const n of unique) out.push(await buildPack(n));
  return out;
}

/** Read-only getters. Return null if any are missing or not initialized. */
export function getPacksSync(lessonNos: number[]): Pack[] | null {
  if (!state.inited) return null;
  const arr = lessonNos.map((n) => state.packs.get(n));
  return arr.every(Boolean) ? (arr as Pack[]).sort((a, b) => a.lessonNo - b.lessonNo) : null;
}

export function getPackSync(lessonNo: number): Pack | undefined {
  if (!state.inited) return undefined;
  return state.packs.get(lessonNo);
}
