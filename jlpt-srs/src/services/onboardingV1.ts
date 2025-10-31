// src/services/onboarding.ts

import { jstTodayISO } from "@/helpers/dateV1";
import { db, doc, getDoc, setDoc } from "@/lib/firestore/firestoreV1";

/**
 * Use ONLY during onboarding.
 * Writes the lesson progress skeleton in a single write (no read/merge).
 */
export async function createInitialLessonProgress(
  uid: string,
  levelRange: { start: number; end: number },
  perDay: 2 | 3 = 2
) {
  const ref = doc(db, 'users', uid, 'progress', 'lessons');
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const today = jstTodayISO();
  const nos: number[] = [];
  for (let n = levelRange.start; n <= levelRange.end && nos.length < perDay; n += 1) nos.push(n);

  const current = nos.map(n => ({ lessonNo: n, LessonDate: today }));

  await setDoc(ref, {
    completed: [],
    failed: [],
    current,
    currentDateISO: today, // optional legacy field, ok to keep or drop
    examsStats: [],
  });
}
