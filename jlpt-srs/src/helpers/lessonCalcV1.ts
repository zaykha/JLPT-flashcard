import type { LessonQuizSnapshot } from "@/types/lessonV1";

export function pctCorrect(s?: LessonQuizSnapshot): number {
  if (!s || !Array.isArray(s.items) || s.items.length === 0) return 0;
  const right = s.items.filter(i => i.correct).length;
  return Math.round((right / s.items.length) * 100);
}
