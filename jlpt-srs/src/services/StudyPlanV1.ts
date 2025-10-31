// services/StudyPlanV1.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { stripUndefinedDeep } from '@/helpers/sanitize';
import { db } from '@/lib/firebase';
import { decideDailyQueue } from './StudyPlanV1.decider';
import { jstTodayISO as _jstTodayISO } from '@/lib/cache/lessons';
import { rolloverIncompleteToFailed } from '@/helpers/todayV1';

import type { JLPTLevelStr } from '@/types/userV1';
import type {
  LessonQuizSnapshot,
  LessonCompletion,
  LessonFailure,
  ExamStatsEntry,
} from '@/types/lessonV1';

// ------------------------------- Types ------------------------------------

export type Range = { start: number; end: number };
export type Params = { levelRange?: Range; perDay: 2 | 3 };
export type Options = {
  todayISO?: string;         // test/override
  maxBackfillDays?: number;  // optional cap (default: Infinity)
  /** Backfill policy:
   *  - 'exclude-yesterday': backfill all missed days up to the day before yesterday.
   *  - 'through-yesterday' (default): backfill every missed day including yesterday.
   */
  backfillPolicy?: 'exclude-yesterday' | 'through-yesterday';
  /** Enable very light debug logs to the console. */
  debug?: boolean;
};

export type EnsureReason =
  | 'range_missing'
  | 'already_has_current'
  | 'quota_met'
  | 'no_more_lessons'
  | 'assigned';

export type LessonCurr = { lessonNo: number; LessonDate: string };

export type LessonsDoc = {
  completed?: LessonCompletion[];
  failed?:
    | LessonFailure[]
    | Array<{ lessonNo?: number; LessonDate?: string; attemptedAt?: string }>; // tolerate legacy
  current?: Array<number | LessonCurr>;
  currentDateISO?: string;   // legacy hint of the day the queue was created
  examsStats?: ExamStatsEntry[];
};

export type EnsureResult = {
  wrote: boolean;
  reason?: EnsureReason;
  current?: LessonCurr[];
};

// ------------------------------ Utilities ---------------------------------

const PROGRESS_DOC_KEY = 'lessons'; // match the canonical doc used elsewhere

const day = (s?: string | null) => (s ? String(s).slice(0, 10) : '');
const atMidnightZ = (isoDay: string) => `${isoDay}T00:00:00.000Z`;

