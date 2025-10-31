import type { LessonFailure, LessonProgress } from "@/types/lessonV1";


/** Convert any ISO-like string to a 'YYYY-MM-DD' date in JST (+09:00). */
export function toJstDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  // JST = UTC+9 hours; DST not observed in Japan
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

/** Unique lessonNos attempted/completed "today" (JST). Prefer lessonId if present. */
export function getTodaysLessonNos(progress: any, todayISO: string): number[] {
  const completed = Array.isArray(progress?.completed) ? progress.completed : [];
  const failed    = Array.isArray(progress?.failed)    ? progress.failed    : [];

  const out: number[] = [];

  for (const e of completed) {
    const day = typeof e?.lessonId === 'string' ? e.lessonId : toJstDate(e?.completedAt);
    if (day === todayISO && Number.isFinite(e?.lessonNo)) out.push(Number(e.lessonNo));
  }
  for (const e of failed) {
    const day = toJstDate((e as any)?.attemptedAt);
    if (day === todayISO && Number.isFinite(e?.lessonNo)) out.push(Number(e.lessonNo));
  }

  // de-dup preserve order
  const seen = new Set<number>();
  return out.filter(n => (seen.has(n) ? false : (seen.add(n), true)));
}

export function lastTwo<T>(arr: T[]): [T, T] | null {
  return arr.length >= 2 ? [arr[arr.length - 2], arr[arr.length - 1]] : null;
}

// Robust: detect an exam recorded for a JST day
export function hasExamForDate(progress: any, dayISO: string): boolean {
  const list = Array.isArray(progress?.examsStats) ? progress.examsStats : [];
  for (const e of list) {
    const d = e?.examDay || (typeof e?.examDate === 'string' ? e.examDate.slice(0,10) : '');
    if (d === dayISO) return true;
  }
  return false;
}

// === Rollover: move yesterday's unfinished "current" to failed, then clear "current" ===
// Assumes lessonProgress shape: { completed: {lessonNo:number, dateISO:string}[], failed: same, current: {lessonNo:number, LessonDate:string}[] }

export function rolloverIncompleteToFailed(
  prog: LessonProgress,
  todayISO: string
): boolean {
  let changed = false;
  const normDate = (d?: string) => (d && d.length >= 10 ? d.slice(0, 10) : undefined);

  const completedSet = new Set(prog.completed.map(e => Number(e.lessonNo)));
  const failedSet = new Set(prog.failed.map(e => Number(e.lessonNo)));

  const keep: NonNullable<LessonProgress['current']> = [];
  for (const curr of prog.current ?? []) {
    const lessonNo = Number(curr.lessonNo);
    const dISO = normDate(curr.LessonDate);
    if (!Number.isFinite(lessonNo)) continue;

    if (dISO && dISO !== todayISO) {
      if (!completedSet.has(lessonNo) && !failedSet.has(lessonNo)) {
        // why: preserve when it happened
        prog.failed.push({ lessonNo, attemptedAt: dISO } as LessonFailure);
        failedSet.add(lessonNo);
        changed = true;
      }
      changed = true; // removed from current
    } else {
      keep.push(curr);
    }
  }
  if ((prog.current?.length ?? 0) !== keep.length) changed = true;
  prog.current = keep;

  prog.failed = dedupByLessonNo(prog.failed);
  prog.completed = dedupByLessonNo(prog.completed);

  return changed;
}

function dedupByLessonNo<T extends { lessonNo?: number }>(arr: T[]): T[] {
  const out: T[] = [];
  const seen = new Set<number>();
  for (const x of arr) {
    const n = Number(x.lessonNo);
    if (Number.isFinite(n) && !seen.has(n)) { out.push(x); seen.add(n); }
  }
  return out;
}

