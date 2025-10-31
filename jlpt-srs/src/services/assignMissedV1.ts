// src/services/assignMissedV1.ts
export async function assignMissedLessonsForToday(
  uid: string,
  lessonNos: number[]
): Promise<{ wrote: boolean; current: Array<{ lessonNo: number; LessonDate: string }> }> {
  const [{ doc, getDoc, setDoc, updateDoc }, { db }] = await Promise.all([
    import('firebase/firestore'),
    import('@/lib/firebase'),
  ]);
  const { jstTodayISO } = await import('@/lib/cache/lessons');

  const ref = doc(db, 'users', uid, 'progress', 'lessons');
  const snap = await getDoc(ref);
  const prog = (snap.exists() ? snap.data() : { completed: [], failed: [], current: [] }) as any;

  const todayISO = jstTodayISO();
  const prev: Array<{ lessonNo: number; LessonDate: string }> = Array.isArray(prog.current)
    ? prog.current.map((it: any) => ({ lessonNo: Number(it.lessonNo ?? it), LessonDate: String(it.LessonDate ?? todayISO) }))
    : [];

  const add = lessonNos
    .map(n => Number(n))
    .filter(n => Number.isFinite(n))
    .map(n => ({ lessonNo: n, LessonDate: todayISO }));

  const byNo = new Map<number, { lessonNo: number; LessonDate: string }>();
  for (const it of prev) byNo.set(it.lessonNo, it);
  for (const it of add) byNo.set(it.lessonNo, it);
  const next = Array.from(byNo.values());

  if (!snap.exists()) {
    await setDoc(ref, { completed: [], failed: [], current: next });
  } else {
    await updateDoc(ref, { current: next });
  }

  try {
    const { loadBootstrap, saveBootstrap } = await import('@/lib/bootstrap');
    const boot = loadBootstrap();
    if (boot) {
      const lp = boot.lessonProgress ?? { completed: [], failed: [], current: [], examsStats: [] };
      saveBootstrap({ ...boot, lessonProgress: { ...lp, current: next }, cachedAt: Date.now() });
    }
  } catch {}

  return { wrote: true, current: next };
}

