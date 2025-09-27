// TODO: normalizeWord, normalizeList, wid
// src/lib/normalize.ts
import type { RawWord } from './api';
import type { Word, JLPTLevel } from '@/types/vocab';

// Make a stable id for a word (avoid commas vs semicolons etc.)
export function wid(kanji: string, hira: string, english: string) {
  const k = (kanji || '').trim();
  const h = (hira || '').trim();
  const e = (english || '').trim().toLowerCase();
  return `${k}|${h}|${e}`;
}

export function normalizeWord(r: RawWord): Word {
  const kanji = (r.word || '').trim();
  const hiragana = (r.furigana || '').trim();
  const english = (r.meaning || '').trim();
  const level = (r.level as JLPTLevel) ?? 3;

  return {
    id: wid(kanji, hiragana, english),
    kanji,
    hiragana,
    english,
    level,
    topicKey: '__UNASSIGNED__', // will be filled by grouping
  };
}

export function normalizeList(raw: RawWord[]): Word[] {
  return raw
    .map(normalizeWord)
    .filter(w => w.kanji || w.hiragana); // keep at least some JP text
}
