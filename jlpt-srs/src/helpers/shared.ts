// helpers/shared.ts
import type { QuizItem } from '@/types/quiz';

export function hasPrompt(q: QuizItem): q is Extract<QuizItem, { prompt: string }> {
  return (q as any).prompt !== undefined;
}

export function lastTwo<T>(arr: T[]): [T, T] | null {
  return arr.length >= 2 ? [arr[arr.length - 2], arr[arr.length - 1]] : null;
}

export function dayISO(s?: string | null) {
  return (s ?? '').slice(0, 10);
}
