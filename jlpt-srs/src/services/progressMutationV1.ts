// src/services/progressMutationV1.ts
import { doc, getDoc, setDoc, updateDoc, arrayUnion, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { jstTodayISO } from '@/helpers/dateV1';

export type ExamStatsEntry = {
  examDate: string;                 // full ISO string
  lessonNo: [number, number];       // the two lessons
  examStats: {
    scorePercentage: number;        // e.g., 80
    timeTakenPerQuestionSec: number;// avg sec/question
    totalQuestions: number;
    correct: number;
    durationSec?: number;           // optional overall duration
  };
};

export async function appendCompletionAndSetCurrent(
  uid: string,
  completedEntry: any,
  newCurrent: Array<{ lessonNo: number; LessonDate: string }>
) {
  const ref = doc(db, 'users', uid, 'progress', 'lessons');
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      completed: [completedEntry],
      failed: [],
      current: newCurrent,
      examsStats: [],
    });
  } else {
    await updateDoc(ref, {
      completed: arrayUnion(completedEntry),
      current: newCurrent,
    } as any);
  }
}

/** Append a new examsStats row. Creates the doc if it doesn't exist. */
export async function appendExamStats(uid: string, entry: {
  examDate: string; // keep original timestamp (UTC ISO ok)
  lessonNo: [number, number];
  examStats: { scorePercentage: number; timeTakenPerQuestionSec: number; totalQuestions: number; correct: number; durationSec?: number; }
}) {
  // Write examsStats to the canonical lessons doc (not lessonProgress)
  const ref = doc(db, 'users', uid, 'progress', 'lessons');

  // Normalize a 'day' field in JST to make checks robust
  const examDay = jstTodayISO();
  const withDay = { ...entry, examDay };

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists() ? snap.data() : {};
    const lp = (data as any).lessonProgress ?? data; // support legacy nested shape if present

    const examsStats = Array.isArray(lp.examsStats) ? lp.examsStats : [];

    // Idempotent: if there's already an exam recorded for this JST day, bail
    const exists = examsStats.some((x: any) => {
      const day = x?.examDay || (typeof x?.examDate === 'string' ? x.examDate.slice(0,10) : '');
      return day === examDay;
    });
    if (exists) return;

    const next = { ...lp, examsStats: [...examsStats, withDay] } as any;

    if ('lessonProgress' in (data as any)) {
      tx.set(ref, { lessonProgress: next }, { merge: true });
    } else {
      tx.set(ref, next, { merge: true });
    }
  });
}

export function nextExamsStatsForWrite(
  existing: Array<{ examDate: string; lessonNo: [number, number] }>,
  entry: { examDate: string; lessonNo: [number, number] }
) {
  const day = entry.examDate.slice(0,10);
  const exists = (existing ?? []).some(x => String(x.examDate ?? '').slice(0,10) === day);
  return exists ? existing : [...(existing ?? []), entry];
}
