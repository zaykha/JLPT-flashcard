import { getDoc, setDoc } from 'firebase/firestore';
import { userDoc } from '@/lib/firestore/firestoreV1';
import type { SrsStageLesson, SrsStageSummary, SrsSummary } from '@/types/lessonV1';
import { calcNextReviewISO, createDefaultSrsSummary } from '@/helpers/srsV1';
import { jstTodayISO } from '@/helpers/dateV1';
import { loadBootstrap, saveBootstrap } from '@/lib/bootstrap';


export async function getSrsSummary(uid: string): Promise<SrsSummary> {
    const ref = userDoc(uid, 'progress', 'srsSummary');
    const snap = await getDoc(ref);
    if (!snap.exists()) {
    const summary = createDefaultSrsSummary();
    await setDoc(ref, summary);
    return summary;
    }
    const raw = snap.data() as any;


    if (Array.isArray(raw?.stages) && raw.stages.length > 0) {
    // Migration support for legacy shape
    const migratedStages: SrsStageSummary[] = raw.stages.map((st: any) => {
    if (Array.isArray(st?.lessons)) return { stage: st.stage, label: st.label, lessons: st.lessons } as SrsStageSummary;
    const lessonNos: number[] = Array.isArray(st?.lessonNos) ? st.lessonNos : [];
    const next: string = typeof st?.nextReview === 'string' ? st.nextReview : calcNextReviewISO(st?.stage ?? 1);
    const lessons = lessonNos.map((ln) => ({ lessonNo: Number(ln), nextReview: next }));
    return { stage: Number(st.stage), label: st.label, lessons } as SrsStageSummary;
    });
    const data: SrsSummary = { stages: migratedStages, updatedAt: raw.updatedAt };
    if (!Array.isArray(data?.stages) || data.stages.length === 0) {
    const summary = createDefaultSrsSummary();
    await setDoc(ref, summary);
    return summary;
    }
    return data;
    }


    const summary = createDefaultSrsSummary();
    await setDoc(ref, summary);
    return summary;
}

export async function saveSrsSummary(uid: string, summary: SrsSummary) {
const ref = userDoc(uid, 'progress', 'srsSummary');
await setDoc(ref, summary, { merge: true });
}

export async function recordPerfectLessonToSrs(uid: string, lessonNo: number) {
    const summary = await getSrsSummary(uid);
    const stage1 = summary.stages.find((s) => s.stage === 1);
    if (stage1) {
    const next = calcNextReviewISO(1);
    const exists = stage1.lessons.find((l) => l.lessonNo === lessonNo);
    if (exists) exists.nextReview = next;
    else stage1.lessons.push({ lessonNo, nextReview: next });
    }
    await saveSrsSummary(uid, summary);
}

export function srsDueOnDate(summary: SrsSummary | undefined, isoDay: string): number[] {
  if (!summary?.stages?.length) return [];
  const out: number[] = [];
  for (const st of summary.stages) {
    for (const l of st.lessons || []) {
      if (String(l.nextReview).slice(0, 10) <= isoDay) out.push(Number(l.lessonNo));
    }
  }
  return Array.from(new Set(out)).sort((a, b) => a - b);
}

export async function promoteLessons(
  uid: string,
  lessonNos: number[],
  fromStage: number,
  toStage: number
) {
  const ref = userDoc(uid, 'progress', 'srsSummary');
  const snap = await getDoc(ref);
  const summary: SrsSummary = snap.exists() ? (snap.data() as any) : createDefaultSrsSummary();

  const today = jstTodayISO();

  const getStage = (n: number) => {
    let st = summary.stages.find(s => s.stage === n);
    if (!st) {
      st = { stage: n, label: `Stage ${n}`, lessons: [] };
      summary.stages.push(st);
      summary.stages.sort((a, b) => a.stage - b.stage);
    }
    return st;
  };

  const src = getStage(fromStage);
  const dst = getStage(toStage);

  const toMove = new Set(lessonNos);
  // remove from src
  src.lessons = (src.lessons || []).filter(l => !toMove.has(Number(l.lessonNo)));
  // add/update in dst with fresh nextReview based on destination stage
  const next = calcNextReviewISO(toStage);
  const dstMap = new Map<number, SrsStageLesson>((dst.lessons || []).map(l => [Number(l.lessonNo), l]));
  for (const ln of lessonNos) {
    dstMap.set(Number(ln), { lessonNo: Number(ln), nextReview: next });
  }
  dst.lessons = Array.from(dstMap.values());
  (summary as any).updatedAt = Date.now();

  await setDoc(ref, summary, { merge: true });
  return summary;
}

export function syncBootstrapSrs(summary: SrsSummary | undefined) {
  const boot = loadBootstrap();
  const next = { ...(boot ?? {}), srsSummary: summary, cachedAt: Date.now() } as any;
  saveBootstrap(next);
  return next;
}
