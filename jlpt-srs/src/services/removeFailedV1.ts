// src/services/removeFailedV1.ts
export async function removeFailedLessons(
  uid: string,
  lessonNos: number[]
): Promise<{ wrote: boolean; failed: Array<{ lessonNo: number; attemptedAt?: string }> }> {
  const [{ doc, getDoc, setDoc, updateDoc }, { db }] = await Promise.all([
    import('firebase/firestore'),
    import('@/lib/firebase'),
  ]);

  const ref = doc(db, 'users', uid, 'progress', 'lessons');
  const snap = await getDoc(ref);
  const data = (snap.exists() ? snap.data() : { completed: [], failed: [], current: [] }) as any;

  const removeSet = new Set(lessonNos.map(n => Number(n)).filter(Number.isFinite));
  const prevFailed: Array<any> = Array.isArray(data.failed) ? data.failed : [];
  const nextFailed = prevFailed.filter((e: any) => !removeSet.has(Number(e?.lessonNo)));

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
      const prevBF: Array<any> = Array.isArray(lp.failed) ? lp.failed : [];
      const nextBF = prevBF.filter((e: any) => !removeSet.has(Number(e?.lessonNo)));
      saveBootstrap({ ...boot, lessonProgress: { ...lp, failed: nextBF }, cachedAt: Date.now() } as any);
      try {
        const { useSession } = await import('@/store/session');
        useSession.getState().bumpBootRevision?.();
      } catch {}
    }
  } catch {}

  return { wrote: true, failed: nextFailed };
}

