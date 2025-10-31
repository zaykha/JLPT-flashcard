// src/services/progressReconcile.ts

import type { LessonProgress } from "@/types/lessonV1";
import { normalizeCurrent, computeCompletedSet, pickNextLessonsAfter } from "@/helpers/progressV1";
import { userDoc, updateDoc } from "@/lib/firestore/firestoreV1";
import { clampLessonHistory } from "@/helpers/historyV1";

export type LessonRange = { start: number; end: number };

export async function reconcileLessonProgressIfStale(opts: {
  uid: string;
  lp: Partial<LessonProgress> & { currentDateISO?: string };
  range: LessonRange | undefined;
  todayISO: string;
  lessonsPerDay?: number; // default 2
}): Promise<boolean> {
  const { uid, lp, todayISO } = opts;
  const lessonsPerDay = opts.lessonsPerDay ?? 2;
  const range = opts.range ?? { start: 1, end: 10_000 };

  const currentObjs = normalizeCurrent(lp.current, todayISO, lp.currentDateISO);
  const completedSet = computeCompletedSet(lp);
  const failed: any[] = Array.isArray(lp.failed) ? lp.failed.slice() : [];

  // Past items => mark failed if not completed
  const pastItems = currentObjs.filter(x => x.LessonDate < todayISO);
  const dateChanged = Boolean(lp.currentDateISO && lp.currentDateISO < todayISO && pastItems.length > 0);

  if (!dateChanged) return false;

  for (const item of pastItems) {
    if (!completedSet.has(item.lessonNo)) {
      failed.push({ lessonNo: item.lessonNo, attemptedAt: item.LessonDate });
    }
  }

  // Next lessons after last completed
  const lastCompletedNo = Math.max(
    ...((lp.completed || []).map((e: any) => e.lessonNo ?? -Infinity)),
    -Infinity
  );
  const nextNos = pickNextLessonsAfter(
    Number.isFinite(lastCompletedNo) ? (lastCompletedNo as number) : undefined,
    range,
    lessonsPerDay,
    completedSet
  );
  const newCurrent = nextNos.map(n => ({ lessonNo: n, LessonDate: todayISO }));

  const ref = userDoc(uid, 'progress', 'lessons');
  await updateDoc(ref, {
    current: newCurrent,
    // IMPORTANT: no currentDateISO write
    failed: clampLessonHistory(failed),
  } as any);

  return true;
}
