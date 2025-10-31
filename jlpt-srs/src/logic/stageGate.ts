export type LessonProgress = {
  completed?: Array<{ lessonNo: number; completedAt?: string; lessonId?: string; LessonDate?: string }>;
  failed?: Array<{ lessonNo: number; attemptedAt?: string; LessonDate?: string }>;
  current?: Array<{ lessonNo: number; LessonDate: string }>;
  examsStats?: Array<{ examDate: string }>;
};

export function toDayISO(s?: string | null) {
  return (s ?? '').slice(0, 10);
}

export function getTodaysLessonNos(progress: LessonProgress | any, todayISO: string) {
  const out: number[] = [];
  for (const e of progress?.completed ?? []) {
    const day = e.lessonId ?? toDayISO(e.completedAt ?? e.LessonDate);
    if (day === todayISO && Number.isFinite(e.lessonNo)) out.push(Number(e.lessonNo));
  }
  for (const e of progress?.failed ?? []) {
    const day = toDayISO(e.attemptedAt ?? e.LessonDate);
    if (day === todayISO && Number.isFinite(e.lessonNo)) out.push(Number(e.lessonNo));
  }
  // de-dup
  const seen = new Set<number>();
  return out.filter(n => (seen.has(n) ? false : (seen.add(n), true)));
}

export function lastTwo<T>(arr: T[]): [T, T] | null {
  return arr.length >= 2 ? [arr[arr.length - 2], arr[arr.length - 1]] : null;
}

export function hasExamForDate(progress: LessonProgress | any, todayISO: string) {
  return Array.isArray(progress?.examsStats)
    ? progress.examsStats.some((e: any) => toDayISO(e?.examDate) === todayISO)
    : false;
}

/** The core decision used across pages/stores. */
export function decideStageFromProgress(
  progress: LessonProgress,
  todayISO: string,
  perDay: number
): { stage: 'studying' | 'examFresher' | 'buy' | 'idle'; pair?: [number, number]; reason: string } {
  const currentEmpty = !Array.isArray(progress.current) || progress.current.length === 0;
  const todaysNos = getTodaysLessonNos(progress, todayISO);
  const quotaMet = todaysNos.length >= perDay;
  const examDone = hasExamForDate(progress, todayISO);

  if (currentEmpty && quotaMet) {
    if (examDone) return { stage: 'buy', reason: 'quota_met_exam_done' };
    const pair = lastTwo(todaysNos);
    if (pair) return { stage: 'examFresher', pair, reason: 'quota_met_no_exam' };
    return { stage: 'idle', reason: 'quota_met_but_no_pair' };
  }

  if (!currentEmpty) return { stage: 'studying', reason: 'has_current' };
  return { stage: 'studying', reason: 'need_assignments' };
}
