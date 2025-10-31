// ============================================================================
// FILE: src/store/slices/srsSlice.ts  (NEW)
// ============================================================================
import type { SessionState } from '@/types/session';
import type { LessonProgress } from '@/types/lessonV1';
import { getSrsSummary, promoteLessons, srsDueOnDate, syncBootstrapSrs } from '@/services/srsV1';
import { jstTodayISO } from '@/lib/cache/lessons';
import { loadBootstrap, saveBootstrap } from '@/lib/bootstrap';
import { buildGrammarMixed } from '@/lib/quiz/grammarBuilder';
import { buildSrsVocabMixed } from '@/lib/quiz/builders';

type Setter = (partial: Partial<SessionState> | ((s: SessionState) => Partial<SessionState>)) => void;
type Getter = () => SessionState;

async function buildSrsMixedQuiz(dueLessonNos: number[]) {
  // Pull catalog to map lessonNo -> vocab/grammar ids
  const boot = loadBootstrap();
  const level = boot?.catalogLevel;
  const { loadBootCatalog } = await import('@/lib/bootstrap');
  const cat = level ? await loadBootCatalog(level) : null;
  const lessons = Array.isArray((cat as any)?.lessons) ? (cat as any).lessons : [];

  const vocabIds: string[] = [];
  const grammarPoints: any[] = [];

  for (const ln of dueLessonNos) {
    const hit = lessons.find((l: any) => l.lessonNo === ln);
    if (!hit) continue;
    if (Array.isArray(hit.vocabIds)) vocabIds.push(...hit.vocabIds);
    if (Array.isArray(hit.grammar)) grammarPoints.push(...hit.grammar);
    if (Array.isArray(hit.grammarIds)) grammarPoints.push(...hit.grammarIds); // support alt shape
  }

  const [{ getVocabByIds, getGrammarByIds }] = await Promise.all([
    import('@/lib/firestore/content'),
  ]);

  const [vDocs, gDocs] = await Promise.all([
    vocabIds.length ? getVocabByIds(vocabIds) : Promise.resolve([]),
    grammarPoints.length ? getGrammarByIds(grammarPoints) : Promise.resolve([]),
  ]);

  // Map vocab docs → Word
  const { mapVocabDocToWord } = await import('@/types/vocab');
  const words = Array.isArray(vDocs) ? vDocs.map((d: any) => mapVocabDocToWord(d)) : [];

  // Build quizzes
  const vocabQuiz = words.length ? buildSrsVocabMixed(words, Math.min(20, words.length)) : [];

  // Grammar builder (if you have one)
  let grammarQuiz: any[] = [];
  try {
    grammarQuiz = Array.isArray(gDocs) ? buildGrammarMixed(gDocs as any[]) : [];
  } catch {
    grammarQuiz = [];
  }

  return [...vocabQuiz, ...grammarQuiz];
}

export const addSrsToSession = (set: Setter, get: Getter) => ({
  srsDueToday: [] as number[],

  async refreshSrsDueToday() {
    const auth = await import('@/store/auth');
    const uid = auth.useAuth.getState().user?.uid;
    if (!uid) return;

    const summary = await getSrsSummary(uid);
    const due = srsDueOnDate(summary, jstTodayISO());

    // mirror to bootstrap
    const boot0 = loadBootstrap();
    const next = { ...(boot0 ?? {}), srsSummary: summary, cachedAt: Date.now() } as any;
    const changed = saveBootstrap(next); // should return boolean if you designed it so
    if (changed && typeof get().bumpBootRevision === 'function') {
      get().bumpBootRevision();
    }

    set({ srsDueToday: due });
  },

  async completeDailyExamAndUnlockSrs(pair: { a: number; b: number }) {
    const auth = await import('@/store/auth');
    const uid = auth.useAuth.getState().user?.uid;
    if (!uid) return;

    // Promote today’s pair from Stage 1 → Stage 2
    const updated = await promoteLessons(uid, [pair.a, pair.b], 1, 2);
    syncBootstrapSrs(updated);
    if (typeof get().bumpBootRevision === 'function') get().bumpBootRevision();

    // Unlock SRS
    set({ stage: 'srsFresher' });
  },

  async startSrsFresher() {
    // Prepare SRS fresher (overview) stage. Do not build quiz yet.
    if (!get().srsDueToday?.length) {
      await (get().refreshSrsDueToday?.());
    }
    if (!get().srsDueToday?.length) {
      set({ stage: 'homePage' });
      return;
    }
    set({ stage: 'srsFresher' });
  },

  async beginSrsExam() {
    const due = get().srsDueToday || [];
    if (!due.length) {
      await (get().refreshSrsDueToday?.());
    }
    const fresh = get().srsDueToday || [];
    if (!fresh.length) { set({ stage: 'homePage' }); return; }
    const quiz = await buildSrsMixedQuiz(fresh);
    set({ quizMode: 'srs', quiz, quizIndex: 0, quizResults: [], stage: 'srsExam' });
  },

  async finishSrsExamAndPromote() {
    const auth = await import('@/store/auth');
    const uid = auth.useAuth.getState().user?.uid;
    if (!uid) { set({ stage: 'homePage' }); return; }

    const due = get().srsDueToday || [];
    if (!due.length) { set({ stage: 'homePage' }); return; }

    // Stage 2 → Stage 3 after SRS exam completes
    const updated = await promoteLessons(uid, due, 2, 3);
    syncBootstrapSrs(updated);
    if (typeof get().bumpBootRevision === 'function') get().bumpBootRevision();

    const todayISO = jstTodayISO();
    set({ stage: 'srsSummary', srsDoneForISO: todayISO } as any);
  },
});
