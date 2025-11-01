import { auth } from '@/lib/firebase';
// import { ensureProfile, getLessonProgress, getSrsSummary, type JLPTLevelStr, type LessonProgress, type SrsSummary } from '@/lib/user-data';
import { getWallet } from '@/lib/api/wallet';
import { getLessonCatalogFromFirestore } from '@/lib/api/lessons';
import { loadLessonCatalog, saveLessonCatalog, type CachedLessonCatalog } from '@/lib/cache/lessons';
import { getTotalLessonsForLevel } from '@/lib/constants/lessons';
import type { LessonCatalog } from '@/lib/api/types';
import type { JLPTLevelStr } from '@/types/userV1';
import type { LessonProgress, SrsSummary } from '@/types/lessonV1';
import { getLessonProgress } from '@/services/progressV1';
import { getSrsSummary } from '@/services/srsV1';
import { initLessonPacks, initLessonPacksFromBoot, resetLessonPacks } from '@/services/lesson-Packs';

function toMillis(value: any): number | null {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Date.parse(value);
  if (typeof value.toMillis === 'function') return value.toMillis();
  return null;
}

function normalizeLessonCatalog(level: JLPTLevelStr | null, cached: CachedLessonCatalog | null = null): LessonCatalog | null {
  if (!level || !cached) return null;
  return {
    level,
    lessonRange: cached.lessonRange,
    lessons: cached.lessons,
    updatedAt: cached.updatedAt ?? null,
  };
}

function normalizeLessonProgress(progress: any): LessonProgress {
  const normalizeItems = (items?: any[]) =>
    Array.isArray(items)
      ? items.map(item => ({
          ...(item.wordId ? { wordId: item.wordId } : {}),
          ...(item.grammarId ? { grammarId: item.grammarId } : {}),
          timeSec: Number(item.timeSec ?? 0),
          correct: !!item.correct,
          nextReview: item.nextReview ?? null,
        }))
      : [];

  const normalizeCompleted = Array.isArray(progress?.completed)
    ? progress.completed.map((entry: any) => ({
        lessonNo: Number(entry.lessonNo),
        level: entry.level ?? null,
        completedAt: entry.completedAt ?? null,
        quiz: entry.quiz
          ? { durationSec: Number(entry.quiz.durationSec ?? 0), items: normalizeItems(entry.quiz.items) }
          : undefined,
        grammarQuiz: entry.grammarQuiz
          ? { durationSec: Number(entry.grammarQuiz.durationSec ?? 0), items: normalizeItems(entry.grammarQuiz.items) }
          : undefined,
      }))
    : [];

  const normalizeFailed = Array.isArray(progress?.failed)
    ? progress.failed.map((entry: any) => ({
        lessonNo: Number(entry.lessonNo),
        level: entry.level ?? null,
        attemptedAt: entry.attemptedAt ?? null,
        quiz: entry.quiz
          ? { durationSec: Number(entry.quiz.durationSec ?? 0), items: normalizeItems(entry.quiz.items) }
          : undefined,
        grammarQuiz: entry.grammarQuiz
          ? { durationSec: Number(entry.grammarQuiz.durationSec ?? 0), items: normalizeItems(entry.grammarQuiz.items) }
          : undefined,
      }))
    : [];

  const normalizeCurrent = Array.isArray(progress?.current)
    ? progress.current.map((item: any) =>
        (item && typeof item === 'object' && typeof item.lessonNo !== 'undefined')
          ? { lessonNo: Number(item.lessonNo), LessonDate: String(item.LessonDate ?? progress.currentDateISO ?? new Date().toISOString().slice(0, 10)) }
          : { lessonNo: Number(item), LessonDate: String(progress.currentDateISO ?? new Date().toISOString().slice(0, 10)) }
      )
    : [];

  // --- NEW: normalize examsStats
  const normalizeExamsStats = (() => {
    const list = Array.isArray(progress?.examsStats) ? progress.examsStats : [];
    return list
      .map((e: any) => {
        const a = Array.isArray(e?.lessonNo) ? e.lessonNo : [];
        const a0 = Number(a[0]); const a1 = Number(a[1]);
        const validPair = Number.isFinite(a0) && Number.isFinite(a1);
        const stats = e?.examStats ?? {};
        return {
          examDate: String(e?.examDate ?? new Date().toISOString()),
          lessonNo: validPair ? [a0, a1] as [number, number] : [NaN, NaN] as [number, number],
          examStats: {
            scorePercentage: Number(stats.scorePercentage ?? 0),
            timeTakenPerQuestionSec: Number(stats.timeTakenPerQuestionSec ?? 0),
            totalQuestions: Number(stats.totalQuestions ?? 0),
            correct: Number(stats.correct ?? 0),
            ...(stats.durationSec != null ? { durationSec: Number(stats.durationSec) } : {}),
          },
        };
      })
      .filter((e: any) => Number.isFinite(e.lessonNo[0]) && Number.isFinite(e.lessonNo[1]));
  })();

  return {
    completed: normalizeCompleted,
    failed: normalizeFailed,
    current: normalizeCurrent,
    currentDateISO: typeof progress?.currentDateISO === 'string' ? progress.currentDateISO : undefined,
    examsStats: normalizeExamsStats, // ✅ keep it!
  };
}

