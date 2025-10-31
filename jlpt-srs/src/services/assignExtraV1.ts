// src/services/assignExtraV1.ts
export async function assignExtraLessonsForToday(
  uid: string,
  args: { levelRange: { start:number; end:number }, count: 2 | 3 }
): Promise<{ wrote:boolean; current: Array<{lessonNo:number; LessonDate:string}> }> {
  const [{ doc, getDoc, setDoc, updateDoc }, { db }] = await Promise.all([
    import('firebase/firestore'),
    import('@/lib/firebase'),
  ]);
  const { jstTodayISO } = await import('@/lib/cache/lessons');

  const ref = doc(db, 'users', uid, 'progress', 'lessons');
  const snap = await getDoc(ref);
  const prog = (snap.exists() ? snap.data() : { completed: [], failed: [], current: [] }) as any;

  const todayISO = jstTodayISO();

  // If there's already "current" we won't clobber it — user must finish those first.
  if (Array.isArray(prog.current) && prog.current.length > 0) {
    return { wrote:false, current: prog.current };
  }

  // Compute next strictly after max(completed ∪ failed)
  const touched = [
    ...(Array.isArray(prog.completed) ? prog.completed.map((e:any) => Number(e.lessonNo)) : []),
    ...(Array.isArray(prog.failed)    ? prog.failed.map((e:any) => Number(e.lessonNo))    : []),
  ].filter(n => Number.isFinite(n));
  const lastNo = touched.length ? Math.max(...touched) : (args.levelRange.start - 1);

  const nextNos:number[] = [];
  for (let n = lastNo + 1; n <= args.levelRange.end && nextNos.length < args.count; n++) {
    nextNos.push(n);
  }
  if (nextNos.length === 0) return { wrote:false, current: [] };

  const newCurrent = nextNos.map(n => ({ lessonNo:n, LessonDate: todayISO }));

  if (!snap.exists()) {
    await setDoc(ref, { completed: [], failed: [], current: newCurrent });
  } else {
    await updateDoc(ref, { current: newCurrent });
  }

  // Mirror to bootstrap immediately
  try {
    const { loadBootstrap, saveBootstrap } = await import('@/lib/bootstrap');
    const boot = loadBootstrap();
    if (boot) {
      saveBootstrap({
        ...boot,
        lessonProgress: {
          ...(boot.lessonProgress || {}),
          completed: boot.lessonProgress?.completed ?? prog.completed ?? [],
          failed:    boot.lessonProgress?.failed    ?? prog.failed    ?? [],
          current: newCurrent,
        },
        cachedAt: Date.now(),
      });
    }
  } catch {}

  return { wrote:true, current: newCurrent };
}
