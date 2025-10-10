import { auth } from '@/lib/firebase';
import { ensureProfile, getLessonProgress, getSrsSummary, type JLPTLevelStr, type LessonProgress, type SrsSummary } from '@/lib/user-data';
import { getWallet } from '@/lib/api/wallet';
import { getLessonCatalogFromFirestore } from '@/lib/api/lessons';
import { loadLessonCatalog, saveLessonCatalog, type CachedLessonCatalog } from '@/lib/cache/lessons';
import { getTotalLessonsForLevel } from '@/lib/constants/lessons';
import type { LessonCatalog } from '@/lib/api/types';

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

function normalizeLessonProgress(progress: LessonProgress): LessonProgress {
  const normalizeItems = (items?: any[]) =>
    Array.isArray(items)
      ? items.map(item => ({
          ...(item.wordId ? { wordId: item.wordId } : {}),
          ...(item.grammarId ? { grammarId: item.grammarId } : {}),
          timeSec: item.timeSec ?? 0,
          correct: !!item.correct,
          nextReview: item.nextReview ?? null,
        }))
      : [];

  return {
    completed: Array.isArray(progress.completed)
      ? progress.completed.map(entry => ({
          lessonNo: entry.lessonNo, // ✅ use lessonNo consistently
          level: entry.level ?? null,
          completedAt: entry.completedAt ?? null,
          quiz: entry.quiz
            ? { durationSec: entry.quiz.durationSec ?? 0, items: normalizeItems(entry.quiz.items) }
            : undefined,
          grammarQuiz: entry.grammarQuiz
            ? { durationSec: entry.grammarQuiz.durationSec ?? 0, items: normalizeItems(entry.grammarQuiz.items) }
            : undefined,
        }))
      : [],
    failed: Array.isArray(progress.failed)
      ? progress.failed.map(entry => ({
          lessonNo: entry.lessonNo,
          level: entry.level ?? null,
          attemptedAt: entry.attemptedAt ?? null,
          quiz: entry.quiz
            ? { durationSec: entry.quiz.durationSec ?? 0, items: normalizeItems(entry.quiz.items) }
            : undefined,
          grammarQuiz: entry.grammarQuiz
            ? { durationSec: entry.grammarQuiz.durationSec ?? 0, items: normalizeItems(entry.grammarQuiz.items) }
            : undefined,
        }))
      : [],
    current: Array.isArray(progress.current)
      ? progress.current.map(num => String(num))
      : [],
    currentDateISO: typeof progress.currentDateISO === 'string' ? progress.currentDateISO : undefined,
  };
}

function normalizeSrs(summary: SrsSummary) {
  return {
    stages: Array.isArray(summary.stages)
      ? summary.stages.map(stage => ({
          stage: stage.stage,
          label: stage.label,
          nextReview: stage.nextReview ?? null,
          lessonNos: stage.lessonNos ?? [],
        }))
      : [],
    updatedAt: toMillis(summary.updatedAt),
  };
}

export async function fetchInitialSnapshot() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const uid = user.uid;

  const profilePromise = ensureProfile(uid, { nickname: user.displayName ?? 'Explorer' });
  const walletPromise = getWallet();
  const lessonProgressPromise = getLessonProgress(uid);
  const srsSummaryPromise = getSrsSummary(uid);

  const [profile, walletResponse, lessonProgress, srsSummary] = await Promise.all([
    profilePromise,
    walletPromise,
    lessonProgressPromise,
    srsSummaryPromise,
  ]);

  const level = profile.jlptLevel;
  const cachedCatalog = await loadLessonCatalog(level);
  let catalog = cachedCatalog;
  if (!catalog) {
    const remote = await getLessonCatalogFromFirestore(level);
    catalog = await saveLessonCatalog(level, remote);
  }

  const lessonCatalog = normalizeLessonCatalog(level, catalog);

  const snapshot = {
    profile: {
      uid,
      nickname: profile.nickname,
      avatarKey: profile.avatarKey ?? null,
      accountType: profile.accountType,
      jlptLevel: profile.jlptLevel,
      createdAt: toMillis(profile.createdAt),
      updatedAt: toMillis(profile.updatedAt),
    },
    wallet: walletResponse.wallet,
    lessonProgress: normalizeLessonProgress(lessonProgress),
    srsSummary: normalizeSrs(srsSummary),
    lessonCatalog,
    meta: {
      totalLessons: getTotalLessonsForLevel(level),
    },
  };

  console.info('[initialSnapshot]', snapshot);

  return snapshot;
}
