// ============================================================================
// 3) helpers/stage.ts  — NEW helper to compute next stage (unit-testable)
// ============================================================================
import type { LessonProgress } from '@/types/lessonV1';
import type { Stage } from '@/types/session';

export function computeNextStage(
  progress: LessonProgress | undefined,
  todayISO: string,
  perDay: 2 | 3,
  alreadyExam: boolean,
  currentStage: Stage
): Stage {
  const currentLen = Array.isArray(progress?.current) ? progress!.current.length : 0;
  const hasCurrent = currentLen > 0;

  if (hasCurrent) return 'studying';
  const { getTodaysLessonNos } = require('@/helpers/todayV1'); // avoids circular import in some builds
  const todaysNos = getTodaysLessonNos(progress, todayISO);

  if (todaysNos.length >= perDay) {
    // quota met: only go to exam fresher if exam not taken
    return alreadyExam ? currentStage : 'examFresher';
  }
  return 'studying';
}