/** ISO day +N (UTC). */
function addDays(isoDay: string, delta: number): string {
  const d = new Date(`${isoDay}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Returns every day strictly between fromISO and toISO (exclusive end). */
function daysBetweenExclusive(fromISO: string, toISO: string): string[] {
  const out: string[] = [];
  let cur = addDays(fromISO, 1);
  while (cur < toISO) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

/** Normalize Firestore → consistent arrays; tolerate legacy shapes. */
function normalizeLessonsDoc(doc?: LessonsDoc): {
  completed: LessonCompletion[];
  failed: LessonFailure[];
  current: LessonCurr[];
  currentDateISO?: string;
  examsStats: ExamStatsEntry[];
} {
  const d = doc ?? {};
  const completed = Array.isArray(d.completed) ? d.completed : [];

  // failed: accept legacy shape (LessonDate) and map to attemptedAt
  const failedRaw = Array.isArray(d.failed) ? d.failed : [];
  const failed: LessonFailure[] = failedRaw
    .map((f: any) => ({
      lessonNo: Number.isFinite(Number(f?.lessonNo)) ? Number(f.lessonNo) : undefined,
      level: f?.level as JLPTLevelStr | null | undefined,
      attemptedAt: f?.attemptedAt ?? (f?.LessonDate ? atMidnightZ(day(f.LessonDate)) : undefined),
      quiz: f?.quiz as LessonQuizSnapshot | undefined,
      grammarQuiz: f?.grammarQuiz as LessonQuizSnapshot | undefined,
    }))
    .filter(Boolean) as LessonFailure[];

  // current: accept number[] or {lessonNo, LessonDate}[]
  const currentRaw = Array.isArray(d.current) ? d.current : [];
  const current: LessonCurr[] = currentRaw
    .map((it: any) =>
      it && typeof it === 'object' && 'lessonNo' in it
        ? { lessonNo: Number(it.lessonNo), LessonDate: String(it.LessonDate ?? '') }
        : { lessonNo: Number(it), LessonDate: '' }
    )
    .filter(x => Number.isFinite(x.lessonNo));

  return {
    completed,
    failed,
    current,
    currentDateISO: d.currentDateISO,
    examsStats: Array.isArray(d.examsStats) ? d.examsStats : [],
  };
}

/** Dedup by lessonNo; keep the first occurrence. */
function dedupByLessonNo<T extends { lessonNo?: number }>(arr: T[]): T[] {
  const out: T[] = [];
  const seen = new Set<number>();
  for (const x of arr) {
    const n = Number((x as any).lessonNo);
    if (!Number.isFinite(n)) continue;
    if (!seen.has(n)) {
      out.push(x);
      seen.add(n);
    }
  }
  return out;
}

/** Stringify a minimal projection to detect real (material) changes. */
function materiallyDifferent(a: LessonsDoc, b: LessonsDoc): boolean {
  const key = (x: LessonsDoc) =>
    JSON.stringify({
      c: (x.completed ?? []).map(e => ({ n: e.lessonNo, d: day(e.completedAt) })),
      f: (x.failed ?? []).map((e: any) => ({ n: e.lessonNo, d: day(e.attemptedAt ?? e.LessonDate) })),
      cur: (x.current ?? []).map((e: any) =>
        typeof e === 'object' ? { n: e.lessonNo, d: day(e.LessonDate) } : { n: Number(e), d: null }
      ),
      curD: x.currentDateISO ?? null,
    });
  return key(a) !== key(b);
}

/** Max of a set of ISO (YYYY-MM-DD) strings; undefined if none. */
function maxISO(ds: string[]): string | undefined {
  if (!ds.length) return undefined;
  return ds.reduce((a, b) => (a > b ? a : b));
}

/** Min of a set of ISO (YYYY-MM-DD) strings; undefined if none. */
function minISO(ds: string[]): string | undefined {
  if (!ds.length) return undefined;
  return ds.reduce((a, b) => (a < b ? a : b));
}

// ------------------------------- Main API ---------------------------------

export async function ensureDailyQueue(
  uid: string,
  params: Params,
  opts: Options = {}
): Promise<EnsureResult> {
  const { levelRange, perDay } = params;
  if (!levelRange) return { wrote: false, reason: 'range_missing' };

  const todayISO = opts.todayISO ?? _jstTodayISO();
  const maxBackfill = Number.isFinite(opts.maxBackfillDays as number)
    ? Math.max(0, Number(opts.maxBackfillDays))
    : Infinity; // default: backfill everything
  const policy = opts.backfillPolicy ?? 'through-yesterday';
  const debug = !!opts.debug;

  // ---- Read canonical doc (lessonProgress) 👈 this was the mismatch
  const ref = doc(db, 'users', uid, 'progress', PROGRESS_DOC_KEY);
  const snap = await getDoc(ref);
  const raw: LessonsDoc = snap.exists() ? ((snap.data() as unknown) as LessonsDoc) : {};
  const norm = normalizeLessonsDoc(raw);

  if (debug) {
    console.log('[ensureDailyQueue] START', { todayISO, perDay, levelRange, policy });
    console.log('[ensureDailyQueue] raw.completed (count):', norm.completed.length);
  }

  // Work on a mutable copy (no in-place on raw)
  const prog = {
    completed: [...norm.completed],
    failed: [...norm.failed],
    current: [...norm.current],
  };

  // ---- 1) Rollover: move ANY non-today current → failed (attemptedAt = their LessonDate)
  const rolled = rolloverIncompleteToFailed(prog, todayISO);
  const freshCurrent = prog.current.filter(c => day(c.LessonDate) === todayISO);

  // ---- 2) Compute first/last active day AFTER rollover using **prog** state
  const activityDays = ([
    norm.currentDateISO,
    ...prog.completed.map(c => day(c.completedAt)),
    ...prog.failed.map(f => day(f.attemptedAt)),
  ].filter(Boolean) as string[]);
  const lastActive = maxISO(activityDays);
  const firstActive = minISO(activityDays);

  if (debug) {
    console.log('[ensureDailyQueue] lastActive:', lastActive);
  }

  // ---- 3) Build touched sets & seed for next numbers
  const touched = new Set<number>([
    ...prog.completed.map(c => Number(c.lessonNo)).filter(Number.isFinite),
    ...prog.failed.map(f => Number(f.lessonNo)).filter(Number.isFinite),
    ...prog.current.map(c => Number(c.lessonNo)).filter(Number.isFinite),
  ]);
  const touchedInRange = Array.from(touched).filter(n => n >= levelRange.start && n <= levelRange.end);
  let seed = touchedInRange.length ? Math.max(...touchedInRange) : levelRange.start - 1;

  const isTouched = (n: number) => touched.has(n);
  const nextPick = (): number | null => {
    for (let n = seed + 1; n <= levelRange.end; n++) {
      if (!isTouched(n)) {
        seed = n;
        touched.add(n);
        return n;
      }
    }
    return null;
  };

  // ---- 4) Backfill missed days per policy
  // Strategy: from the earliest activity day, assume 2-per-day sequentially.
  // For each day up to yesterday, schedule the next numbers skipping already-touched ones.
  // Any scheduled numbers not already in completed/failed/current become failed with attemptedAt=that day.
  if (firstActive) {
    const includeFirst = [firstActive];
    const mid = daysBetweenExclusive(firstActive, todayISO); // strictly between
    let scheduleDays = includeFirst.concat(mid);
    if (policy === 'exclude-yesterday' && scheduleDays.length > 0) {
      // drop last day if it is yesterday
      scheduleDays = scheduleDays.slice(0, scheduleDays.length - 1);
    }
    const daysToFill = maxBackfill === Infinity ? scheduleDays : scheduleDays.slice(-maxBackfill);

    const initialTouched = new Set<number>(touched);

    // Compute starting pointer at the minimum touched in range, else start-1
    const minTouchedInRange = touchedInRange.length ? Math.min(...touchedInRange) : (levelRange.start);
    let ptr = minTouchedInRange - 1;

    const backfillAdds: LessonFailure[] = [];

    // Track how many lessons are already accounted per day (completed + failed [+ current])
    const dayCounts = new Map<string, number>();
    const addCount = (d: string, v: number = 1) => dayCounts.set(d, (dayCounts.get(d) ?? 0) + v);
    for (const c of prog.completed) { const d = day(c.completedAt); if (d) addCount(d, 1); }
    for (const f of prog.failed)    { const d = day(f.attemptedAt);   if (d) addCount(d, 1); }
    // current after rollover should be only today, but include defensively
    for (const cu of prog.current)   { const d = day(cu.LessonDate);   if (d) addCount(d, 1); }

    const nextFromPtr = (): number | null => {
      for (let n = ptr + 1; n <= levelRange.end; n++) {
        if (n < levelRange.start) continue;
        if (!touched.has(n)) {
          ptr = n;
          touched.add(n); // reserve
          return n;
        }
      }
      return null;
    };

    for (const dISO of daysToFill) {
      // Respect daily limit: do not exceed perDay per day across completed/failed/current
      const already = dayCounts.get(dISO) ?? 0;
      const available = Math.max(0, perDay - already);
      if (available === 0) continue;
      let added = 0;
      while (added < available) {
        const n = nextFromPtr();
        if (n == null) { added = available; break; } // range exhausted
        if (!initialTouched.has(n)) {
          backfillAdds.push({ lessonNo: n, attemptedAt: atMidnightZ(dISO) });
          addCount(dISO, 1);
          added++;
        }
        // if n was already touched, we skip adding but still advance pointer; try next number
      }
    }

    if (backfillAdds.length) {
      prog.failed = dedupByLessonNo([...prog.failed, ...backfillAdds]);
    }
    if (debug) console.log('[ensureDailyQueue] backfillAdds (from firstActive):', backfillAdds);
  }

  // ---- 5) Progress summary for **today**
  const completedToday = prog.completed.filter(x => day(x.completedAt) === todayISO).length;
  const doneToday = completedToday + freshCurrent.length;

  // ---- 6A) If we already have current for today → only persist if changed
  if (freshCurrent.length > 0) {
    const payload: LessonsDoc = {
      completed: prog.completed,
      failed: prog.failed,
      current: freshCurrent,
      currentDateISO: todayISO,
    };
    if (materiallyDifferent(raw, payload)) {
      const clean = stripUndefinedDeep(payload) as LessonsDoc;
      if (snap.exists()) await updateDoc(ref, clean as any);
      else await setDoc(ref, clean as any);
      if (debug) console.log('[ensureDailyQueue] wrote: already_has_current');
      return { wrote: true, reason: 'already_has_current', current: freshCurrent };
    }
    if (debug) console.log('[ensureDailyQueue] no-op: already_has_current');
    return { wrote: false, reason: 'already_has_current', current: freshCurrent };
  }

  // ---- 6B) Quota met today → ensure current = [] (after rollover/backfill)
  if (doneToday >= perDay) {
    const payload: LessonsDoc = {
      completed: prog.completed,
      failed: prog.failed,
      current: [],
      currentDateISO: todayISO,
    };
    if (materiallyDifferent(raw, payload)) {
      const clean = stripUndefinedDeep(payload) as LessonsDoc;
      if (snap.exists()) await updateDoc(ref, clean as any);
      else await setDoc(ref, clean as any);
      if (debug) console.log('[ensureDailyQueue] wrote: quota_met');
      return { wrote: true, reason: 'quota_met', current: [] };
    }
    if (debug) console.log('[ensureDailyQueue] no-op: quota_met');
    return { wrote: false, reason: 'quota_met', current: [] };
  }

  // ---- 6C) Need to assign today → ask decider for the next N (uses touched/seed)
  const dec = decideDailyQueue(
    { completed: prog.completed, failed: prog.failed, current: [] as LessonCurr[] },
    todayISO,
    levelRange,
    perDay
  );

  if (!dec.shouldWrite || dec.next.length === 0) {
    // Range exhausted (or decider chose nothing) → persist changes if any
    const payload: LessonsDoc = {
      completed: prog.completed,
      failed: prog.failed,
      current: [],
      currentDateISO: todayISO,
    };
    if (materiallyDifferent(raw, payload)) {
      const clean = stripUndefinedDeep(payload) as LessonsDoc;
      if (snap.exists()) await updateDoc(ref, clean as any);
      else await setDoc(ref, clean as any);
      if (debug) console.log('[ensureDailyQueue] wrote: no_more_lessons');
      return { wrote: true, reason: 'no_more_lessons', current: [] };
    }
    if (debug) console.log('[ensureDailyQueue] no-op: no_more_lessons');
    return { wrote: false, reason: 'no_more_lessons', current: [] };
  }

  // Assign today's current
  const newCurrent: LessonCurr[] = dec.next.map((n: number) => ({ lessonNo: n, LessonDate: todayISO }));
  const payload: LessonsDoc = {
    completed: prog.completed,
    failed: prog.failed,
    current: newCurrent,
    currentDateISO: todayISO,
  };

  if (materiallyDifferent(raw, payload)) {
    const clean = stripUndefinedDeep(payload) as LessonsDoc;
    if (snap.exists()) await updateDoc(ref, clean as any);
    else await setDoc(ref, clean as any);
    if (debug) console.log('[ensureDailyQueue] wrote: assigned', newCurrent);
    return { wrote: true, reason: 'assigned', current: newCurrent };
  }
  if (debug) console.log('[ensureDailyQueue] no-op: assigned', newCurrent);
  return { wrote: false, reason: 'assigned', current: newCurrent };
}
