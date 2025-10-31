import { describe, it, expect } from 'vitest';
import { decideStageFromProgress } from '@/logic/stageGate';

const T = '2025-10-18';

describe('stage gate', () => {
  it('goes to exam fresher when 2 lessons are done and current empty', () => {
    const p = {
      completed: [{ lessonNo: 130, completedAt: `${T}T01:00:00Z` }, { lessonNo: 131, completedAt: `${T}T02:00:00Z` }],
      failed: [],
      current: [],
      examsStats: [],
    };
    const res = decideStageFromProgress(p as any, T, 2);
    expect(res.stage).toBe('examFresher');
    expect(res.pair).toEqual([130, 131]);
  });

  it('goes to buy when exam already taken', () => {
    const p = {
      completed: [{ lessonNo: 130, completedAt: `${T}T01:00:00Z` }, { lessonNo: 131, completedAt: `${T}T02:00:00Z` }],
      current: [],
      examsStats: [{ examDate: `${T}T05:00:00Z` }],
    };
    const res = decideStageFromProgress(p as any, T, 2);
    expect(res.stage).toBe('buy');
  });

  it('studying when current exists', () => {
    const p = { completed: [], failed: [], current: [{ lessonNo: 100, LessonDate: T }] };
    const res = decideStageFromProgress(p as any, T, 2);
    expect(res.stage).toBe('studying');
  });
});
