// src/__tests__/ensureDailyQueue.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ensureDailyQueue } from '@/services/StudyPlanV1';
import * as firestore from 'firebase/firestore';

vi.mock('firebase/firestore', async () => {
  const actual: any = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    doc: vi.fn((...args) => ({ __key: args.join('/') })),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
  };
});

const T = '2025-10-18';
const range = { start: 100, end: 200 };

describe('ensureDailyQueue (day-of side-effects only)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not fill current when quota met (no writes)', async () => {
    vi.mocked(firestore.getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        completed: [
          { lessonNo: 101, completedAt: `${T}T03:00:00.000Z` },
          { lessonNo: 102, completedAt: `${T}T04:00:00.000Z` },
        ],
        failed: [],
        current: [],
        currentDateISO: T,
      }),
    } as any);

    const res = await ensureDailyQueue('u1', { levelRange: range, perDay: 2 }, { todayISO: T });

    expect(res.wrote).toBe(false);
    expect(res.reason).toBe('quota_met');
    expect(vi.mocked(firestore.updateDoc)).not.toHaveBeenCalled();
    expect(vi.mocked(firestore.setDoc)).not.toHaveBeenCalled();
  });

  it('assigns only the missing count when partially completed today (writes once)', async () => {
    vi.mocked(firestore.getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        completed: [{ lessonNo: 101, completedAt: `${T}T03:00:00.000Z` }],
        failed: [],
        current: [],
        currentDateISO: T,
      }),
    } as any);

    const res = await ensureDailyQueue('u1', { levelRange: range, perDay: 2 }, { todayISO: T });

    expect(res.wrote).toBe(true);
    expect(res.current?.length).toBe(1);
    expect(vi.mocked(firestore.updateDoc)).toHaveBeenCalledTimes(1);
    const [, payload] = vi.mocked(firestore.updateDoc).mock.calls[0];
    expect(payload).toEqual(
      expect.objectContaining({
        current: expect.arrayContaining([
          expect.objectContaining({ LessonDate: T }),
        ]),
        currentDateISO: T,
      }),
    );
  });
});
