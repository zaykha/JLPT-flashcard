// src/helpers/progress.ts

import type { LessonProgress } from "@/types/lessonV1";


export type CurrentItem = { lessonNo: number; LessonDate: string };

export function normalizeCurrent(
  input: unknown,
  todayISO: string,
  fallbackDateISO?: string
): CurrentItem[] {
  if (!Array.isArray(input)) return [];
  return input.map((item: any) =>
    typeof item === 'object' && item && typeof item.lessonNo !== 'undefined'
      ? { lessonNo: Number(item.lessonNo), LessonDate: String(item.LessonDate ?? fallbackDateISO ?? todayISO) }
      : { lessonNo: Number(item), LessonDate: String(fallbackDateISO ?? todayISO) }
  );
}

export function computeCompletedSet(lp: Partial<LessonProgress>) {
  return new Set<number>(
    Array.isArray(lp.completed) ? lp.completed.map((c: any) => Number(c.lessonNo)) : []
  );
}

/** Pick the next N lessons after lastCompletedNo within [start, end], skipping completed. */
export function pickNextLessonsAfter(
  lastCompletedNo: number | undefined,
  range: { start: number; end: number },
  count: number,
  completed: Set<number>
): number[] {
  const start = Number.isFinite(lastCompletedNo) ? (lastCompletedNo as number) + 1 : range.start;
  const out: number[] = [];
  for (let n = start; n <= range.end && out.length < count; n += 1) {
    if (!completed.has(n)) out.push(n);
  }
  return out;
}
