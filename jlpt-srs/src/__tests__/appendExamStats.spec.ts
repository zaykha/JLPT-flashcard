import { describe, it, expect, beforeEach } from 'vitest';
import { appendExamStats } from '@/services/progressMutationV1';

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { mem } from '@/test/mem';


const T = '2025-10-18';

beforeEach(() => mem.clear());

describe('appendExamStats', () => {
  it('is idempotent per day', async () => {
    const ref = doc(db as any, 'users', 'u1', 'progress', 'lessonProgress');
    await setDoc(ref, { lessonProgress: { completed: [], failed: [], current: [], examsStats: [] } });

    const entry = {
      examDate: `${T}T12:00:00Z`,
      lessonNo: [130, 131] as [number, number],
      examStats: { scorePercentage: 80, timeTakenPerQuestionSec: 5, totalQuestions: 20, correct: 16 },
    };

    await appendExamStats('u1', entry);
    await appendExamStats('u1', entry); // second time should no-op

    const snap = await getDoc(ref);
    const lp = (snap.data() as any).lessonProgress;
    expect(lp.examsStats).toHaveLength(1);
  });
});
