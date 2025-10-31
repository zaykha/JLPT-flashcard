// import { db } from '@/lib/firebase';
// import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// export type AccountType = 'normal' | 'premium';
// export type JLPTLevelStr = 'N5'|'N4'|'N3'|'N2'|'N1';

// export type UserProfile = {
//   nickname: string;
//   avatarKey?: string;
//   accountType: AccountType;
//   jlptLevel: JLPTLevelStr;
//   createdAt?: any;
//   updatedAt?: any;
// };
// export type LessonQuizItem = {
//   wordId?: string;
//   grammarId?: string;
//   timeSec: number;
//   correct: boolean;
//   nextReview?: string;
// };
// export type LessonQuizSnapshot = {
//   durationSec: number;
//   items: LessonQuizItem[];
// };
// export type LessonCompletion = {
//   // lessonId: string;
//   lessonNo?: number;
//   level?: JLPTLevelStr | null;
//   completedAt: string;
//   quiz?: LessonQuizSnapshot;
//   grammarQuiz?: LessonQuizSnapshot;
// };
// export type LessonFailure = {
//   lessonNo?: number;
//   level?: JLPTLevelStr | null;
//   attemptedAt: string;
//   quiz?: LessonQuizSnapshot;
//   grammarQuiz?: LessonQuizSnapshot;
// };
// export type LessonProgress = {
//   completed: LessonCompletion[];
//   failed: LessonFailure[];
//   // per-day queue of lesson entries with dates
//   current?: Array<{ lessonNo: number; LessonDate: string }>;
//   // the JST day this queue was created for
//   currentDateISO?: string; // "YYYY-MM-DD"
// };
// export type SrsStageLesson = { lessonNo: number; nextReview: string };
// export type SrsStageSummary = {
//   stage: number;
//   label: string;
//   lessons: SrsStageLesson[];
// };
// export type SrsSummary = {
//   stages: SrsStageSummary[];
//   updatedAt?: any;
// };

// const STEPS = [3, 7, 14, 20, 30];
// const LESSON_PROGRESS_LIMIT = 400;
// const DEFAULT_STAGE_LABELS: Record<number, string> = {
//   1: 'Apprentice I',
//   2: 'Apprentice II',
//   3: 'Apprentice III',
//   4: 'Guru I',
//   5: 'Guru II',
// };
// const SRS_INTERVALS_MS: Record<number, number> = {
//   1: 3 * 24 * 60 * 60 * 1000,        
//   2: 7 * 24 * 60 * 60 * 1000,           
//   3: 14 * 24 * 60 * 60 * 1000,        
//   4: 20 * 24 * 60 * 60 * 1000,      
//   5: 30 * 24 * 60 * 60 * 1000,      
// };
// export async function ensureProfile(uid: string, defaults: Partial<UserProfile> = {}): Promise<UserProfile> {
//   const ref = doc(db, 'users', uid, 'meta', 'profile');
//   const snap = await getDoc(ref);
//   if (!snap.exists()) {
//     const payload: UserProfile = {
//       nickname: defaults.nickname ?? 'Explorer',
//       avatarKey: defaults.avatarKey,
//       accountType: defaults.accountType ?? 'normal',
//       jlptLevel: defaults.jlptLevel ?? 'N5',
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     };
//     await setDoc(ref, payload);
//     return payload;
//   }
//   const data = snap.data() as UserProfile;
//   if (!data.accountType) {
//     await updateDoc(ref, { accountType: defaults.accountType ?? 'normal', updatedAt: serverTimestamp() });
//     data.accountType = defaults.accountType ?? 'normal';
//   }
//   return data;
// }

// export async function getProfile(uid: string) {
//   return ensureProfile(uid);
// }

// export async function upsertProfile(uid: string, data: Partial<UserProfile>) {
//   const ref = doc(db, 'users', uid, 'meta', 'profile');
//   const snap = await getDoc(ref);
//   const payload = { ...data, updatedAt: serverTimestamp() };
//   if (snap.exists()) {
//     await updateDoc(ref, payload as any);
//   } else {
//     await setDoc(ref, { ...data, accountType: data.accountType ?? 'normal', createdAt: serverTimestamp(), updatedAt: serverTimestamp() } as any);
//   }
// }

// export async function getLessonProgress(uid: string): Promise<LessonProgress> {
//   const ref = doc(db, 'users', uid, 'progress', 'lessons');
//   const snap = await getDoc(ref);
//   if (!snap.exists()) {
//     // Firestore does not allow undefined values. Omit currentDateISO on create.
//     const empty = { completed: [] as LessonCompletion[], failed: [] as LessonFailure[], current: [] as Array<{lessonNo:number; LessonDate:string}> };
//     await setDoc(ref, empty as any);
//     return empty;
//   }
//   const raw = snap.data() as any;
//   const todayISO = (() => {
//     try { return require('@/lib/cache/lessons').jstTodayISO(); } catch { return new Date().toISOString().slice(0,10); }
//   })();
//   const currentArr: Array<{ lessonNo:number; LessonDate:string }> = Array.isArray(raw?.current)
//     ? raw.current.map((item: any) => (
//         typeof item === 'object' && item && typeof item.lessonNo !== 'undefined'
//           ? { lessonNo: Number(item.lessonNo), LessonDate: String(item.LessonDate ?? raw.currentDateISO ?? todayISO) }
//           : { lessonNo: Number(item), LessonDate: String(raw.currentDateISO ?? todayISO) }
//       ))
//     : [];
//   return {
//     completed: Array.isArray(raw?.completed) ? raw.completed : [],
//     failed: Array.isArray(raw?.failed) ? raw.failed : [],
//     current: currentArr,
//     currentDateISO: typeof raw?.currentDateISO === 'string' ? raw.currentDateISO : undefined,
//   };
// }

