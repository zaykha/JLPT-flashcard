import type { QuizItem, QuizResultItem } from '@/types/quiz';

// Phase narrows how we name the id in the snapshot items
type Phase = 'vocab' | 'grammar';

type Result = {
  id: string;
  correct: boolean;
  your?: string;
  expected?: string;
  timeSec?: number; // new
};

export type LessonQuizSnapshot = {
  durationSec: number;
  items: Array<
    | { wordId: string; timeSec: number; correct: boolean; nextReview?: string | null }
    | { grammarId: string; timeSec: number; correct: boolean; nextReview?: string | null }
  >;
};

export function buildLessonSnapshot(
  quiz: QuizItem[],
  results: QuizResultItem[],
  phase: 'vocab' | 'grammar',
  durationSec: number
) {
  // Map results by id for quick lookup
  const byId = new Map(results.map(r => [r.id, r]));

  return {
    phase,
    durationSec,
    items: quiz.map(q => {
      const r = byId.get(q.id);
      // Use measured time when available
      const timeSec = r?.timeMs != null ? Math.max(0, Math.round(r.timeMs / 1000)) : undefined;

      // Persist by source (wordId/grammarId) if available
      const base: any = {
        timeSec: timeSec ?? 0,
        correct: !!r?.correct,
        nextReview: null, // fill later if you have SRS calc
      };

      if (q.type === 'matching') {
        // For matching, you may want to persist multiple wordIds.
        // As a simple approach: one entry per pair
        return q.pairs.map(p => ({ ...base, wordId: p.sourceId }));
      } else {
        // MCQ variants
        return [{ ...base, wordId: (q as any).sourceId, grammarId: undefined }];
      }
    }).flat(),
  };
}
