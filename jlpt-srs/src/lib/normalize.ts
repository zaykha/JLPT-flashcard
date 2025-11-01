// TODO: normalizeWord, normalizeList, wid
// src/lib/normalize.ts
// Minimal shape expected from a raw vocab feed
export type RawWord = {
  word?: string;
  furigana?: string;
  meaning?: string;
  level?: number;
};
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
  const levelNum = (r.level as JLPTLevel) ?? 3;
  const level = ((): Word['level'] => {
    switch (levelNum) {
      case 1: return 'N1';
      case 2: return 'N2';
      case 3: return 'N3';
      case 4: return 'N4';
      case 5: return 'N5';
      default: return 'N3';
    }
  })();

  return {
    id: wid(kanji, hiragana, english),
    kanji,
    hiragana,
    english,
    level,
    topicKey: 'Abstract & Academic', // default fallback; grouping can update later
  };
}

export function normalizeList(raw: RawWord[]): Word[] {
  return raw
    .map(normalizeWord)
    .filter(w => w.kanji || w.hiragana); // keep at least some JP text
}
