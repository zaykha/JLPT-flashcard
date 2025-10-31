// src/helpers/grammarText.ts
/** remove anything inside () or （） */
export function stripParentheses(text?: string): string {
  if (!text) return '';
  return text.replace(/\s*[\(（][^)）]*[\)）]\s*/g, '').trim();
}

/** keep only Hiragana/Katakana + prolonged mark ー (for mutation) */
export function extractKana(text?: string): string {
  if (!text) return '';
  return Array.from(text).filter(ch => /[\u3040-\u30FFー]/.test(ch)).join('');
}

/** pick example index 1 or 2 if present; else 0 */
export function pickExIdx(examples?: Array<unknown>): number {
  if (!examples || !examples.length) return 0;
  const cand = [1, 2].filter(i => examples[i]);
  if (cand.length) return cand[Math.floor(Math.random() * cand.length)];
  return 0;
}

/** small util */
export const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));
