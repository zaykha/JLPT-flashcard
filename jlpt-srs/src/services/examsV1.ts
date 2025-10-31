
// src/services/progressMutationV1.ts
export async function appendExamStats(uid: string, entry: {
  examDate: string;
  lessonNo: [number, number];
  examStats: { scorePercentage: number; timeTakenPerQuestionSec: number; totalQuestions: number; correct: number; durationSec?: number; }
}) {
  const [{ doc, runTransaction }, { db }] = await Promise.all([
    import('firebase/firestore'),
    import('@/lib/firebase'),
  ]);

  // Primary: 'lessons'
  const ref = doc(db, 'users', uid, 'progress', 'lessons');

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists() ? snap.data() : {};
    const lp = data; // this doc stores progress top-level

    const examsStats = Array.isArray(lp.examsStats) ? lp.examsStats : [];
    const exists = examsStats.some((x: any) =>
      String(x?.examDate ?? '').slice(0, 10) === entry.examDate.slice(0, 10)
    );
    if (exists) return;

    tx.set(ref, { ...lp, examsStats: [...examsStats, entry] }, { merge: true });
  });

  // Optional legacy mirror (safe to keep during transition)
  try {
    const [{ doc, runTransaction }, { db }] = await Promise.all([
      import('firebase/firestore'),
      import('@/lib/firebase'),
    ]);
    const legacyRef = doc(db, 'users', uid, 'progress', 'lessonProgress');
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(legacyRef);
      const data = snap.exists() ? snap.data() : {};
      const lp = ('lessonProgress' in data) ? data.lessonProgress : data;
      const examsStats = Array.isArray(lp.examsStats) ? lp.examsStats : [];
      const exists = examsStats.some((x: any) =>
        String(x?.examDate ?? '').slice(0, 10) === entry.examDate.slice(0, 10)
      );
      if (exists) return;
      const next = { ...lp, examsStats: [...examsStats, entry] };
      if ('lessonProgress' in data) {
        tx.set(legacyRef, { lessonProgress: next }, { merge: true });
      } else {
        tx.set(legacyRef, next, { merge: true });
      }
    });
  } catch (e) {
    console.warn('[appendExamStats] legacy mirror failed (ok to ignore during migration)', e);
  }
}
