import { describe, it, expect } from 'vitest';
import {
  resolveStageFromProgress,
  examTakenToday,
  countLessonsDoneToday,
} from '@/helpers/flowGuards';
// import type { FlowStage } from '@/helpers/flowGuards';

type MinimalProgress = {
  completed?: Array<{ lessonNo: number; completedAt?: string; LessonDate?: string }>;
  failed?: Array<{ lessonNo: number; attemptedAt?: string; LessonDate?: string }>;
  current?: Array<{ lessonNo: number; LessonDate: string }>;
  examsStats?: Array<{ examDate: string; lessonNo: [number, number] }>;
};

const today = '2025-10-18';

describe('flowGuards', () => {
  it('studying when current has items regardless of done count', () => {
    const prog: MinimalProgress = {
      current: [{ lessonNo: 180, LessonDate: today }],
      completed: [],
      failed: [],
      examsStats: [],
    };
    expect(resolveStageFromProgress(prog, today, 2)).toBe('studying');
  });

  it('examFresher when current empty & 2 lessons done today & no exam yet', () => {
    const prog: MinimalProgress = {
      current: [],
      completed: [{ lessonNo: 180, completedAt: `${today}T08:00:00Z` }],
      failed: [{ lessonNo: 181, attemptedAt: `${today}T09:00:00Z` }],
      examsStats: [],
    };
    expect(countLessonsDoneToday(prog, today)).toBe(2);
    expect(examTakenToday(prog, today)).toBe(false);
    expect(resolveStageFromProgress(prog, today, 2)).toBe('examFresher');
  });

  it('buy when current empty & 2 lessons done & exam already recorded', () => {
    const prog: MinimalProgress = {
      current: [],
      completed: [{ lessonNo: 180, completedAt: `${today}T08:00:00Z` }],
      failed: [{ lessonNo: 181, attemptedAt: `${today}T09:00:00Z` }],
      // 👇 tuple type — either annotate as [number, number] or add `as const`
      examsStats: [{ examDate: `${today}T10:00:00Z`, lessonNo: [180, 181] as [number, number] }],
    };
    expect(resolveStageFromProgress(prog, today, 2)).toBe('buy');
  });

  it('studying when current empty & only 1 lesson done', () => {
    const prog: MinimalProgress = {
      current: [],
      completed: [{ lessonNo: 180, completedAt: `${today}T08:00:00Z` }],
      failed: [],
      examsStats: [],
    };
    expect(resolveStageFromProgress(prog, today, 2)).toBe('studying');
  });
});
