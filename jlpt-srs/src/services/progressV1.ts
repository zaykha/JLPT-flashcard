import { getDoc, setDoc } from 'firebase/firestore';
import { userDoc } from '@/lib/firestore/firestoreV1';
import type { LessonCompletion, LessonFailure, LessonProgress } from '@/types/lessonV1';

import { clampLessonHistory } from '@/helpers/historyV1';
import { jstTodayISO } from '@/helpers/dateV1';


export { LESSON_PROGRESS_LIMIT } from '@/helpers/historyV1';


export async function getLessonProgress(uid: string): Promise<LessonProgress> {
const ref = userDoc(uid, 'progress', 'lessons');
const snap = await getDoc(ref);
if (!snap.exists()) {
const empty: LessonProgress = { completed: [], failed: [], current: [] };
await setDoc(ref, empty as any);
return empty;
}
const raw = snap.data() as any;
const todayISO = jstTodayISO();


const currentArr: Array<{ lessonNo: number; LessonDate: string }> = Array.isArray(raw?.current)
? raw.current.map((item: any) =>
typeof item === 'object' && item && typeof item.lessonNo !== 'undefined'
? { lessonNo: Number(item.lessonNo), LessonDate: String(item.LessonDate ?? raw.currentDateISO ?? todayISO) }
: { lessonNo: Number(item), LessonDate: String(raw.currentDateISO ?? todayISO) }
)
: [];


return {
completed: Array.isArray(raw?.completed) ? raw.completed : [],
failed: Array.isArray(raw?.failed) ? raw.failed : [],
current: currentArr,
currentDateISO: typeof raw?.currentDateISO === 'string' ? raw.currentDateISO : undefined,
};
}


export async function recordLessonCompletion(uid: string, completion: LessonCompletion) {
const ref = userDoc(uid, 'progress', 'lessons');
const progress = await getLessonProgress(uid);
const existingIdx = progress.completed.findIndex((c) => c.lessonNo === completion.lessonNo);
if (existingIdx !== -1) progress.completed[existingIdx] = completion;
else progress.completed.push(completion);


progress.completed = clampLessonHistory(progress.completed) as LessonCompletion[];
await setDoc(ref, progress, { merge: true });
}


export async function recordLessonFailure(uid: string, failure: LessonFailure) {
const ref = userDoc(uid, 'progress', 'lessons');
const progress = await getLessonProgress(uid);
const existingIdx = progress.failed.findIndex((c) => c.lessonNo === failure.lessonNo);
if (existingIdx !== -1) progress.failed[existingIdx] = failure;
else progress.failed.push(failure);


progress.failed = clampLessonHistory(progress.failed) as LessonFailure[];
await setDoc(ref, progress, { merge: true });
}