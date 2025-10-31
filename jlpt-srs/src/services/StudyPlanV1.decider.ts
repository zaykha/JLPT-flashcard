import type { LessonCompletion, LessonFailure } from "@/types/lessonV1";

// src/services/StudyPlanV1.decider.ts
export type Range = { start: number; end: number };

export type ProgLike = {
  completed?: LessonCompletion[];
  failed?: LessonFailure[];
  current?: Array<{ lessonNo: number; LessonDate: string }>;
};

const day = (s?: string) => (s ? s.slice(0, 10) : '');
const isInt = (n: unknown): n is number => Number.isFinite(n);

function doneTodayCount(prog: ProgLike, todayISO: string): number {
  const c = (prog.completed ?? []).filter(x => day(x.completedAt) === todayISO).length;
  const k = (prog.current ?? []).filter(x => day(x.LessonDate) === todayISO).length;
  return c + k;
}

function collectTouched(prog: ProgLike): Set<number> {
  const s = new Set<number>();
  for (const x of prog.completed ?? []) { const n = Number(x.lessonNo); if (isInt(n)) s.add(n); }
  for (const x of prog.failed ?? []) { const n = Number(x.lessonNo); if (isInt(n)) s.add(n); }
  for (const x of prog.current ?? []) { const n = Number(x.lessonNo); if (isInt(n)) s.add(n); }
  return s;
}

export function decideDailyQueue(
  prog: ProgLike,
  todayISO: string,
  range: Range,
  perDay: 2 | 3
): { shouldWrite: boolean; reason: 'quota_met' | 'ok' | 'no_more'; next: number[] } {
  // IMPORTANT: short-circuit quota first
  const done = doneTodayCount(prog, todayISO);
  if (done >= perDay) return { shouldWrite: false, reason: 'quota_met', next: [] };

  const need = perDay - done;
  const touched = collectTouched(prog);

  const touchedInRange = Array.from(touched).filter(n => n >= range.start && n <= range.end);
  const seed = touchedInRange.length ? Math.max(...touchedInRange) : range.start - 1;

  const next: number[] = [];
  for (let n = seed + 1; n <= range.end && next.length < need; n++) {
    if (!touched.has(n)) next.push(n);
  }

  if (next.length === 0) return { shouldWrite: false, reason: 'no_more', next: [] };
  return { shouldWrite: true, reason: 'ok', next };
}
