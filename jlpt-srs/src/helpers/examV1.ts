// src/helpers/examV1.ts
type ProgressLite = {
  completed?: Array<{ lessonNo?: number; completedAt?: string; LessonDate?: string }>;
  failed?: Array<{ lessonNo?: number; completedAt?: string; LessonDate?: string }>;
  current?: Array<{ lessonNo: number; LessonDate: string }>;
  examsStats?: Array<{ examDate?: string; lessonNo?: number[] }>;
};

export function dayISO(d: Date = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function examDoneTodayFromBoot(progress: ProgressLite | undefined | null, todayISO: string): boolean {
  if (!progress || !Array.isArray(progress.examsStats)) return false;
  return progress.examsStats.some(x => String(x?.examDate ?? '').slice(0, 10) === todayISO);
}

export function lessonsDoneTodayCount(progress: ProgressLite | undefined | null, todayISO: string): number {
  const inDay = (t?: string) => String(t ?? '').slice(0, 10) === todayISO;
  const c = (progress?.completed ?? []).filter(e => inDay(e.completedAt ?? e.LessonDate)).length;
  const f = (progress?.failed ?? []).filter(e => inDay(e.completedAt ?? e.LessonDate)).length;
  return c + f;
}

export function isCurrentEmpty(progress: ProgressLite | undefined | null): boolean {
  return !Array.isArray(progress?.current) || progress!.current!.length === 0;
}
