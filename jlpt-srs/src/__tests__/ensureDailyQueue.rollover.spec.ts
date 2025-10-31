// src/__tests__/ensureDailyQueue.rollover.spec.ts
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

const Y = '2025-10-17';
const T = '2025-10-18';
const D2 = '2025-10-16';
const range = { start: 120, end: 140 };

// ✅ Helper to extract the written payload as `any` to avoid FieldPath typings
function writtenPayload() {
  const calls = vi.mocked(firestore.updateDoc).mock.calls;
  // 0: ref, 1: payload
  return (calls[0]?.[1] ?? {}) as any;
}

describe('ensureDailyQueue (rollover & backfill semantics)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('moves stale current (yesterday) → failed with attemptedAt(Y@00:00Z) and assigns fresh current for today', async () => {
    vi.mocked(firestore.getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        completed: [],
        failed: [],
        current: [{ lessonNo: 131, LessonDate: Y }],
        currentDateISO: Y,
      }),
    } as any);

    await ensureDailyQueue('u1', { levelRange: range, perDay: 2 }, { todayISO: T });

    expect(firestore.updateDoc).toHaveBeenCalledTimes(1);
    const payload = writtenPayload();

    expect(payload.failed).toEqual(
      expect.arrayContaining([{ lessonNo: 131, attemptedAt: `${Y}T00:00:00.000Z` }]),
    );
    expect(payload.current).toEqual(
      expect.arrayContaining([expect.objectContaining({ LessonDate: T })]),
    );
    expect(payload.currentDateISO).toBe(T);
  });

  it('backfills missed days (perDay each) into failed with attemptedAt per missed day, then assigns today current', async () => {
    vi.mocked(firestore.getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        completed: [],
        failed: [],
        current: [],
        currentDateISO: D2, // last active was 16th
      }),
    } as any);

    await ensureDailyQueue('u1', { levelRange: { start: 121, end: 140 }, perDay: 2 }, { todayISO: T });

    expect(firestore.updateDoc).toHaveBeenCalledTimes(1);
    const payload = writtenPayload();

    expect(payload.failed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attemptedAt: `${Y}T00:00:00.000Z` }),
        expect.objectContaining({ attemptedAt: `${Y}T00:00:00.000Z` }),
      ]),
    );
    expect(payload.current).toEqual(
      expect.arrayContaining([expect.objectContaining({ LessonDate: T })]),
    );
    expect(payload.currentDateISO).toBe(T);
  });

  it('returns no_more_lessons when range exhausted (no write unless only moving stale/backfill)', async () => {
    vi.mocked(firestore.getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        completed: Array.from({ length: 21 }).map((_, i) => ({
          lessonNo: 120 + i,
          completedAt: '2025-10-10T00:00:00.000Z',
        })),
        failed: [],
        current: [],
        currentDateISO: Y,
      }),
    } as any);

    const res = await ensureDailyQueue(
      'u1',
      { levelRange: { start: 120, end: 140 }, perDay: 2 },
      { todayISO: T },
    );

    expect(res.wrote).toBe(false);
    expect(res.reason).toBe('no_more_lessons');
    expect(firestore.updateDoc).not.toHaveBeenCalled();
    expect(firestore.setDoc).not.toHaveBeenCalled();
  });

  it('quota met but stale exists → writes only to move stale/backfills, does not assign new current', async () => {
    vi.mocked(firestore.getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        completed: [
          { lessonNo: 125, completedAt: `${T}T01:00:00.000Z` },
          { lessonNo: 126, completedAt: `${T}T02:00:00.000Z` },
        ],
        failed: [],
        current: [{ lessonNo: 121, LessonDate: Y }], // stale
        currentDateISO: Y,
      }),
    } as any);

    const res = await ensureDailyQueue('u1', { levelRange: range, perDay: 2 }, { todayISO: T });

    expect(res.reason).toBe('quota_met');
    expect(firestore.updateDoc).toHaveBeenCalledTimes(1);

    const payload = writtenPayload();
    expect(payload.failed).toEqual(
      expect.arrayContaining([{ lessonNo: 121, attemptedAt: `${Y}T00:00:00.000Z` }]),
    );
    expect(payload.current).toEqual([]); // no new assignment
    expect(payload.currentDateISO).toBe(T);
  });
});
