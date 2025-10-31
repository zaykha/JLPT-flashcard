import { sanitizeSnapshot } from '@/helpers/sanitize';
import type { LessonQuizSnapshot } from '@/lib/user-data';

export type AttemptsLS = {
  vocab?: LessonQuizSnapshot[];
  grammar?: LessonQuizSnapshot[];
  best?: { vocab?: LessonQuizSnapshot | null; grammar?: LessonQuizSnapshot | null };
};

function attemptsKey(uid: string, lessonNo: number) {
  return `koza.attempts.${uid}.${lessonNo}`;
}

export function loadLocalAttempts(uid: string, lessonNo: number): AttemptsLS | null {
  try {
    const raw = localStorage.getItem(attemptsKey(uid, lessonNo));
    return raw ? (JSON.parse(raw) as AttemptsLS) : null;
  } catch {
    return null;
  }
}

function saveLocalAttempts(uid: string, lessonNo: number, data: AttemptsLS) {
  try { localStorage.setItem(attemptsKey(uid, lessonNo), JSON.stringify(data)); } catch {}
}

export function saveLocalAttempt(uid: string, lessonNo: number, phase: 'vocab' | 'grammar', snap: LessonQuizSnapshot) {
  const current = loadLocalAttempts(uid, lessonNo) || {};
  const arr = (current[phase] ?? []).slice();
  arr.push(sanitizeSnapshot(snap));
  current[phase] = arr;
  saveLocalAttempts(uid, lessonNo, current);
}

export function saveLocalBest(uid: string, lessonNo: number, phase: 'vocab' | 'grammar', snap: LessonQuizSnapshot) {
  const current = loadLocalAttempts(uid, lessonNo) || {};
  current.best = current.best || {};
  current.best[phase] = sanitizeSnapshot(snap);
  saveLocalAttempts(uid, lessonNo, current);
}

export function clearLocalAttempts(uid: string, lessonNo: number) {
  try { localStorage.removeItem(attemptsKey(uid, lessonNo)); } catch {}
}

