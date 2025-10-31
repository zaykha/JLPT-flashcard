import { nextExamsStatsForWrite } from '@/services/progressMutationV1';
import { describe, it, expect } from 'vitest';


type ExamTuple = { examDate: string; lessonNo: [number, number] };

describe('nextExamsStatsForWrite', () => {
  it('appends when day not present', () => {
    const arr: ExamTuple[] = [];
    const next = nextExamsStatsForWrite(arr, {
      examDate: '2025-10-18T09:00:00Z',
      lessonNo: [180, 181],
    });
    expect(next).toHaveLength(1);
    expect(next[0].lessonNo).toEqual([180, 181]);
  });

  it('no-ops when same day already exists', () => {
    const arr: ExamTuple[] = [{ examDate: '2025-10-18T07:00:00Z', lessonNo: [180, 181] }];
    const next = nextExamsStatsForWrite(arr, {
      examDate: '2025-10-18T09:00:00Z',
      lessonNo: [182, 183],
    });
    expect(next).toEqual(arr);
  });
});
