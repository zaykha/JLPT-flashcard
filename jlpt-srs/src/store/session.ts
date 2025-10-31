// src/store/session.ts
// Session store: centralizes lesson flow state, persistence, and helpers.
//
// Organization:
//  - Imports and types
//  - Local attempts persistence (localStorage)
//  - Store: state + actions grouped by phase
//    * Build today lesson (vocab) + auto-advance from local perfect vocab
//    * Vocab quiz build + results handling (records local attempts)
//    * Grammar study build + grammar quiz build
//    * Lesson completion (writes to Firestore + bootstrap, updates queue, SRS, prebuild next)

import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { useAuth } from '@/store/auth';
import { useTopics } from '@/store/topics';
import type { Word } from '@/types/vocab';
import { jstTodayISO } from '@/lib/cache/lessons';
// import { pctCorrect, recordPerfectLessonToSrs, type JLPTLevelStr, type LessonQuizItem, type LessonQuizSnapshot } from '@/lib/user-data';
import type { SessionState } from '@/types/session';
import type { QuizItem } from '@/types/quiz';
import { buildVocabQuiz, buildGrammarQuizFromPool, buildMatching } from '@/lib/quiz/builders';
import { sanitizeSnapshot, stripUndefinedDeep } from '@/helpers/sanitize';
import { shuffle } from '@/helpers/arrays';
import { buildGrammarMixed } from '@/lib/quiz/grammarBuilder';
// import { isChoiceQuestion } from '@/types/guards';
// import type { GrammarPoint } from '@/types/grammar';
import { clearLocalAttempts, loadLocalAttempts, saveLocalAttempt, saveLocalBest } from '@/lib/attempts';
import type { JLPTLevelStr } from '@/types/userV1';
import { recordPerfectLessonToSrs } from '@/services/srsV1';
import { pctCorrect } from '@/helpers/lessonCalcV1';
import { normalizeCurrent, pickNextLessonsAfter } from '@/helpers/progressV1';
import { buildLessonSnapshot } from '@/helpers/snapshotsV1';
import { appendCompletionAndSetCurrent } from '@/services/progressMutationV1';
import { addSrsToSession } from './slices/srsSlice';

