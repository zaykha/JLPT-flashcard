// TODO: SRS intervals + helpers
import dayjs from 'dayjs';

export const INTERVALS_DAYS = [1, 3, 7, 14, 30]; // simple v1

export const now = () => Date.now();

export function nextDueFromStep(step: number) {
  const idx = Math.max(0, Math.min(step, INTERVALS_DAYS.length - 1));
  const days = INTERVALS_DAYS[idx];
  return dayjs().add(days, 'day').valueOf();
}

export function promote(step: number) {
  return Math.min(step + 1, INTERVALS_DAYS.length - 1);
}

export function clampStep(step: number) {
  return Math.max(-1, Math.min(step, INTERVALS_DAYS.length - 1));
}
