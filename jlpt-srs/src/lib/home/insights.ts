import type { ProgressInsights, QuizAttemptStat, QuizType } from './types';
import type { LessonProgress, LessonCompletion, LessonFailure, LessonQuizSnapshot } from '@/lib/user-data';

type StudyRecordMutable = {
  dateISO: string;
  vocabAttempts: number;
  vocabAverage: number;
  grammarAttempts: number;
  grammarAverage: number;
  completed: boolean;
  vocabScoreAccum: number;
  grammarScoreAccum: number;
};

export function buildProgressInsights(
  progress: LessonProgress | undefined,
  currentLessonNo: number | null,
  currentQuizLength: number,
  currentQuizResults: Array<{ correct: boolean }>,
  currentQuizAttempt: number,
): ProgressInsights {
  const calendarMap = new Map<string, StudyRecordMutable>();
  const vocabStats: QuizAttemptStat[] = [];
  const grammarStats: QuizAttemptStat[] = [];

  const ensureRecord = (dateISO: string): StudyRecordMutable => {
    if (!calendarMap.has(dateISO)) {
      calendarMap.set(dateISO, {
        dateISO,
        vocabAttempts: 0,
        vocabAverage: 0,
        grammarAttempts: 0,
        grammarAverage: 0,
        completed: false,
        vocabScoreAccum: 0,
        grammarScoreAccum: 0,
      });
    }
    return calendarMap.get(dateISO)!;
  };

  const registerStats = (
    target: QuizAttemptStat[],
    snapshot: LessonQuizSnapshot | undefined,
    lessonNo: number,
    timestamp: string | undefined,
    passed: boolean,
  ) => {
    if (!snapshot) return;
    const dateISO = (timestamp ?? '').slice(0, 10);
    target.push({
      id: `${lessonNo}-${dateISO}-${target.length}`,
      lessonNo,                     
      dateISO,
      score: computeSnapshotScore(snapshot),
      averageTime: computeAverageTime(snapshot),
      questionCount: snapshot.items?.length ?? 0,
      passed,
    });
  };


  const mergeRecord = (
    dateISO: string,
    snapshot: LessonQuizSnapshot | undefined,
    type: QuizType,
    passed: boolean,
  ) => {
    if (!snapshot) return;
    const record = ensureRecord(dateISO);
    const score = computeSnapshotScore(snapshot);
    if (type === 'vocab') {
      record.vocabAttempts += 1;
      if (typeof score === 'number') {
        record.vocabScoreAccum += score;
        record.vocabAverage = Math.round(record.vocabScoreAccum / record.vocabAttempts);
      }
    } else {
      record.grammarAttempts += 1;
      if (typeof score === 'number') {
        record.grammarScoreAccum += score;
        record.grammarAverage = Math.round(record.grammarScoreAccum / record.grammarAttempts);
      }
    }
    if (passed) record.completed = true;
  };

// FAILED
(progress?.failed ?? []).forEach((entry: LessonFailure) => {
  // coerce lessonNo, with legacy fallback to lessonId
  const ln =
    typeof entry.lessonNo === 'number'
      ? entry.lessonNo
      : Number.isFinite(parseInt((entry as any).lessonId, 10))
      ? parseInt((entry as any).lessonId, 10)
      : NaN;

  if (!Number.isFinite(ln)) {
    console.warn('[insights] skip failed entry without lessonNo/lessonId', entry);
    return;
  }

  const attemptDate = (entry.attemptedAt ?? '').slice(0, 10);
  registerStats(vocabStats, entry.quiz, ln, entry.attemptedAt, false);
  registerStats(grammarStats, entry.grammarQuiz, ln, entry.attemptedAt, false);
  mergeRecord(attemptDate, entry.quiz, 'vocab', false);
  mergeRecord(attemptDate, entry.grammarQuiz, 'grammar', false);
});

// COMPLETED
(progress?.completed ?? []).forEach((entry: LessonCompletion) => {
  const ln =
    typeof entry.lessonNo === 'number'
      ? entry.lessonNo
      : Number.isFinite(parseInt((entry as any).lessonId, 10))
      ? parseInt((entry as any).lessonId, 10)
      : NaN;

  if (!Number.isFinite(ln)) {
    console.warn('[insights] skip completed entry without lessonNo/lessonId', entry);
    return;
  }

  const completionDate = (entry.completedAt ?? '').slice(0, 10);
  registerStats(vocabStats, entry.quiz, ln, entry.completedAt, true);
  registerStats(grammarStats, entry.grammarQuiz, ln, entry.completedAt, true);
  mergeRecord(completionDate, entry.quiz, 'vocab', true);
  mergeRecord(completionDate, entry.grammarQuiz, 'grammar', true);
});


  // reflect in-progress quiz attempts today (without marking completed)
if (currentLessonNo && currentQuizResults.length > 0 && currentQuizLength > 0) {
  const todayRecord = ensureRecord(new Date().toISOString().slice(0, 10));
  if (!todayRecord.completed) {
    todayRecord.vocabAttempts = Math.max(todayRecord.vocabAttempts, currentQuizAttempt);
  }
}

  const calendarRecords = Array.from(calendarMap.values())
    .map(record => {
      const { vocabScoreAccum, grammarScoreAccum, ...rest } = record;
      return {
        ...rest,
        vocabAverage: record.vocabAttempts
          ? Math.round(record.vocabScoreAccum / record.vocabAttempts)
          : 0,
        grammarAverage: record.grammarAttempts
          ? Math.round(record.grammarScoreAccum / record.grammarAttempts)
          : 0,
      };
    })
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));

  vocabStats.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  grammarStats.sort((a, b) => a.dateISO.localeCompare(b.dateISO));

  return { calendarRecords, vocabStats, grammarStats };
}

