// src/__tests__/decideDailyQueue.spec.ts
import { describe, it, expect } from 'vitest';
import { decideDailyQueue } from '@/services/StudyPlanV1.decider';

const range = { start: 100, end: 200 };
const today = '2025-10-18';

describe('decideDailyQueue (pure logic)', () => {
  it('does not write if quota met', () => {
    const prog = {
      completed: [{ lessonNo: 101, completedAt: `${today}T10:00:00.000Z` }],
      current: [{ lessonNo: 102, LessonDate: today }],
      failed: [],
    };
    const res = decideDailyQueue(prog, today, range, 2);
    expect(res.shouldWrite).toBe(false);
    expect(res.reason).toBe('quota_met');
    expect(res.next).toEqual([]);
  });

  it('picks next after highest touched when quota not met', () => {
    const prog = {
      completed: [{ lessonNo: 110, completedAt: '2025-10-17T01:00:00.000Z' }],
      failed: [{ lessonNo: 112 }],
      current: [{ lessonNo: 115, LessonDate: '2025-10-17' }],
    };
    const res = decideDailyQueue(prog, today, range, 2);
    // highest touched is 115 → next is 116, then 117
    expect(res.shouldWrite).toBe(true);
    expect(res.reason).toBe('ok');
    expect(res.next).toEqual([116, 117]);
  });

  it('skips touched numbers', () => {
    const prog = {
      completed: [{ lessonNo: 120, completedAt: '2025-10-17T01:00:00.000Z' }],
      failed: [{ lessonNo: 121 }, { lessonNo: 122 }],
      current: [{ lessonNo: 123, LessonDate: '2025-10-17' }],
    };
    const res = decideDailyQueue(prog, today, range, 3);
    // touched: 120..123 → next start from 124 skipping any touched
    expect(res.shouldWrite).toBe(true);
    expect(res.next).toEqual([124, 125, 126]);
  });
});
