// File: lib/syncLessonProgress.ts
// Full, drop-in utility to sync Firestore → local bootstrap, then bump revision.

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // adjust if needed
import type { LessonProgress, LessonCompletion, LessonFailure } from '@/types/lessonV1';
import type { JLPTLevelStr } from '@/types/userV1';
import { saveBootstrap, loadBootstrap } from '@/lib/bootstrap';
import { useSession } from '@/store/session';

// --- helpers copied locally (keep minimal)
const day = (s?: string) => (s ? s.slice(0, 10) : '');
const atMidnightZ = (isoDay: string) => `${isoDay}T00:00:00.000Z`;

type LessonCurr = { lessonNo: number; LessonDate: string };
type LessonsDoc = {
  completed?: LessonCompletion[];
  failed?: Array<
    | LessonFailure
    | { lessonNo?: number; level?: JLPTLevelStr | null; LessonDate?: string; attemptedAt?: string }
  >;
  current?: LessonCurr[];
  currentDateISO?: string;
  examsStats?: any[];
};

function normalizeLessonsDoc(doc?: LessonsDoc): LessonProgress {
  const d = doc ?? {};
  const completed = Array.isArray(d.completed) ? d.completed : [];

  // tolerate legacy failed entries with LessonDate
  const failedRaw = Array.isArray(d.failed) ? d.failed : [];
  const failed: LessonFailure[] = failedRaw
    .map((f: any) => ({
      lessonNo: Number.isFinite(Number(f?.lessonNo)) ? Number(f.lessonNo) : undefined,
      level: (f?.level as JLPTLevelStr | null | undefined) ?? null,
      attemptedAt: f?.attemptedAt ?? (f?.LessonDate ? atMidnightZ(day(f.LessonDate)) : undefined),
      quiz: f?.quiz,
      grammarQuiz: f?.grammarQuiz,
    }))
    .filter(Boolean) as LessonFailure[];

  const current = Array.isArray(d.current) ? d.current : [];

  return {
    completed,
    failed,
    current,
    currentDateISO: d.currentDateISO,
    examsStats: Array.isArray(d.examsStats) ? d.examsStats : [],
  };
}

/** Pulls lessons from Firestore, writes to bootstrap, bumps revision if changed. */
export async function syncLessonProgressFromFirestore(uid: string): Promise<boolean> {
  const ref = doc(db, 'users', uid, 'progress', 'lessons');
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;

  const remote = snap.data() as unknown as LessonsDoc;
  const progress = normalizeLessonsDoc(remote);

  const boot0 = loadBootstrap() ?? { cachedAt: 0 } as any;
  const next = { ...boot0, lessonProgress: progress, cachedAt: Date.now() };

  const changed = saveBootstrap(next); // your saveBootstrap returns boolean "changed"
  if (changed) {
    // notify UI to reload boot-derived data
    useSession.getState().bumpBootRevision?.();
  }
  return changed;
}