export function computeSnapshotScore(snapshot: LessonQuizSnapshot | undefined): number | null {
  if (!snapshot) return null;
  const items = snapshot.items ?? [];
  if (!items.length) return null;
  const correct = items.filter(item => item.correct).length;
  return Math.round((correct / items.length) * 100);
}

export function computeAverageTime(snapshot: LessonQuizSnapshot | undefined): number | null {
  if (!snapshot) return null;
  const items = snapshot.items ?? [];
  if (items.length) {
    const total = items.reduce((sum, item) => sum + (item.timeSec ?? 0), 0);
    const average = total / items.length;
    return Number.isFinite(average) ? Math.round(average * 10) / 10 : null;
  }
  if (typeof snapshot.durationSec === 'number' && snapshot.durationSec > 0) {
    return Math.round(snapshot.durationSec * 10) / 10;
  }
  return null;
}

export function computeStreakStats(progress: LessonProgress | undefined) {
  if (!progress) return { current: 0, longest: 0, daysStudied: 0 };
  const dates = (progress.completed ?? [])
    .map(entry => entry.completedAt)
    .filter((value): value is string => typeof value === 'string')
    .map(iso => iso.slice(0, 10));

  const uniqueDates = Array.from(new Set(dates)).sort();
  const daysStudied = uniqueDates.length;
  if (!uniqueDates.length) {
    return { current: 0, longest: 0, daysStudied };
  }

  // Longest streak across all time
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  uniqueDates.forEach(dateISO => {
    if (!prev) {
      run = 1;
    } else {
      const prevDate = new Date(prev);
      prevDate.setDate(prevDate.getDate() + 1);
      run = prevDate.toISOString().slice(0, 10) === dateISO ? run + 1 : 1;
    }
    if (run > longest) longest = run;
    prev = dateISO;
  });

  // Current streak should be considered "live" if it extends through yesterday.
  const completedSet = new Set(uniqueDates);
  const ref = new Date();
  const todayISO = ref.toISOString().slice(0, 10);
  const base = new Date(ref);
  if (!completedSet.has(todayISO)) {
    base.setDate(base.getDate() - 1); // use yesterday if today not completed
  }

  let current = 0;
  // Walk backwards from base day while there are consecutive completions
  for (let i = 0; i < 365; i += 1) {
    const iso = base.toISOString().slice(0, 10);
    if (completedSet.has(iso)) {
      current += 1;
      base.setDate(base.getDate() - 1);
    } else {
      break;
    }
  }

  return { current, longest, daysStudied };
}

export function formatScore(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '--';
  return `${value}%`;
}

export function formatAverageTime(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '--';
  return `${value.toFixed(1)}s`;
}
