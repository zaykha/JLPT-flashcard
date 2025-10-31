import type { LessonCompletion, LessonFailure } from "@/types/lessonV1";

export const LESSON_PROGRESS_LIMIT = 400;
type HistoryItem = LessonCompletion | LessonFailure;

/**
* Clamp and sort lesson history while preserving chronological order (oldest→newest)
* after truncation to MAX most recent by timestamp.
*/
export function clampLessonHistory<T extends HistoryItem>(list: T[]): T[] {
const getTime = (it: HistoryItem) =>
'completedAt' in it ? it.completedAt : (it as LessonFailure).attemptedAt;


// Sort newest→oldest, take top N, then sort oldest→newest for display/consistency
return list
.slice()
.sort((a, b) => (getTime(a) > getTime(b) ? -1 : 1))
.slice(0, LESSON_PROGRESS_LIMIT)
.sort((a, b) => (getTime(a) < getTime(b) ? -1 : 1));
}