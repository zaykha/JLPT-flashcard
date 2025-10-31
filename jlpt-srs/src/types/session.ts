// src/types/session.ts

import type { QuizConfig, QuizItem } from '@/types/quiz';
import type { Word } from '@/types/vocab';
import type { GrammarPoint } from '@/types/grammar';
import type { LessonQuizSnapshot } from '@/types/lessonV1';
import type { QuizResultItem } from '@/types/quiz';

export type Stage =
  | 'studying'
  | 'quiz'
  | 'summary'
  | 'grammar'
  | 'grammarQuiz'
  | 'grammarSummary'
  | 'homePage'
  | 'settings'
  | 'examFresher'
  | 'examSummary'
  | 'buy'
  | 'srsFresher'      // 👈 NEW
  | 'srsExam'         // 👈 NEW
  | 'srsSummary';     // 👈 NEW

export type LessonPhase = 'vocab' | 'grammar';

export type SessionState = {
  // Stage & readiness
  stage: Stage;
  stageReady: boolean;
  setStageReady: (v: boolean) => void;
  ensureStageForHome: () => Promise<void>;
  isBuildingToday: boolean;

  // Vocab "study" state
  today: Word[];
  index: number;
  lessonNo: number | null;
  lessonPhase: LessonPhase;

  // Boot rev (used to force Home reloads)
  bootRevision: number;
  bumpBootRevision: () => void;

  // Snapshots / attempts
  lastVocabSnapshot?: LessonQuizSnapshot;
  lastGrammarSnapshot?: LessonQuizSnapshot;
  quizAttempt: number;

  // Grammar study & grammar-quiz state
  grammarToday: GrammarPoint[];
  grammarIndex: number;
  setGrammarToday: (pts: GrammarPoint[]) => void;

  grammarQuiz: QuizItem[];
  grammarQuizIndex: number;
  grammarQuizResults: QuizResultItem[];
  setGrammarQuizIndex: (n: number) => void;
  pushGrammarQuizResult: (r: QuizResultItem) => void;
  resetGrammarQuiz: () => void;
  startGrammarStudy: () => Promise<void>;
  startGrammarQuiz: () => void;

  // Quiz (shared UI) + mode
  quizMode: 'vocab' | 'grammar' | 'exam' | 'srs';
  quiz: QuizItem[];
  quizIndex: number;
  quizConfig: QuizConfig;
  quizResults: QuizResultItem[];

  // General actions
  setStage: (s: Stage) => void;
  setToday: (w: Word[]) => void;
  next: () => void;
  prev: () => void;

  // Vocab flow
  buildTodayFixed: () => Promise<void>;
  buildQuiz: () => void;
  setQuizIndex: (n: number) => void;
  pushQuizResult: (r: QuizResultItem) => void;
  resetQuiz: () => void;

  // Transition helpers
  startGrammarPhase: () => Promise<void>;
  recordLocalAttempt: (args: { durationSec: number }) => Promise<void>;

  /** @deprecated use recordVocabAttemptAndMaybeAdvance / recordGrammarAttemptAndMaybeComplete */
  recordQuizAttemptAndMaybeAdvance?: (args: { durationSec: number }) => Promise<void>;

  // Dedicated vocab/grammar handlers
  recordVocabAttemptAndMaybeAdvance: (args: { durationSec: number }) => Promise<void>;
  recordGrammarAttemptAndMaybeComplete: (args: { durationSec: number }) => Promise<void>;

  // Completion
  canFinishLesson: () => boolean;
  markLessonCompleted: () => Promise<void>;

  // Exam
  examTakenISO?: string;
  lastExamPair: { a: number; b: number } | null;
  setLastExamPair: (pair: { a: number; b: number } | null) => void;
  buildExamFor: (lessonNoA: number, lessonNoB: number) => Promise<void>;
  examDoneForISO: string | null;
  setExamDoneForISO: (iso: string | null) => void;
  recordExamStatsAndPersist: (args: {
    scorePercentage: number;
    timeTakenPerQuestionSec: number;
    totalQuestions: number;
    correct: number;
    durationSec?: number;
  }) => Promise<void>;
  canStartExamToday: () => Promise<boolean>;

  // ===================== SRS ADDITIONS =====================
  /** lesson numbers due today (JST) */
  srsDueToday: number[];
  /** day ISO when SRS was completed (prevents repeat in the same day) */
  srsDoneForISO?: string | null;

  /** Recompute SRS due today from Firestore, mirror to bootstrap, bump rev on change. */
  refreshSrsDueToday: () => Promise<void>;

  /** After daily exam is finished, promote today’s pair from SRS1→SRS2 and unlock SRS. */
  completeDailyExamAndUnlockSrs: (pair: { a: number; b: number }) => Promise<void>;

  /** Build the SRS quiz for due lessons and enter 'srsExam' stage. */
  startSrsFresher: () => Promise<void>;
  /** From the SRS fresher preview, begin the SRS quiz. */
  beginSrsExam: () => Promise<void>;

  /** On SRS summary, promote the due set from SRS2→SRS3 and show 'srsSummary'. */
  finishSrsExamAndPromote: () => Promise<void>;
};
