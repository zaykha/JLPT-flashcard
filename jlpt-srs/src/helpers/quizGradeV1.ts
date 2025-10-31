// src/helpers/quizGrade.ts
import type { QuizItem } from '@/types/quiz';

export type GradeResult = {
  correct: boolean;
  your: string;
  expected: string;
};

export function gradeQuestion(
  question: QuizItem,
  answer: string | null,
  rightsOrder: Array<{ id: string; text: string }>
): GradeResult {
  if (question.type === 'matching') {
    const correct =
      rightsOrder.length === question.pairs.length &&
      rightsOrder.every((r, idx) => r.id === question.pairs[idx].sourceId);

    return {
      correct,
      your: rightsOrder.map(r => r.text).join(' | '),
      expected: question.pairs.map(p => p.right).join(' | ')
    };
  }

  const qWithChoices = question as Extract<QuizItem, { type: 'mcq' | 'kanjiToHiragana' | 'hiraganaToKanji' }>;
  const correct = (answer ?? '') === (qWithChoices.correct ?? '');
  return {
    correct,
    your: answer ?? '',
    expected: qWithChoices.correct ?? ''
  };
}