// function clampLessonHistory(list: LessonCompletion[] | LessonFailure[]): LessonCompletion[] | LessonFailure[] {
//   return list
//     .slice()
//     .sort((a, b) => ('completedAt' in a ? (a.completedAt > (b as LessonCompletion).completedAt ? -1 : 1) : -1))
//     .slice(0, LESSON_PROGRESS_LIMIT)
//     .sort((a, b) => {
//       const aTime = ('completedAt' in a ? a.completedAt : (a as LessonFailure).attemptedAt);
//       const bTime = ('completedAt' in b ? (b as LessonCompletion).completedAt : (b as LessonFailure).attemptedAt);
//       return aTime < bTime ? -1 : 1;
//     });
// }

// export async function recordLessonCompletion(uid: string, completion: LessonCompletion) {
//   const ref = doc(db, 'users', uid, 'progress', 'lessons');
//   const progress = await getLessonProgress(uid);
//   const existingIdx = progress.completed.findIndex(c => c.lessonNo === completion.lessonNo);
//   if (existingIdx !== -1) {
//     progress.completed[existingIdx] = completion;
//   } else {
//     progress.completed.push(completion);
//   }
//   progress.completed = clampLessonHistory(progress.completed) as LessonCompletion[];
//   await setDoc(ref, progress, { merge: true });
// }

// export async function recordLessonFailure(uid: string, failure: LessonFailure) {
//   const ref = doc(db, 'users', uid, 'progress', 'lessons');
//   const progress = await getLessonProgress(uid);
//   const existingIdx = progress.failed.findIndex(c => c.lessonNo === failure.lessonNo);
//   if (existingIdx !== -1) {
//     progress.failed[existingIdx] = failure;
//   } else {
//     progress.failed.push(failure);
//   }
//   progress.failed = clampLessonHistory(progress.failed) as LessonFailure[];
//   await setDoc(ref, progress, { merge: true });
// }

// function createDefaultSrsSummary(): SrsSummary {
//   const stages: SrsStageSummary[] = Object.entries(DEFAULT_STAGE_LABELS).map(([stage, label]) => ({
//     stage: Number(stage),
//     label,
//     lessons: [],
//   }));
//   return { stages, updatedAt: serverTimestamp() };
// }

// export async function getSrsSummary(uid: string): Promise<SrsSummary> {
//   const ref = doc(db, 'users', uid, 'progress', 'srsSummary');
//   const snap = await getDoc(ref);
//   if (!snap.exists()) {
//     const summary = createDefaultSrsSummary();
//     await setDoc(ref, summary);
//     return summary;
//   }
//   const raw = snap.data() as any;
//   // Migration: support legacy shape with lessonNos + nextReview on stage
//   let data: SrsSummary;
//   if (Array.isArray(raw?.stages) && raw.stages.length > 0) {
//     const migratedStages: SrsStageSummary[] = raw.stages.map((st: any) => {
//       if (Array.isArray(st?.lessons)) return { stage: st.stage, label: st.label, lessons: st.lessons } as SrsStageSummary;
//       const lessonNos: number[] = Array.isArray(st?.lessonNos) ? st.lessonNos : [];
//       const next: string = typeof st?.nextReview === 'string' ? st.nextReview : calcNextReviewISO(st?.stage ?? 1);
//       const lessons = lessonNos.map((ln) => ({ lessonNo: Number(ln), nextReview: next }));
//       return { stage: Number(st.stage), label: st.label, lessons } as SrsStageSummary;
//     });
//     data = { stages: migratedStages, updatedAt: raw.updatedAt };
//   } else {
//     const summary = createDefaultSrsSummary();
//     await setDoc(ref, summary);
//     return summary;
//   }
//   if (!Array.isArray(data?.stages) || data.stages.length === 0) {
//     const summary = createDefaultSrsSummary();
//     await setDoc(ref, summary);
//     return summary;
//   }
//   return data;
// }

// export async function saveSrsSummary(uid: string, summary: SrsSummary) {
//   const ref = doc(db, 'users', uid, 'progress', 'srsSummary');
//   await setDoc(ref, { ...summary, updatedAt: serverTimestamp() }, { merge: true });
// }

// export async function recordPerfectLessonToSrs(uid: string, lessonNo: number) {
//   const summary = await getSrsSummary(uid);
//   const stage1 = summary.stages.find(s => s.stage === 1);
//   if (stage1) {
//     const next = calcNextReviewISO(1);
//     const exists = stage1.lessons.find(l => l.lessonNo === lessonNo);
//     if (exists) {
//       exists.nextReview = next;
//     } else {
//       stage1.lessons.push({ lessonNo, nextReview: next });
//     }
//   }
//   await saveSrsSummary(uid, summary);
// }


// export function calcNextReviewISO(stage: number, from: Date = new Date()) {
//   const delta = SRS_INTERVALS_MS[stage] ?? 24*60*60*1000;
//   return new Date(from.getTime() + delta).toISOString();
// }


