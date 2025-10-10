import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { JLPTLevelStr } from '@/lib/user-data';
import type { LessonCatalog } from '@/lib/api/types';
import type { LessonProgress } from '@/lib/user-data';
import { jstTodayISO } from '@/lib/cache/lessons';

export function nextLessonNosFrom(lastCompletedNo: number | undefined, range: {start:number; end:number}, count: number) {
  const base = Number.isFinite(lastCompletedNo) ? (lastCompletedNo as number) + 1 : range.start;
  const out: number[] = [];
  for (let n = base; n <= range.end && out.length < count; n += 1) out.push(n);
  return out;
}

export async function ensureTodayQueue(
  uid: string,
  level: JLPTLevelStr,
  progress: LessonProgress,
  catalog: LessonCatalog,
  opts?: { perDay?: number }
): Promise<string[]> {
  const perDay = opts?.perDay ?? 2;
  const todayISO = jstTodayISO();
  const ref = doc(db, 'users', uid, 'progress', 'lessons');

  const lastCompletedNo = Math.max(...(progress?.completed?.map(e => e.lessonNo ?? -Infinity) ?? [-Infinity]));
  const sameDay = progress.currentDateISO === todayISO;

  // if queue is stale or missing, rebuild
  if (!sameDay || !Array.isArray(progress.current) || progress.current.length === 0) {
    const initial = nextLessonNosFrom(
      Number.isFinite(lastCompletedNo) ? lastCompletedNo : undefined,
      catalog.lessonRange,
      perDay
    ).map(String);

    const payload: Partial<LessonProgress> = {
      current: initial,
      currentDateISO: todayISO,
    };
    // upsert (create doc if got deleted)
    const snap = await getDoc(ref);
    if (!snap.exists()) await setDoc(ref, { completed: [], failed: [], ...payload });
    else await updateDoc(ref, payload as any);

    return initial;
  }

  // same day → use existing queue
  return progress.current.map(String);
}

/** Append extra lessons to today's queue (e.g., after purchase) */
export async function appendToTodayQueue(
  uid: string,
  lessonNos: number[] // will be stringified
) {
  const ref = doc(db, 'users', uid, 'progress', 'lessons');
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as LessonProgress;
  const current = Array.isArray(data.current) ? data.current.map(String) : [];
  const merged = Array.from(new Set([...current, ...lessonNos.map(String)]));
  await updateDoc(ref, { current: merged } as any);
}

/** Remove a lesson from today's queue (call on completion/failure if you want immediate removal) */
export async function removeFromTodayQueue(uid: string, lessonNo: number) {
  const ref = doc(db, 'users', uid, 'progress', 'lessons');
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data() as LessonProgress;
  const pruned = (data.current ?? []).map(String).filter(n => n !== String(lessonNo));
  await updateDoc(ref, { current: pruned } as any);
}
