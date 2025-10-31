import type { JLPTLevelStr } from "./userV1";

export type LessonQuizItem = {
wordId?: string;
grammarId?: string;
timeSec: number;
correct: boolean;
nextReview?: string; // ISO string
};


export type LessonQuizSnapshot = {
durationSec: number;
items: LessonQuizItem[];
};


export type LessonCompletion = {
lessonNo?: number;
level?: JLPTLevelStr | null;
completedAt: string; // ISO string
quiz?: LessonQuizSnapshot;
grammarQuiz?: LessonQuizSnapshot;
};


export type LessonFailure = {
lessonNo?: number;
level?: JLPTLevelStr | null;
attemptedAt: string; // ISO string
quiz?: LessonQuizSnapshot;
grammarQuiz?: LessonQuizSnapshot;
};

export type ExamStatsEntry = {
  examdate: string; // "YYYY-MM-DD"
  lessonNo: number[]; // e.g., [130,131]
  examStats: {
    scorePercentage: number;
    timeTakenPerQuestion?: number;
    // add any other fields you want...
  };
};

export type LessonProgress = {
completed: LessonCompletion[];
failed: LessonFailure[];
current?: Array<{ lessonNo: number; LessonDate: string }>; // per-day queue
currentDateISO?: string; // YYYY-MM-DD (JST day for current queue)
examsStats?: ExamStatsEntry[]; // <-- new
};


export type SrsStageLesson = { lessonNo: number; nextReview: string };
export type SrsStageSummary = { stage: number; label: string; lessons: SrsStageLesson[] };
export type SrsSummary = { stages: SrsStageSummary[]; updatedAt?: unknown };