// src/services/progressReadV1.ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type LessonProgressDoc = {
  lessonProgress?: {
    completed?: any[];
    failed?: any[];
    current?: any[];
    examsStats?: any[];
  };
  completed?: any[];
  failed?: any[];
  current?: any[];
  examsStats?: any[];
};

export async function readLessonProgress(uid: string) {
  // Support both possible doc IDs your code has referenced
  const candidates = [
    doc(db, 'users', uid, 'progress', 'lessonProgress'),
    doc(db, 'users', uid, 'progress', 'studyPlan'),
  ];

  for (const ref of candidates) {
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const raw = snap.data() as LessonProgressDoc;
        // Normalize to a single shape
        const lp = raw.lessonProgress ?? raw;
        return {
          completed: lp.completed ?? [],
          failed: lp.failed ?? [],
          current: lp.current ?? [],
          examsStats: lp.examsStats ?? [],
        };
      }
    } catch {}
  }
  return { completed: [], failed: [], current: [], examsStats: [] };
}
