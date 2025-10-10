import type { LessonCatalog } from '@/lib/api/types';
import type { JLPTLevelStr } from '@/lib/user-data';
import { kvGet, kvSet, lessonCatalogKey } from '@/lib/storage';

export type CachedLessonCatalog = LessonCatalog & { cachedAt: number };

type TodayLessonKey = {
  uid: string;
  level: string;  // 'N5'...'N1'
  lessonNo: number;
  dateISO: string; // YYYY-MM-DD (JST)
};
export type TodayLessonRecord = {
  key: TodayLessonKey;
  words: any[];         // your Word[]
  expiresAt: number;    // epoch ms
};

const LS_KEY = 'koza.todayLesson';
export async function loadLessonCatalog(level: JLPTLevelStr): Promise<(CachedLessonCatalog & LessonCatalog) | null> {
  const key = lessonCatalogKey(level);
  const cached = await kvGet<CachedLessonCatalog & LessonCatalog>(key);
  return cached ?? null;
}

export async function saveLessonCatalog(level: JLPTLevelStr, catalog: LessonCatalog): Promise<CachedLessonCatalog> {
  const record: CachedLessonCatalog = { ...catalog, cachedAt: Date.now() };
  const key = lessonCatalogKey(level);
  await kvSet(key, record);
  return record;
}

function loadAll(): TodayLessonRecord[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function saveAll(recs: TodayLessonRecord[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(recs));
}

export function jstTodayISO(): string {
  const now = new Date();
  // force JST without TZ libs: add 9 hours, then take date
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0,10);
}
export function endOfTodayJST(): number {
  const iso = jstTodayISO();
  const end = new Date(`${iso}T15:00:00.000Z`); // 24:00 JST == 15:00 UTC
  return end.getTime();
}

export function loadTodayLesson(key: TodayLessonKey): TodayLessonRecord | null {
  const all = loadAll();
  const rec = all.find(r =>
    r.key.uid === key.uid &&
    r.key.level === key.level &&
    r.key.lessonNo === key.lessonNo &&
    r.key.dateISO === key.dateISO
  );
  if (!rec) { debugLogTodayLookup(key, null); return null; }
  if (Date.now() >= rec.expiresAt) { debugLogTodayLookup(key, null); return null; }
  debugLogTodayLookup(key, rec);
  return rec;
}

export function saveTodayLesson(payload: TodayLessonRecord) {
  const all = loadAll()
    .filter(r =>
      !(r.key.uid === payload.key.uid &&
        r.key.level === payload.key.level &&
        r.key.lessonNo === payload.key.lessonNo &&
        r.key.dateISO === payload.key.dateISO)
    );
  all.push(payload);
  saveAll(all);

  // DEBUG mirror
  try { (window as any).__KOZA_TODAY_CACHE_LAST_SAVED__ = payload; } catch {}
  console.log('[todayLesson][DEBUG] saved', payload);
}

// --- DEBUG: dump entire today-lesson cache array
export function debugListAllTodayLessons(): TodayLessonRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? (JSON.parse(raw) as TodayLessonRecord[]) : [];
    console.group('[todayLesson][DEBUG] Local cache list');
    console.log('count:', arr.length);
    console.log('records:', arr);
    console.groupEnd();
    return arr;
  } catch (e) {
    console.warn('[todayLesson][DEBUG] failed to parse cache', e);
    return [];
  }
}

// --- DEBUG: log a specific key lookup
export function debugLogTodayLookup(key: TodayLessonKey, hit: TodayLessonRecord | null) {
  console.group('[todayLesson][DEBUG] lookup');
  console.log('key:', key);
  console.log('hit:', !!hit, hit);
  console.groupEnd();

  // also mirror to window for quick DevTools inspection
  try {
    (window as any).__KOZA_TODAY_CACHE_LOOKUP__ = { key, hit };
  } catch {}
}
