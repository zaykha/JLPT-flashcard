// src/services/addFailedV1.ts
export async function addFailedLessons(
  uid: string,
  lessonNos: number[],
  dayISO?: string,
): Promise<{ wrote: boolean; failed: Array<{ lessonNo: number; attemptedAt: string }> }> {
  const [{ doc, getDoc, setDoc, updateDoc }, { db }] = await Promise.all([
    import('firebase/firestore'),
    import('@/lib/firebase'),
  ]);
  const { jstTodayISO } = await import('@/lib/cache/lessons');

  const ref = doc(db, 'users', uid, 'progress', 'lessons');
  const snap = await getDoc(ref);
  const data = (snap.exists() ? snap.data() : { completed: [], failed: [], current: [] }) as any;

  const isISODate = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const isoDay = isISODate(dayISO) ? String(dayISO) : undefined;
  const attemptedAt = isoDay ? `${isoDay}T00:00:00.000Z` : new Date().toISOString();
  const prevFailed: Array<any> = Array.isArray(data.failed) ? data.failed : [];

  const byNo = new Map<number, any>();
  for (const e of prevFailed) byNo.set(Number(e?.lessonNo), e);

  for (const n of lessonNos.map(Number).filter(Number.isFinite)) {
    if (!byNo.has(n)) {
      byNo.set(n, { lessonNo: n, attemptedAt, dayISO: isoDay ?? jstTodayISO() });
    }
  }

  const nextFailed = Array.from(byNo.values());

  if (!snap.exists()) {
    await setDoc(ref, { completed: [], failed: nextFailed, current: [] });
  } else {
    await updateDoc(ref, { failed: nextFailed });
  }

  // Mirror to bootstrap
  try {
    const { loadBootstrap, saveBootstrap } = await import('@/lib/bootstrap');
    const boot = loadBootstrap();
    if (boot) {
      const lp = boot.lessonProgress ?? { completed: [], failed: [], current: [], examsStats: [] };
      saveBootstrap({ ...boot, lessonProgress: { ...lp, failed: nextFailed }, cachedAt: Date.now() } as any);
      try {
        const { useSession } = await import('@/store/session');
        useSession.getState().bumpBootRevision?.();
      } catch {}
    }
  } catch {}

  return { wrote: true, failed: nextFailed };
}
