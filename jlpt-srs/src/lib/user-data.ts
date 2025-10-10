import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export type AccountType = 'normal' | 'premium';
export type Pace = 10 | 20 | 30 | 50;
export type JLPTLevelStr = 'N5'|'N4'|'N3'|'N2'|'N1';

export type UserProfile = {
  nickname: string;
  avatarKey?: string;
  accountType: AccountType;
  jlptLevel: JLPTLevelStr;
  createdAt?: any;
  updatedAt?: any;
};

export async function ensureProfile(uid: string, defaults: Partial<UserProfile> = {}): Promise<UserProfile> {
  const ref = doc(db, 'users', uid, 'meta', 'profile');
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const payload: UserProfile = {
      nickname: defaults.nickname ?? 'Explorer',
      avatarKey: defaults.avatarKey,
      accountType: defaults.accountType ?? 'normal',
      jlptLevel: defaults.jlptLevel ?? 'N5',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, payload);
    return payload;
  }
  const data = snap.data() as UserProfile;
  if (!data.accountType) {
    await updateDoc(ref, { accountType: defaults.accountType ?? 'normal', updatedAt: serverTimestamp() });
    data.accountType = defaults.accountType ?? 'normal';
  }
  return data;
}

export async function getProfile(uid: string) {
  return ensureProfile(uid);
}

export async function upsertProfile(uid: string, data: Partial<UserProfile>) {
  const ref = doc(db, 'users', uid, 'meta', 'profile');
  const snap = await getDoc(ref);
  const payload = { ...data, updatedAt: serverTimestamp() };
  if (snap.exists()) {
    await updateDoc(ref, payload as any);
  } else {
    await setDoc(ref, { ...data, accountType: data.accountType ?? 'normal', createdAt: serverTimestamp(), updatedAt: serverTimestamp() } as any);
  }
}

export type SRSItem = {
  id: string;
  next: string;
  step: number;
  due: string;
  last: string;
};

export type SRSMap = Record<string, SRSItem>;

export async function getSrsMap(uid: string): Promise<SRSMap> {
  const ref = doc(db, 'users', uid, 'progress', 'vocabSrs');
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as SRSMap) : {};
}

export async function saveSrsMap(uid: string, map: SRSMap) {
  const ref = doc(db, 'users', uid, 'progress', 'vocabSrs');
  await setDoc(ref, map, { merge: true });
}

export type LessonQuizItem = {
  wordId?: string;
  grammarId?: string;
  timeSec: number;
  correct: boolean;
  nextReview?: string;
};

export type LessonQuizSnapshot = {
  durationSec: number;
  items: LessonQuizItem[];
};

export type LessonCompletion = {
  // lessonId: string;
  lessonNo?: number;
  level?: JLPTLevelStr | null;
  completedAt: string;
  quiz?: LessonQuizSnapshot;
  grammarQuiz?: LessonQuizSnapshot;
};

export type LessonFailure = {
  lessonNo?: number;
  level?: JLPTLevelStr | null;
  attemptedAt: string;
  quiz?: LessonQuizSnapshot;
  grammarQuiz?: LessonQuizSnapshot;
};

export type LessonProgress = {
  completed: LessonCompletion[];
  failed: LessonFailure[];
  // NEW: per-day queue of lesson numbers (as strings)
  current?: string[];
  // NEW: the JST day this queue was created for
  currentDateISO?: string; // "YYYY-MM-DD"
};


const LESSON_PROGRESS_LIMIT = 400;

export async function getLessonProgress(uid: string): Promise<LessonProgress> {
  const ref = doc(db, 'users', uid, 'progress', 'lessons');
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const empty: LessonProgress = { completed: [], failed: [], current: [], currentDateISO: undefined };
    await setDoc(ref, empty);
    return empty;
  }
  const data = snap.data() as LessonProgress;
  return {
    completed: Array.isArray(data?.completed) ? data.completed : [],
    failed: Array.isArray(data?.failed) ? data.failed : [],
    current: Array.isArray(data?.current) ? data.current.map(String) : [],
    currentDateISO: typeof data?.currentDateISO === 'string' ? data.currentDateISO : undefined,
  };
}

function clampLessonHistory(list: LessonCompletion[] | LessonFailure[]): LessonCompletion[] | LessonFailure[] {
  return list
    .slice()
    .sort((a, b) => ('completedAt' in a ? (a.completedAt > (b as LessonCompletion).completedAt ? -1 : 1) : -1))
    .slice(0, LESSON_PROGRESS_LIMIT)
    .sort((a, b) => {
      const aTime = ('completedAt' in a ? a.completedAt : (a as LessonFailure).attemptedAt);
      const bTime = ('completedAt' in b ? (b as LessonCompletion).completedAt : (b as LessonFailure).attemptedAt);
      return aTime < bTime ? -1 : 1;
    });
}

export async function recordLessonCompletion(uid: string, completion: LessonCompletion) {
  const ref = doc(db, 'users', uid, 'progress', 'lessons');
  const progress = await getLessonProgress(uid);
  const existingIdx = progress.completed.findIndex(c => c.lessonNo === completion.lessonNo);
  if (existingIdx !== -1) {
    progress.completed[existingIdx] = completion;
  } else {
    progress.completed.push(completion);
  }
  progress.completed = clampLessonHistory(progress.completed) as LessonCompletion[];
  await setDoc(ref, progress, { merge: true });
}

export async function recordLessonFailure(uid: string, failure: LessonFailure) {
  const ref = doc(db, 'users', uid, 'progress', 'lessons');
  const progress = await getLessonProgress(uid);
  const existingIdx = progress.failed.findIndex(c => c.lessonNo === failure.lessonNo);
  if (existingIdx !== -1) {
    progress.failed[existingIdx] = failure;
  } else {
    progress.failed.push(failure);
  }
  progress.failed = clampLessonHistory(progress.failed) as LessonFailure[];
  await setDoc(ref, progress, { merge: true });
}

export type SrsStageSummary = {
  stage: number;
  label: string;
  nextReview: string | null;
  lessonNos: number[];
};

export type SrsSummary = {
  stages: SrsStageSummary[];
  updatedAt?: any;
};

const DEFAULT_STAGE_LABELS: Record<number, string> = {
  1: 'Apprentice I',
  2: 'Apprentice II',
  3: 'Apprentice III',
  4: 'Guru I',
  5: 'Guru II',
};

function createDefaultSrsSummary(): SrsSummary {
  const stages: SrsStageSummary[] = Object.entries(DEFAULT_STAGE_LABELS).map(([stage, label]) => ({
    stage: Number(stage),
    label,
    nextReview: null,
    lessonNos: [],
  }));
  return { stages, updatedAt: serverTimestamp() };
}

export async function getSrsSummary(uid: string): Promise<SrsSummary> {
  const ref = doc(db, 'users', uid, 'progress', 'srsSummary');
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const summary = createDefaultSrsSummary();
    await setDoc(ref, summary);
    return summary;
  }
  const data = snap.data() as SrsSummary;
  if (!Array.isArray(data?.stages) || data.stages.length === 0) {
    const summary = createDefaultSrsSummary();
    await setDoc(ref, summary);
    return summary;
  }
  return data;
}

export async function saveSrsSummary(uid: string, summary: SrsSummary) {
  const ref = doc(db, 'users', uid, 'progress', 'srsSummary');
  await setDoc(ref, { ...summary, updatedAt: serverTimestamp() }, { merge: true });
}
