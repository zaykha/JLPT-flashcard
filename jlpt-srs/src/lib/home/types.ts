export type QuizType = 'vocab' | 'grammar';

export type QuizAttemptStat = {
  id: string;
  lessonNo: number;
  dateISO: string;
  score: number | null;
  averageTime: number | null;
  questionCount: number;
  passed: boolean;
};

export type ProgressInsights = {
  calendarRecords: Array<{
    dateISO: string;
    vocabAttempts: number;
    vocabAverage: number;
    grammarAttempts: number;
    grammarAverage: number;
    completed: boolean;
  }>;
  vocabStats: QuizAttemptStat[];
  grammarStats: QuizAttemptStat[];
};
