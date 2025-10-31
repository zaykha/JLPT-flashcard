// src/helpers/sanitize.ts
import type { LessonQuizSnapshot } from '@/lib/user-data';

export function stripUndefinedDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function sanitizeSnapshot(s: LessonQuizSnapshot): LessonQuizSnapshot {
  return {
    durationSec: Number(s?.durationSec) || 0,
    items: Array.isArray(s?.items) ? s.items.map(it => ({
      ...(it.wordId ? { wordId: String(it.wordId) } : {}),
      ...(it.grammarId ? { grammarId: String(it.grammarId) } : {}),
      timeSec: Number(it.timeSec) || 0,
      correct: !!it.correct,
      ...(typeof it.nextReview === 'string' ? { nextReview: it.nextReview } : {}),
    })) : [],
  };
}
export function stripParentheses(text: string): string {
  // Removes everything inside parentheses (both halfwidth () and fullwidth （）)
  return text.replace(/\s*[\(（][^)）]*[\)）]\s*/g, '').trim();
}