function normalizeSrs(summary: SrsSummary) {
  return {
    stages: Array.isArray(summary.stages)
      ? summary.stages.map(stage => ({
          stage: stage.stage,
          label: stage.label,
          lessons: Array.isArray((stage as any).lessons)
            ? (stage as any).lessons.map((l: any) => ({
                lessonNo: Number(l.lessonNo),
                nextReview: typeof l.nextReview === 'string' ? l.nextReview : null,
              }))
            : [],
        }))
      : [],
    updatedAt: toMillis((summary as any).updatedAt),
  };
}

export async function fetchInitialSnapshot() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const uid = user.uid;

  // Parallel fetches
  const [profileMaybe, _walletResponse, lessonProgressRaw, srsSummary] = await Promise.all([
    // Do NOT create a profile if it doesn't exist. We'll route to onboarding first.
    (async () => {
      try {
        const { getDoc } = await import('firebase/firestore');
        const { userDoc } = await import('@/lib/firestore/firestoreV1');
        const ref = userDoc(uid, 'meta', 'profile');
        const snap = await getDoc(ref);
        return snap.exists() ? (snap.data() as any) : null;
      } catch {
        return null;
      }
    })(),
    getWallet().catch(() => ({ wallet: null, transactions: [] } as any)),
    getLessonProgress(uid),    // may read users/{uid}/progress/lessons depending on your service
    getSrsSummary(uid),
  ]);

  // Ensure we have a catalog
  const level: JLPTLevelStr | null = (profileMaybe?.jlptLevel as JLPTLevelStr | undefined) ?? null;
  let lessonCatalog: LessonCatalog | null = null;
  if (level) {
    const cachedCatalog = await loadLessonCatalog(level);
    let catalog = cachedCatalog;
    if (!catalog) {
      const remote = await getLessonCatalogFromFirestore(level);
      catalog = await saveLessonCatalog(level, remote);
    }
    lessonCatalog = normalizeLessonCatalog(level, catalog);
  }

  // ---- Merge examsStats if missing / stored in the “other” doc
  let mergedProgress: any = lessonProgressRaw ?? {};
  if (!Array.isArray(mergedProgress.examsStats) || mergedProgress.examsStats.length === 0) {
    try {
      const [{ doc, getDoc }, { db }] = await Promise.all([
        import('firebase/firestore'),
        import('@/lib/firebase'),
      ]);

      // Prefer the doc your app uses elsewhere (likely "lessons")
      const refLessons = doc(db, 'users', uid, 'progress', 'lessons');
      const snapLessons = await getDoc(refLessons);

      const refLegacy = doc(db, 'users', uid, 'progress', 'lessonProgress');
      const snapLegacy = await getDoc(refLegacy);

      const examsFromLessons = snapLessons.exists() && Array.isArray((snapLessons.data() as any)?.examsStats)
        ? (snapLessons.data() as any).examsStats
        : [];

      const examsFromLegacy = snapLegacy.exists() && Array.isArray((snapLegacy.data() as any)?.examsStats)
        ? (snapLegacy.data() as any).examsStats
        : [];

      const chosen = (examsFromLessons?.length ?? 0) > 0
        ? examsFromLessons
        : examsFromLegacy;

      if ((chosen?.length ?? 0) > 0) {
        mergedProgress = { ...mergedProgress, examsStats: chosen };
      }
    } catch (e) {
      console.warn('[initialSnapshot] examsStats fallback read failed', e);
    }
  }
  
  const lessonProgress = normalizeLessonProgress(mergedProgress);
  // ✅ Initialize lesson packs service *with* the boot-ish shape it expects
  try {
    await initLessonPacksFromBoot({
      catalogLevel: (level ?? undefined) as any,          // JLPTLevelStr (narrowed above)
      lessonProgress,               // normalized progress (has completed/current)
    });
  } catch (e) {
    console.error('[initial-fetch] initLessonPacksFromBoot failed:', e);
    // Non-fatal; UI can still render
  }

  // Normalize wallet shape from API (may be legacy) and fallback to Firestore if missing
  const WALLET_ENABLED = import.meta.env.VITE_WALLET_ENABLED === 'true';
  // Prefer Firestore (new structure) if enabled; otherwise omit wallet
  let walletNorm: any = null;
  let txNorm: any[] = [];
  if (WALLET_ENABLED) {
    try {
      const [{ doc, getDoc, collection, getDocs, orderBy, limit, query }, { db }] = await Promise.all([
        import('firebase/firestore'),
        import('@/lib/firebase'),
      ]);
      const wRef = doc(db, 'users', uid, 'wallet', 'meta');
      const snap = await getDoc(wRef);
      const data = snap.data() as any | undefined;
      walletNorm = data
        ? {
            shards: typeof data.shards === 'number' ? data.shards : 0,
            updatedAt: data.updatedAt,
            premium: data.premium
              ? {
                  status: data.premium.status ?? 'none',
                  subscriptionId: data.premium.subscriptionId ?? undefined,
                  currentPeriodEnd: data.premium.currentPeriodEnd,
                }
              : undefined,
          }
        : null;

      const txQ = query(collection(wRef, 'transactions'), orderBy('createdAt', 'desc'), limit(10));
      const txSnap = await getDocs(txQ);
      txNorm = txSnap.docs.map((d) => {
        const row = d.data() as any;
        return {
          id: d.id,
          type: String(row.type ?? ''),
          amount: Number(row.amount ?? 0),
          balanceAfter: typeof row.balanceAfter === 'number' ? row.balanceAfter : undefined,
          source: row.source,
          note: row.note,
          createdAt: row.createdAt,
        } as any;
      });
    } catch (e) {
      console.warn('[initialSnapshot] wallet Firestore fallback failed', e);
      walletNorm = null;
      txNorm = [];
    }
  }

  // Normalize EVERYTHING (now includes examsStats)

  const snapshot = {
    profile: {
      uid,
      nickname: profileMaybe?.nickname ?? null,
      avatarKey: profileMaybe?.avatarKey ?? null,
      accountType: profileMaybe?.accountType ?? 'normal',
      jlptLevel: (profileMaybe?.jlptLevel as any) ?? undefined,
      createdAt: toMillis(profileMaybe?.createdAt),
      updatedAt: toMillis(profileMaybe?.updatedAt),
    },
    wallet: walletNorm,
    lessonProgress,
    srsSummary: normalizeSrs(srsSummary),
    lessonCatalog,
    meta: {
      totalLessons: getTotalLessonsForLevel(level),
    },
  };

  console.info('[initialSnapshot]', snapshot);
  return snapshot;
}

// if you ever hard-refresh boot data:
export async function reloadBootstrapAndPacks() {
  // …refresh boot…
  resetLessonPacks();
  await initLessonPacks();
}
