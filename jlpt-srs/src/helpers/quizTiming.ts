import type { QuizResultItem } from "@/types/quiz";


export function calcAvgSec(results: QuizResultItem[], onlyWhenPerfect = true): number | null {
  if (!results.length) return null;
  if (onlyWhenPerfect && results.some(r => !r.correct)) return null;
  const times = results.map(r => Number(r.timeMs ?? 0)).filter(n => Number.isFinite(n));
  if (!times.length) return 0;
  const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
  return Math.round(avgMs / 1000);
}
