import { serverTimestamp } from "@/lib/firestore/firestoreV1";
import type { SrsStageSummary, SrsSummary } from "@/types/lessonV1";



export const DEFAULT_STAGE_LABELS: Record<number, string> = {
1: 'Apprentice I',
2: 'Apprentice II',
3: 'Apprentice III',
4: 'Guru I',
5: 'Guru II',
};


export const SRS_INTERVALS_MS: Record<number, number> = {
1: 3 * 24 * 60 * 60 * 1000,
2: 7 * 24 * 60 * 60 * 1000,
3: 14 * 24 * 60 * 60 * 1000,
4: 20 * 24 * 60 * 60 * 1000,
5: 30 * 24 * 60 * 60 * 1000,
};


export function calcNextReviewISO(stage: number, from: Date = new Date()): string {
const delta = SRS_INTERVALS_MS[stage] ?? 24 * 60 * 60 * 1000;
return new Date(from.getTime() + delta).toISOString();
}


export function createDefaultSrsSummary(): SrsSummary {
const stages: SrsStageSummary[] = Object.entries(DEFAULT_STAGE_LABELS).map(([stage, label]) => ({
stage: Number(stage),
label,
lessons: [],
}));
return { stages, updatedAt: serverTimestamp() };
}

export function srsDueOnDate(srs: SrsSummary | undefined, dateISO: string): number[] {
  if (!srs || !Array.isArray(srs.stages)) return [];
  const ymd = String(dateISO).slice(0, 10);
  return srs.stages.flatMap(st =>
    Array.isArray(st.lessons)
      ? st.lessons
          .filter(l => String(l.nextReview ?? '').slice(0, 10) === ymd)
          .map(l => Number(l.lessonNo))
      : []
  );
}
