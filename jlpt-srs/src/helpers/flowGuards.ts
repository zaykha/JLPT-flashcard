// src/helpers/flowGuards.ts
export type FlowStage =
  | 'studying'
  | 'examFresher'
  | 'buy'            // used only by HomePage to show the buy popup decision
  | 'unknown';

type MinimalProgress = {
  completed?: Array<{ lessonNo: number; completedAt?: string; LessonDate?: string }>;
  failed?: Array<{ lessonNo: number; attemptedAt?: string; LessonDate?: string }>;
  current?: Array<{ lessonNo: number; LessonDate: string }>;
  examsStats?: Array<{ examDate: string; lessonNo: [number, number] }>;
};

function toDay(s?: string) {
  return s ? String(s).slice(0, 10) : '';
}

/**
 * Compute lesson count done today (completed+failed).
 */
export function countLessonsDoneToday(
  progress: MinimalProgress,
  todayISO: string
) {
  const comp = (progress.completed ?? []).filter(
    e => toDay(e.completedAt ?? e.LessonDate) === todayISO
  ).length;
  const fail = (progress.failed ?? []).filter(
    e => toDay((e as any).attemptedAt ?? e.LessonDate) === todayISO
  ).length;
  return comp + fail;
}

/**
 * True if an exam record already exists for today.
 */
export function examTakenToday(progress: MinimalProgress, todayISO: string) {
  const arr = progress.examsStats ?? [];
  return arr.some(x => toDay(x.examDate) === todayISO);
}

/**
 * Decide next *intent* stage for the day from one snapshot.
 * - If current is empty AND 2 lessons done and no exam yet → examFresher
 * - If current is empty AND 2 lessons + exam done → buy
 * - Otherwise → studying
 */
export function resolveStageFromProgress(
  progress: MinimalProgress,
  todayISO: string,
  perDay: number
): FlowStage {
  const currentEmpty = !Array.isArray(progress.current) || progress.current.length === 0;
  const done = countLessonsDoneToday(progress, todayISO);
  const quotaMet = done >= perDay;
  const examDone = examTakenToday(progress, todayISO);

  if (currentEmpty && quotaMet) {
    return examDone ? 'buy' : 'examFresher';
  }
  return 'studying';
}
