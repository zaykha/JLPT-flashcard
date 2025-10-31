import type { QuizItem } from '@/types/quiz';

export function isChoiceQuestion(
  q: QuizItem
): q is Extract<QuizItem, { type: 'mcq' | 'kanjiToHiragana' | 'hiraganaToKanji' }> {
  return q.type === 'mcq' || q.type === 'kanjiToHiragana' || q.type === 'hiraganaToKanji';
}