export const useSession: UseBoundStore<StoreApi<SessionState>> =
  create<SessionState>((set, get) => ({
  // Stage & readiness
  stage: 'settings',
  stageReady: false,
  setStageReady: (v: boolean) => set({ stageReady: v }),
  ensureStageForHome: async () => {
    try {
      const [{ loadBootstrap }, { jstTodayISO }] = await Promise.all([
        import('@/lib/bootstrap'),
        import('@/lib/cache/lessons'),
      ]);
      const { hasExamForDate } = await import('@/helpers/todayV1');
      const { computeNextStage } = await import('@/helpers/stage');

      const s = get();
      const boot = loadBootstrap();
      const progress = boot?.lessonProgress;
      const todayISO = jstTodayISO();
      const perDay = 2;

      const alreadyExam =
        hasExamForDate(progress, todayISO) || (useSession.getState() as any)?.examTakenISO === todayISO;

      const next = computeNextStage(progress, todayISO, perDay, alreadyExam, s.stage);
      if (s.stage !== next || !s.stageReady) set({ stage: next, stageReady: true });
    } catch {
      const s = get();
      if (!s.stageReady) set({ stageReady: true });
    }
  },
  isBuildingToday: false,
  // Vocab "study" state
  today: [],
  index: 0,
  lessonNo: null,
  lessonPhase: 'vocab',

  // Boot rev (used to force Home reloads)
  bootRevision: 0,
  bumpBootRevision() {
    set(s => ({ bootRevision: s.bootRevision + 1 }));
  },

  // Snapshots / attempts
  lastVocabSnapshot: undefined,
  lastGrammarSnapshot: undefined,
  quizAttempt: 0,

  // Grammar study & grammar-quiz state
  grammarToday: [],
  grammarIndex: 0,
  setGrammarToday: (pts) => set({ grammarToday: pts, grammarIndex: 0 }),


  grammarQuiz: [],
  grammarQuizIndex: 0,
  grammarQuizResults: [],
  setGrammarQuizIndex: (n) => set({ grammarQuizIndex: n }),
  pushGrammarQuizResult: (r) => set(s => ({ grammarQuizResults: [...s.grammarQuizResults, r] })),
  resetGrammarQuiz: () => set({ grammarQuiz: [], grammarQuizIndex: 0, grammarQuizResults: [] }),
  async startGrammarStudy() {
    const auth = useAuth.getState();
    const uid = auth.user?.uid;
    const lessonNo = get().lessonNo;
    if (!uid || !lessonNo) return;

    // ✅ If already prepared, just ensure the study page is shown
    const { lessonPhase, grammarToday } = get();
    if (lessonPhase === 'grammar' && Array.isArray(grammarToday) && grammarToday.length) {
        set({ stage: 'grammar' }); // ✅ stay on grammar study
        return;
      }
    
    const [{ loadBootstrap, loadBootCatalog }, { getGrammarByIds }] = await Promise.all([
      import('@/lib/bootstrap'),
      import('@/lib/firestore/content'),
    ]);

    const boot = loadBootstrap();
    const level = boot?.catalogLevel;
    if (!level) { console.warn('[grammar] missing catalog level'); return; }

    const catalog = await loadBootCatalog(level);
    const lessons = (catalog as any)?.lessons as Array<{ lessonNo: number; grammarIds?: string[] }>;
    if (!Array.isArray(lessons)) { console.warn('[grammar] catalog.lessons missing'); return; }

    const entry = lessons.find(l => l.lessonNo === lessonNo);
    const grammarIds = entry?.grammarIds || [];
    if (!grammarIds.length) { console.warn('[grammar] no grammarIds for lesson', lessonNo); return; }

    // RAW grammar points (your JSON shape)
    const grammarPoints = await getGrammarByIds(grammarIds); // GrammarPoint[]

    // keep vocab "today" intact; store grammar separately
    set({
      grammarToday: grammarPoints,
      grammarIndex: 0,
      lessonPhase: 'grammar',
      stage: 'grammar', // show GrammarStudyPage
      // quiz config will be applied when you press “Start Grammar Quiz”
    });
  },
  startGrammarQuiz() {
    const { grammarToday } = get();
    if (!grammarToday?.length) {
      console.warn('[grammar] no grammarToday to quiz on');
      return;
    }

    const raw = buildGrammarMixed(grammarToday as any[]);
    const items = raw.filter(q =>
      (q as any).prompt?.trim() &&
      (q as any).correct?.trim() &&
      Array.isArray((q as any).choices) &&
      (q as any).choices.length === 4
    );

    if (!items.length) {
      console.warn('[grammar] no valid grammar MCQs built');
      set({ stage: 'grammar' });
      return;
    }

    set({
      grammarQuiz: items,
      grammarQuizIndex: 0,
      grammarQuizResults: [],
      stage: 'grammarQuiz',
      quizConfig: { types: ['mcq'], perQuestionSec: 20, size: items.length }, // 20s for grammar
    });
  },

  // Quiz (shared UI) + mode
  quizMode: 'vocab',
  quiz: [],
  quizIndex: 0,
  quizResults: [],
  quizConfig: {
    types: ['mcq', 'kanjiToHiragana', 'hiraganaToKanji'],
    perQuestionSec: 10,
    size: 10,
  },

  // General actions
  setStage: (s) => set({ stage: s }),
  setToday: (w) => set({ today: w, index: 0 }),
  next: () => set(s => ({ index: Math.min(s.index + 1, Math.max(0, s.today.length - 1)) })),
  prev: () => set(s => ({ index: Math.max(0, s.index - 1) })),
  
  // Vocab flow
  async buildTodayFixed() {
    const st = get();
    if (st.isBuildingToday) return; // ⛔ re-entrancy guard
    set({ isBuildingToday: true });
    try {
      if (process.env.NODE_ENV !== 'production') console.info('[session.buildTodayFixed] start');
      const auth = useAuth.getState();
      if (!auth.user) return;

      const boot = (await import('@/lib/bootstrap')).loadBootstrap();
      if (!boot?.profile || !boot?.lessonProgress || !boot?.catalogLevel) {
        if (process.env.NODE_ENV !== 'production') console.warn('[session.buildTodayFixed] missing boot parts', { hasProfile: !!boot?.profile, hasLP: !!boot?.lessonProgress, level: boot?.catalogLevel });
        return;
      }

      const level = boot.catalogLevel as JLPTLevelStr;
      const progress = boot.lessonProgress;
      const todayISO = jstTodayISO();
      const perDay = 2;

      const { loadBootCatalog } = await import('@/lib/bootstrap');
      const catalog = await loadBootCatalog(level);
      if (!catalog) { if (process.env.NODE_ENV !== 'production') console.warn('[session.buildTodayFixed] no catalog for level'); return; }

      const lessons = (catalog as any).lessons as Array<{ lessonNo: number; vocabIds: string[]; grammarIds: string[] }>;
      if (!Array.isArray(lessons)) { if (process.env.NODE_ENV !== 'production') console.warn('[session.buildTodayFixed] catalog.lessons invalid'); return; }

      // Normalize current queue to [{ lessonNo, LessonDate }]
      let queueObjs = normalizeCurrent(progress.current, todayISO);

      if (queueObjs.length === 0) {
        // Delegate assignment to server-authoritative planner to persist current → Firestore
        const [{ ensureDailyQueue }] = await Promise.all([
          import('@/services/StudyPlanV1'),
        ]);
        const range = (catalog as any).lessonRange as { start: number; end: number };
        if (auth.user?.uid && range) {
          try {
            if (process.env.NODE_ENV !== 'production') console.info('[session.buildTodayFixed] ensureDailyQueue');
            await ensureDailyQueue(auth.user.uid, { levelRange: range, perDay }, { todayISO });
          } catch (e) {
            console.warn('[buildTodayFixed] ensureDailyQueue failed (continuing with local cache)', e);
          }
        }

        // Re-read bootstrap after planner writes to Firestore
        try {
          const { syncLessonProgressFromFirestore } = await import('@/lib/synLessonProgress');
          await syncLessonProgressFromFirestore(auth.user!.uid);
        } catch {}
        const bootAfter = (await import('@/lib/bootstrap')).loadBootstrap();
        const progAfter = bootAfter?.lessonProgress ?? { completed: [], failed: [], current: [] };
        queueObjs = normalizeCurrent(progAfter.current, todayISO);
        if (process.env.NODE_ENV !== 'production') console.info('[session.buildTodayFixed] after sync, queue:', queueObjs);

        // If still empty after authoritative planner, check quota/exam routing and bail
        if (queueObjs.length === 0) {
          const { getTodaysLessonNos, lastTwo, hasExamForDate } = await import('@/helpers/todayV1');
          const todaysNos = getTodaysLessonNos(progAfter, todayISO);
          if (process.env.NODE_ENV !== 'production') console.info('[session.buildTodayFixed] todaysNos:', todaysNos);
          if (todaysNos.length >= perDay) {
            const examTaken = hasExamForDate(progAfter, todayISO) || (get() as any)?.examTakenISO === todayISO;
            if (process.env.NODE_ENV !== 'production') console.info('[session.buildTodayFixed] quota met → exam?', examTaken);
            if (examTaken) { set({ stage: 'buy', lastExamPair: null }); return; }
            const pair = lastTwo(todaysNos);
            if (pair) set({ stage: 'examFresher', lastExamPair: { a: pair[0], b: pair[1] } });
            return;
          }
          // No assignments available yet
          return;
        }
      }

      const lessonNo = queueObjs[0]?.lessonNo;
      if (!Number.isFinite(lessonNo)) return;

      let entry = lessons.find(l => l.lessonNo === lessonNo);
      if (!entry) {
        // If the queued lessonNo is outside the selected level's catalog range,
        // reconcile the daily queue (server-authoritative) and retry once.
        try {
          let range = (catalog as any)?.lessonRange as { start: number; end: number } | undefined;
          if (!range && boot?.catalogLevel) {
            const FALLBACK: Record<string, { start: number; end: number }> = {
              N5: { start: 1, end: 66 },
              N4: { start: 67, end: 129 },
              N3: { start: 130, end: 309 },
              N2: { start: 310, end: 492 },
              N1: { start: 493, end: 838 },
            };
            range = FALLBACK[String(boot.catalogLevel)] as any;
          }
          if (range && (lessonNo < range.start || lessonNo > range.end)) {
            if (process.env.NODE_ENV !== 'production') console.warn('[session.buildTodayFixed] lesson entry not found for', lessonNo, '— outside level range', range, '→ reconciling');
            const { ensureDailyQueue } = await import('@/services/StudyPlanV1');
            await ensureDailyQueue(auth.user!.uid, { levelRange: range, perDay }, { todayISO });
            // re-sync bootstrap from Firestore
            try {
              const { syncLessonProgressFromFirestore } = await import('@/lib/synLessonProgress');
              await syncLessonProgressFromFirestore(auth.user!.uid);
            } catch {}
            // reload boot + queue and pick the first valid lesson
            const bootAfter = (await import('@/lib/bootstrap')).loadBootstrap();
            const progAfter = bootAfter?.lessonProgress ?? { completed: [], failed: [], current: [] };
            const q2 = normalizeCurrent(progAfter.current, todayISO);
            if (q2.length) {
              const ln2 = q2[0]?.lessonNo;
              if (Number.isFinite(ln2)) {
                entry = lessons.find(l => l.lessonNo === ln2) as any;
                if (entry) {
                  // update in-memory state to the reconciled lessonNo
                  set(s => ({ lessonNo: ln2, today: s.today }));
                }
              }
            }
          }
        } catch {}

        if (!entry) {
          if (process.env.NODE_ENV !== 'production') console.warn('[session.buildTodayFixed] lesson entry not found for', lessonNo);
          return;
        }
      }

      try { (window as any).__KOZA_TODAY_PICK__ = { todayISO, queue: queueObjs, lessonNo, level }; } catch {}

      const [{ loadTodayLesson, saveTodayLesson, endOfTodayJST }] = await Promise.all([
        import('@/lib/cache/lessons'),
      ]);
      const todayKey = { uid: auth.user.uid, level, lessonNo, dateISO: todayISO };
      const cached = loadTodayLesson(todayKey);

      if (cached?.words?.length) {
        useTopics.getState().setWords(cached.words as any);
        set(s => ({
          today: cached.words as any,
          index: 0,
          stage: s.stage === 'studying' ? s.stage : 'studying', // ✅ only change if needed
          lessonNo,
          quizAttempt: 0,
          quizConfig: { ...s.quizConfig, size: Math.min(s.quizConfig.size || 10, (cached.words as any).length) },
        }));
        try {
          const attempts = loadLocalAttempts(auth.user.uid, lessonNo);
          const bestVocab = attempts?.best?.vocab;
          if (bestVocab && pctCorrect(bestVocab) === 100) {
            set({ lastVocabSnapshot: bestVocab });
            await get().startGrammarStudy();
          }
        } catch {}
        return;
      }

      // Fetch vocab for today’s flashcards
      const [{ getVocabByIds }, { mapVocabDocToWord }] = await Promise.all([
        import('@/lib/firestore/content'),
        import('@/types/vocab'),
      ]);
      const vocabDocs = await getVocabByIds(entry.vocabIds || []);
      const vocabWords = vocabDocs.map(d => {
        const topic = d.topic || d.topicKey || d.category || d.tags?.[0] || 'general';
        return mapVocabDocToWord(d, { lessonTopic: topic });
      });

      useTopics.getState().setWords(vocabWords as any);

      saveTodayLesson({
        key: todayKey,
        words: vocabWords,
        expiresAt: endOfTodayJST(),
      });

      set(s => ({
        today: vocabWords as any,
        index: 0,
        stage: s.stage === 'studying' ? s.stage : 'studying', // ✅ only change if needed
        lessonNo,
        quizAttempt: 0,
        quizConfig: { ...s.quizConfig, size: vocabWords.length },
      }));

      try {
        const attempts = loadLocalAttempts(auth.user.uid, lessonNo);
        const bestVocab = attempts?.best?.vocab;
        if (bestVocab && pctCorrect(bestVocab) === 100) {
          set({ lastVocabSnapshot: bestVocab });
          await get().startGrammarStudy();
        }
      } catch {}
    } finally {
      if (process.env.NODE_ENV !== 'production') console.info('[session.buildTodayFixed] end');
      set({ isBuildingToday: false });
    }
  },

  buildQuiz() {
    const { today } = get();
    const pool = today.slice();
    if (pool.length === 0) { set({ quiz: [], quizIndex: 0 }); return; }
    const items = buildVocabQuiz(pool as Word[], pool.length);
    set({
      quiz: items,
      quizIndex: 0,
      quizResults: [],
      quizConfig: { ...get().quizConfig, perQuestionSec: 10, size: items.length },
      stage: 'quiz',
    });
  },
  setQuizIndex(n) { set({ quizIndex: n }); },
  pushQuizResult: (r) =>
  set((s) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[store.pushQuizResult] BEFORE', s.quizResults);
      console.log('[store.pushQuizResult] ADD   ', r);
    }
    return { quizResults: [...s.quizResults, r] };
  }),
  resetQuiz() { set({ quiz: [], quizIndex: 0, quizResults: [] }); },

  // Transition helpers
  recordLocalAttempt: async ({ durationSec }: { durationSec: number }) => {
    const { quiz, quizResults, lessonNo, lessonPhase } = get();
    if (!lessonNo || !quiz.length) return;

    const snapshot = buildLessonSnapshot(quiz, quizResults, lessonPhase, durationSec);

    try {
      const auth = useAuth.getState();
      const uid = auth.user?.uid;
      if (uid && lessonNo) {
        saveLocalAttempt(uid, lessonNo, lessonPhase === 'grammar' ? 'grammar' : 'vocab', snapshot);
        const correct = quizResults.filter(r => r.correct).length;
        const pct = Math.round((correct / quiz.length) * 100);
        if (pct === 100) saveLocalBest(uid, lessonNo, lessonPhase === 'grammar' ? 'grammar' : 'vocab', snapshot);
      }
    } catch {}
  },
  async startGrammarPhase() {
    const auth = useAuth.getState();
    const uid = auth.user?.uid;
    const lessonNo = get().lessonNo;
    if (!uid || !lessonNo) return;

    const { loadBootstrap, loadBootCatalog } = await import('@/lib/bootstrap');
    const boot = loadBootstrap();
    const level = boot?.catalogLevel;
    if (!level) return;

    const cat = await loadBootCatalog(level);
    const lessons = (cat as any)?.lessons as Array<{ lessonNo: number; grammarIds?: string[] }>;
    if (!Array.isArray(lessons)) return;

    const entry = lessons.find(l => l.lessonNo === lessonNo);
    const grammarIds = entry?.grammarIds || [];
    if (!grammarIds.length) return;

    const [{ getGrammarByIds }, { mapGrammarDocToWord }] = await Promise.all([
      import('@/lib/firestore/content'),
      import('@/types/vocab'),
    ]);
    const grammarDocs = await getGrammarByIds(grammarIds);
    const words = grammarDocs.map((doc: any) => mapGrammarDocToWord(doc));

    // Build grammar MCQs
    const items: QuizItem[] = buildGrammarQuizFromPool(words as any, words.length);

    set({
      lessonPhase: 'grammar',
      quiz: items,
      quizIndex: 0,
      quizResults: [],
      quizConfig: { ...get().quizConfig, types: ['mcq'], perQuestionSec: 10, size: items.length },
      stage: 'quiz',
    });
  },
  /** @deprecated Use recordVocabAttemptAndMaybeAdvance for vocab; recordGrammarAttemptAndMaybeComplete for grammar. */
  async recordQuizAttemptAndMaybeAdvance({ durationSec }: { durationSec: number }) {
    const { quiz, quizResults, lessonNo, lessonPhase } = get();
    if (!lessonNo || !quiz.length) return;

    const snapshot = buildLessonSnapshot(quiz, quizResults, lessonPhase, durationSec);

    // Save attempt locally
    try {
      const auth = useAuth.getState();
      const uid = auth.user?.uid;
      if (uid && lessonNo) saveLocalAttempt(uid, lessonNo, lessonPhase === 'grammar' ? 'grammar' : 'vocab', snapshot);
    } catch {}

    if (lessonPhase === 'vocab') {
      set({ lastVocabSnapshot: snapshot });
    } else {
      set({ lastGrammarSnapshot: snapshot });
    }

    const correct = quizResults.filter(r => r.correct).length;
    const pct = Math.round((correct / quiz.length) * 100);

    if (lessonPhase === 'vocab') {
      if (pct === 100) {
        try {
          const auth = useAuth.getState();
          const uid = auth.user?.uid;
          if (uid && lessonNo) saveLocalBest(uid, lessonNo, 'vocab', snapshot);
        } catch {}

        // ✅ Idempotent transition: only start grammar study if not already there
        const st = get();
        if (st.lessonPhase !== 'grammar') {
          await get().startGrammarStudy();   // sets lessonPhase='grammar' and stage='studying'
        } else {
          // already in grammar; ensure the correct page is shown
          set({ stage: 'studying' });
        }
      } else {
        // Not perfect: allow retake
        set({ quizIndex: 0, quizResults: [] });
      }
      return;
    }


    // grammar phase
    if (pct === 100) {
      try {
        const auth = useAuth.getState();
        const uid = auth.user?.uid;
        if (uid && lessonNo) saveLocalBest(uid, lessonNo, 'grammar', snapshot);
      } catch {}
      try {
        const auth = useAuth.getState();
        const uid = auth.user?.uid;
        if (uid && lessonNo) {
          const attemptsNow = loadLocalAttempts(uid, lessonNo);
          const count = attemptsNow?.grammar?.length ?? 0;
          set({ quizAttempt: count });
        }
      } catch {}
      await get().markLessonCompleted();
    } else {
      set({ quizIndex: 0, quizResults: [] });
    }
  },
  /** Vocab-only: save attempt; on 100% start grammar study. */
  async recordVocabAttemptAndMaybeAdvance({ durationSec }: { durationSec: number }) {
    const { quiz, quizResults, lessonNo, lessonPhase } = get();
    if (!lessonNo || !quiz.length) return;

    const snapshot = buildLessonSnapshot(quiz, quizResults, 'vocab', durationSec);

    // Save attempt locally; save "best" if perfect
      const correct = quizResults.filter(r => r.correct).length;
      const pct = Math.round((correct / quiz.length) * 100);
      try {
        const { user } = useAuth.getState();
        const uid = user?.uid;
        if (uid && lessonNo) {
          saveLocalAttempt(uid, lessonNo, 'vocab', snapshot);
          if (pct === 100) saveLocalBest(uid, lessonNo, 'vocab', snapshot);
        }
      } catch {}

      // Cache last vocab snapshot in memory
      set({ lastVocabSnapshot: snapshot });

      // Advance logic
      if (pct === 100) {
        // If already in grammar (e.g., via another path), just show study page
        if (lessonPhase === 'grammar') {
          set({ stage: 'grammar' });
          return;
        }
        // Otherwise start grammar study once
        await get().startGrammarStudy(); // sets lessonPhase='grammar' and stage='studying'
      } else {
        // Not perfect → allow retake flow
        set({ quizIndex: 0, quizResults: [] });
      }
  },
  async recordGrammarAttemptAndMaybeComplete({ durationSec }: { durationSec: number }) {
    const auth = useAuth.getState();
    const uid = auth.user?.uid;
    const { lessonNo, grammarQuiz, grammarQuizResults } = get();
    if (!uid || !lessonNo || !Array.isArray(grammarQuiz) || !grammarQuiz.length) return;

    // Build snapshot for grammar
    const snapshot = buildLessonSnapshot(grammarQuiz as any, grammarQuizResults as any, 'grammar', durationSec);

  // ✅ Cache last grammar snapshot in memory (needed by markLessonCompleted)
    set({ lastGrammarSnapshot: snapshot });
    // Save attempt locally (resilience)
    try {
      saveLocalAttempt(uid, lessonNo, 'grammar', snapshot);
    } catch {}

    // If perfect grammar, persist "best", update attempt count, and complete lesson
    const right = grammarQuizResults.filter(r => r.correct).length;
    const pct = Math.round((right / Math.max(1, grammarQuiz.length)) * 100);

    if (pct === 100) {
      try {
        saveLocalBest(uid, lessonNo, 'grammar', snapshot);
      } catch {}

      // sync attempt count to state for UI
      try {
        const attemptsNow = loadLocalAttempts(uid, lessonNo);
        const count = attemptsNow?.grammar?.length ?? 0;
        set({ quizAttempt: count });
      } catch {}

      // This will also handle SRS when both phases were perfect (as we refactored earlier)
      await get().markLessonCompleted();
    }
  },


// Completion
  canFinishLesson: (): boolean => {
    const s = useSession.getState();
    return s.lessonPhase === 'grammar' && !!s.lastVocabSnapshot && !!s.lastGrammarSnapshot;
  },
  async markLessonCompleted() {
    const auth = useAuth.getState();
    const uid = auth.user?.uid;
    const { lessonNo, lastVocabSnapshot, lastGrammarSnapshot, today } = get();
    if (!uid || !lessonNo) return;
    if (!lastVocabSnapshot || !lastGrammarSnapshot) {
      console.warn('[session] cannot complete lesson without both snapshots');
      return;
    }

    const level = (today?.[0]?.level as JLPTLevelStr | undefined) ?? null;
    const completedAt = new Date().toISOString();

    const quizSnap = sanitizeSnapshot(lastVocabSnapshot);
    const grammarSnap = sanitizeSnapshot(lastGrammarSnapshot);

    // summarized attempts count
    let attemptsCount = 0;
    try {
      const attempts = loadLocalAttempts(uid, lessonNo);
      attemptsCount = (attempts?.vocab?.length || 0) + (attempts?.grammar?.length || 0);
    } catch {}

    const completedEntry = stripUndefinedDeep({
      lessonId: jstTodayISO(),
      lessonNo,
      level,
      completedAt,
      attempts: attemptsCount,
      quiz: quizSnap,
      grammarQuiz: grammarSnap,
    });

    try {
      const { loadBootstrap, saveBootstrap } = await import('@/lib/bootstrap');
      const bootNow = loadBootstrap();
      const progressNow = bootNow?.lessonProgress;
      const currentQueueObjs: Array<{ lessonNo:number; LessonDate:string }> = Array.isArray(progressNow?.current)
        ? (progressNow!.current as any[]).map((it: any) => ({
            lessonNo: Number(it.lessonNo),
            LessonDate: String(it.LessonDate ?? completedAt.slice(0,10))
          }))
        : [];
      const newCurrentObjs = currentQueueObjs.filter(it => Number(it.lessonNo) !== Number(lessonNo));

      // Firestore write
      await appendCompletionAndSetCurrent(uid, completedEntry, newCurrentObjs);

      // Cache update
      if (bootNow) {
        const updated = stripUndefinedDeep({
          ...bootNow,
          lessonProgress: {
            ...bootNow.lessonProgress,
            completed: [...(bootNow.lessonProgress?.completed ?? []), completedEntry],
            failed: bootNow.lessonProgress?.failed ?? [],
            current: newCurrentObjs,
          },
          cachedAt: Date.now(),
        });
        saveBootstrap(updated);
      }
      get().bumpBootRevision();

      // SRS on perfect
      const vocabPct = pctCorrect(quizSnap);
      const grammarPct = pctCorrect(grammarSnap);
      if (vocabPct === 100 && grammarPct === 100) {
        try { await recordPerfectLessonToSrs(uid, lessonNo); } catch (e) { console.warn('[session] failed SRS record', e); }
      }

      // Local cleanup (attempts + stable keys)
      try { clearLocalAttempts(uid, lessonNo); } catch {}
      try {
        const { LOCAL_LESSON_KEY, LOCAL_LESSON_NO, LOCAL_LESSON_DAY } = await import('@/lib/home/constants');
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(LOCAL_LESSON_KEY); // legacy
          window.localStorage.removeItem(LOCAL_LESSON_NO);
          window.localStorage.removeItem(LOCAL_LESSON_DAY);
        }
      } catch {}

      set({
        lessonPhase: 'vocab',
        lastVocabSnapshot: undefined,
        lastGrammarSnapshot: undefined,
        quiz: [],
        quizIndex: 0,
        quizResults: [],
      });
    } catch (err) {
      console.warn('[session] failed to record lesson completion', err);
    }
  },


  //exam
  lastExamPair: null,
  setLastExamPair: (pair) => set({ lastExamPair: pair }),
  examDoneForISO: null,
  setExamDoneForISO: (iso) => set({ examDoneForISO: iso }),
  srsDoneForISO: null,
  // inside useSession(...) store object
  async buildExamFor(lessonNoA: number, lessonNoB: number) {
    const auth = useAuth.getState();
    if (!auth.user) return;

    const todayDay = new Date().toISOString().slice(0, 10);

    // Guard: if exam already logged today in bootstrap, don’t build again
    try {
      const { loadBootstrap } = await import('@/lib/bootstrap');
      const boot = loadBootstrap();
      const alreadyToday =
        Array.isArray(boot?.lessonProgress?.examsStats) &&
        boot!.lessonProgress!.examsStats!.some(e => String(e.examdate).slice(0, 10) === todayDay);

      if (alreadyToday) {
        console.warn('[exam] already taken today — skipping build');
        set({ stage: 'examSummary' });
        return;
      }
    } catch (e) {
      console.warn('[exam] bootstrap guard failed (continuing)', e);
    }

    const { loadBootstrap, loadBootCatalog } = await import('@/lib/bootstrap');
    const boot = loadBootstrap();
    const level = boot?.catalogLevel;
    if (!level) return;

    const catalog = await loadBootCatalog(level);
    const lessons = (catalog as any)?.lessons as Array<{ lessonNo: number; vocabIds?: string[]; grammarIds?: string[] }>;
    if (!Array.isArray(lessons)) return;

    const entryA = lessons.find(l => l.lessonNo === lessonNoA);
    const entryB = lessons.find(l => l.lessonNo === lessonNoB);
    if (!entryA || !entryB) return;

    const [{ getVocabByIds, getGrammarByIds }, { mapVocabDocToWord }] = await Promise.all([
      import('@/lib/firestore/content'),
      import('@/types/vocab'),
    ]);

    // --- Fetch & map vocab
    const [vocabA, vocabB] = await Promise.all([
      getVocabByIds(entryA.vocabIds || []),
      getVocabByIds(entryB.vocabIds || []),
    ]);
    const wordsA = vocabA.map((doc: any) => mapVocabDocToWord(doc));
    const wordsB = vocabB.map((doc: any) => mapVocabDocToWord(doc));

    // Dedup vocab by id
    const vocabMap = new Map<string, Word>();
    for (const w of [...wordsA, ...wordsB]) {
      if (w?.id) vocabMap.set(String(w.id), w as Word);
    }
    const vocabAll = Array.from(vocabMap.values());

    // --- Fetch grammar (raw points)
    const [grammarA, grammarB] = await Promise.all([
      getGrammarByIds(entryA.grammarIds || []),
      getGrammarByIds(entryB.grammarIds || []),
    ]);
    const grammarPoints = [...grammarA, ...grammarB]
      .filter(Boolean)
      .reduce((acc: any[], gp: any) => {
        const id = gp?.id ?? gp?.key ?? gp?._id;
        if (!id) return acc;
        if (!acc.find(x => (x.id ?? x.key ?? x._id) === id)) acc.push(gp);
        return acc;
      }, []);

    // --- Build EXAM items
    const items: QuizItem[] = [];

    // 1) VOCAB matching (chunks of 4), 20s
    const vocabShuffled = shuffle(vocabAll.slice());
    for (let i = 0; i + 3 < vocabShuffled.length; i += 4) {
      const chunk = vocabShuffled.slice(i, i + 4);
      const match = buildMatching(chunk as Word[]);
      if (match) {
        (match as any).perQuestionSec = 20;
        items.push(match as unknown as QuizItem);
      }
    }
    // Leftovers → MCQ per leftover, 10s
    const leftover = vocabShuffled.length % 4;
    if (leftover) {
      const start = vocabShuffled.length - leftover;
      const leftWords = vocabShuffled.slice(start);
      const pool = vocabShuffled;
      const buildMCQ = (w: Word) => {
        const correct = w.english;
        const distractors = shuffle(pool.filter(x => x.id !== w.id)).slice(0, 3).map(x => x.english);
        const choices = shuffle([correct, ...distractors]);
        const prompt = w.kanji || w.hiragana || w.romaji || w.english;
        return {
          id: `exam_mcq_${w.id}`,
          type: 'mcq',
          prompt,
          choices,
          correct,
          sourceId: w.id,
          perQuestionSec: 10,
        } as unknown as QuizItem;
      };
      leftWords.forEach(w => items.push(buildMCQ(w as Word)));
    }

    // 2) GRAMMAR MCQ (once per point), 18s
    const grammarMCQs = buildGrammarQuizFromPool(grammarPoints as any, grammarPoints.length)
      .map(q => ({ ...q, perQuestionSec: 18 })) as QuizItem[];
    items.push(...grammarMCQs);

    // Mix
    const finalItems = shuffle(items);

    // Enter exam mode
    set({
      quiz: finalItems,
      quizIndex: 0,
      quizResults: [],
      quizConfig: { ...get().quizConfig, size: finalItems.length }, // per-question time is per item
      stage: 'quiz',
      quizMode: 'exam',
      lastExamPair: { a: lessonNoA, b: lessonNoB },
    });
  },
  recordExamStatsAndPersist: async ({ scorePercentage, timeTakenPerQuestionSec, totalQuestions, correct, durationSec }) => {
    const auth = useAuth.getState();
    const uid = auth.user?.uid;
    const pair = useSession.getState().lastExamPair;
    if (!uid || !pair) { console.warn('[exam] missing uid or lastExamPair'); return; }

    const examDate = new Date().toISOString();
    const entry = {
      examDate,
      lessonNo: [pair.a, pair.b] as [number, number],
      examStats: { scorePercentage, timeTakenPerQuestionSec, totalQuestions, correct, ...(durationSec ? { durationSec } : {}) },
    };

    try {
      const [{ appendExamStats }, { loadBootstrap, saveBootstrap }] = await Promise.all([
        import('@/services/progressMutationV1'),
        import('@/lib/bootstrap'),
      ]);

      // 1) Firestore (idempotent for the day)
      await appendExamStats(uid, entry);

      // 2) Mirror into bootstrap cache NOW for local guards
      const boot = loadBootstrap();
      if (boot) {
        const prevLP = boot.lessonProgress ?? { completed: [], failed: [], current: [], examsStats: [] };
        const prevExams = Array.isArray(prevLP.examsStats) ? prevLP.examsStats : [];
        // Deduplicate by examDate
        const already = prevExams.some(e => String(e.examdate).slice(0,10) === examDate.slice(0,10));
        const nextExams = already ? prevExams : [...prevExams, entry];

        saveBootstrap({
          ...boot,
          lessonProgress: { ...prevLP, examsStats: nextExams },
          cachedAt: Date.now(),
        } as any);
      }

      // 3) Mark in-session flag for same-run guards
      useSession.setState({ examTakenISO: examDate.slice(0,10), lastExamPair: null });
    } catch (e) {
      console.warn('[exam] failed to append exam stats', e);
    }
  },
  // recordExamStatsAndPersist: async (args: {
  //   scorePercentage: number;
  //   timeTakenPerQuestionSec: number;
  //   totalQuestions: number;
  //   correct: number;
  //   durationSec?: number;
  // }) => {
  //   const { scorePercentage, timeTakenPerQuestionSec, totalQuestions, correct, durationSec } = args;

  //   const auth = useAuth.getState();
  //   const uid = auth.user?.uid;
  //   const pair = get().lastExamPair;

  //   if (!uid || !pair) {
  //     console.warn('[exam] missing uid or lastExamPair');
  //     return;
  //   }

  //   // ISO with time; we’ll also derive day-only for “one-per-day” checks elsewhere
  //   const examDateISO = new Date().toISOString();

  //   const entry = {
  //     examDate: examDateISO,
  //     lessonNo: [pair.a, pair.b] as [number, number],
  //     examStats: {
  //       scorePercentage,
  //       timeTakenPerQuestionSec,
  //       totalQuestions,
  //       correct,
  //       ...(durationSec ? { durationSec } : {}),
  //     },
  //   };

  //   try {
  //     // Persist to Firestore
  //     const [{ appendExamStats }, bootstrapMod] = await Promise.all([
  //       import('@/services/progressMutationV1'),
  //       import('@/lib/bootstrap'),
  //     ]);
  //     await appendExamStats(uid, entry);

  //     // Mirror into bootstrap for instant UI
  //     const { loadBootstrap, saveBootstrap } = bootstrapMod;
  //     const boot = loadBootstrap();
  //     if (boot) {
  //       const prev = boot.lessonProgress ?? { completed: [], failed: [], current: [], examsStats: [] };
  //       const examsStats = Array.isArray(prev.examsStats) ? [...prev.examsStats, entry] : [entry];
  //       const updated = {
  //         ...boot,
  //         lessonProgress: { ...prev, examsStats },
  //         cachedAt: Date.now(),
  //       };
  //       // Avoids strict type issues if your BootstrapBundle type requires fields we’re not touching here
  //       saveBootstrap(updated as any);
  //     }
  //     // inside the try {} of recordExamStatsAndPersist, after saveBootstrap(updated) ...
  //     const todayISO = new Date().toISOString().slice(0, 10);
  //     set({ lastExamPair: null, stage: 'examSummary', /* local guard */ examTakenISO: todayISO });
  //     // Clear the pair so we can’t accidentally reuse it
  //     set({ lastExamPair: null, quizMode: 'exam' });

  //     // Move to summary (no retry)
  //     set({ stage: 'examSummary' });
  //   } catch (e) {
  //     console.warn('[exam] failed to append exam stats', e);
  //     // Still move to summary; we already finished the run.
  //     set({ stage: 'examSummary' });
  //   }
  // },
  canStartExamToday: async () => {
    const todayISO = (await import('@/lib/cache/lessons')).jstTodayISO();
    const [{ loadBootstrap, saveBootstrap }] = await Promise.all([
      import('@/lib/bootstrap'),
    ]);

    const boot = loadBootstrap();
    const lp   = boot?.lessonProgress ?? { completed:[], failed:[], current:[], examsStats:[] };

    // 1) Local cache says it’s done
    const { hasExamForDate } = await import('@/helpers/todayV1');
    if (hasExamForDate(lp, todayISO) || (useSession.getState().examTakenISO === todayISO)) {
      return false; // already taken today
    }

    // 2) Authoritative remote read (one-shot)
    try {
      const [{ readLessonProgress }] = await Promise.all([
        import('@/services/progressReadV1'),
      ]);
      const { useAuth } = await import('@/store/auth');
      const uid = useAuth.getState().user?.uid;
      if (!uid) return true;

      const remote = await readLessonProgress(uid);
      const remoteExams = Array.isArray(remote?.examsStats) ? remote.examsStats : [];
      const remoteTaken = remoteExams.some((x:any) => String(x?.examDate ?? '').slice(0,10) === todayISO);

      if (remoteTaken) {
        // Merge remote -> bootstrap to keep cache fresh (dedupe by examDate)
        const prevExams = Array.isArray(lp.examsStats) ? lp.examsStats : [];
        const byKey = new Map<string, any>();
        [...prevExams, ...remoteExams].forEach(e => byKey.set(String(e.examDate), e));
        const mergedExams = Array.from(byKey.values());

        if (boot) {
          saveBootstrap({
            ...boot,
            lessonProgress: { ...lp, examsStats: mergedExams },
            cachedAt: Date.now(),
          } as any);
        }
        // Session one-liner so UI can short-circuit
        useSession.setState({ examTakenISO: todayISO });
        return false;
      }

      return true; // remote says not taken yet
    } catch {
      // Conservative: if remote check fails, *block* starting a duplicate exam
      return false;
    }
  },

  //srs related
...addSrsToSession(set as any, get as any),
}));
