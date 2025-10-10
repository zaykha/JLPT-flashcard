// src/lib/firestore/lessons.ts
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // adjust if your db export lives elsewhere
import type { LessonCatalog } from '@/lib/api/types';
import type { JLPTLevelStr } from '@/lib/user-data';

const LEVEL_RANGES: Record<JLPTLevelStr, { start: number; end: number }> = {
  N5: { start: 1, end: 66 },
  N4: { start: 67, end: 129 },
  N3: { start: 130, end: 309 },
  N2: { start: 310, end: 492 },
  N1: { start: 493, end: 838 },
};

export async function getLessonCatalogFromFirestore(level: JLPTLevelStr): Promise<LessonCatalog> {
  const { start, end } = LEVEL_RANGES[level];

  // Query: lessons where lessonNo is within the level’s range
  const q = query(
    collection(db, 'lessons'),
    where('lessonNo', '>=', start),
    where('lessonNo', '<=', end),
    orderBy('lessonNo', 'asc'),
  );

  const snap = await getDocs(q);

  const lessons = snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      lessonNo: data.lessonNo ?? Number(d.id),
      topic: data.topic ?? null,
      grammarIds: (data.grammarIds ?? []) as string[],
      vocabIds: (data.vocabIds ?? []) as string[],
    };
  });

  // pick the freshest updatedAt on the docs, fallback to now
  const updatedAt =
    snap.docs.reduce<number>((max, d) => {
      const t = (d.data() as any)?.updatedAt;
      return typeof t === 'number' && t > max ? t : max;
    }, 0) || Date.now();

  return {
    level,
    lessonRange: { start, end },
    updatedAt,
    lessons
  };
}
