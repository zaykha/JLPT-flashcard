
// ======================================================================
// src/helpers/kana.ts
// ======================================================================
import { HIRA_TABLE } from '@/lib/kana/table';

// Unicode guards
export const hasKanji = (s?: string) => !!s && /[\u4E00-\u9FFF]/u.test(s);
export const hasKana  = (s?: string) => !!s && /[\u3040-\u30FF]/u.test(s);
export const isMixedKanjiKanaString = (s?: string) => !!s && hasKanji(s) && hasKana(s);

// rough mora count
export const moraCount = (h?: string) => {
  if (!h) return 0;
  let c = 0;
  for (const ch of h) {
    if (ch === 'ー') continue;
    if (/[\u3040-\u30FF]/.test(ch)) c += 1;
  }
  return c;
};

export const countHan = (s: string): number => {
  return Array.from(s).filter(ch => /\p{Script=Han}/u.test(ch)).length;
}
// Build ROMA maps from existing table
const ROMA_BY_CHAR = new Map<string, string>(HIRA_TABLE.map(x => [x.char, x.romaji]));
const CHARS_BY_VOWEL = HIRA_TABLE.reduce<Record<string, string[]>>((acc, x) => {
  const v = (x.romaji.match(/[aiueo]$/)?.[0]) || '';
  if (!v) return acc;
  (acc[v] ||= []).push(x.char);
  return acc;
}, {});

// Dakuten/handakuten families by consonant head
const DAKU_HEADS: Record<string, string> = { k: 'g', s: 'z', t: 'd', h: 'b' };
const HANDAKU_HEADS: Record<string, string> = { h: 'p' };

// Extract (head, vowel) from romaji (ki -> {head:"k", v:"i"})
function parseRoma(roma: string): { head: string; v: string } | null {
  const m = roma.match(/^([a-z]+)?([aiueo])$/);
  if (!m) return null;
  return { head: (m[1] ?? '').replace(/[^a-z]/g, ''), v: m[2] };
}

function sameVowelChars(ch: string): string[] {
  const roma = ROMA_BY_CHAR.get(ch) || '';
  const v = (roma.match(/[aiueo]$/)?.[0]) || '';
  return v ? (CHARS_BY_VOWEL[v] || []) : [];
}

function voicedVariants(ch: string): string[] {
  const roma = ROMA_BY_CHAR.get(ch) || '';
  const p = parseRoma(roma);
  if (!p) return [];
  const out: string[] = [];

  const tryRoma = (r: string) => {
    const hit = HIRA_TABLE.find(x => x.romaji === r);
    if (hit) out.push(hit.char);
  };

  if (DAKU_HEADS[p.head]) tryRoma(DAKU_HEADS[p.head] + p.v);
  if (HANDAKU_HEADS[p.head]) tryRoma(HANDAKU_HEADS[p.head] + p.v);

  // allow unvoicing when already voiced/handaku
  const unvoice: Record<string, string> = { g: 'k', z: 's', d: 't', b: 'h', p: 'h' };
  if (unvoice[p.head]) tryRoma(unvoice[p.head] + p.v);

  return out.filter(c => c !== ch);
}

/** Deterministic near-mutations within same vowel column and dakuten/handakuten toggles. */
export function mutateHiraganaNear(correct: string, howMany = 8): string[] {
  const chars = Array.from(correct);
  const idx = chars.map((ch, i) => ({ ch, i })).filter(({ ch }) => /[\u3040-\u309F]/.test(ch));

  const set = new Set<string>();
  for (const { ch, i } of idx) {
    const sameVowelPool = sameVowelChars(ch).filter(c => c !== ch);
    const voicePool = voicedVariants(ch);

    for (const repl of [...voicePool, ...sameVowelPool]) {
      const clone = chars.slice();
      clone[i] = repl;
      const candidate = clone.join('');
      if (candidate !== correct) set.add(candidate);
      if (set.size >= howMany) return Array.from(set);
    }
    if (set.size >= howMany) break;
  }
  return Array.from(set).slice(0, howMany);
}

// Keep only the primary kanji “surface” (first variant, no punctuation/kana)
export function primaryKanjiVariant(input?: string): string | undefined {
  if (!input) return undefined;
  // remove common bracket types
  const withoutBrackets = input.replace(/[()\[\]{}（）［］｛｝【】『』「」]/g, '');
  // split by typical separators and take the first chunk
  const firstChunk = withoutBrackets.split(/[、，,／\/｜|・;；]/)[0] || '';
  // keep only CJK Han characters
  const kanjiOnly = Array.from(firstChunk).filter(ch => /\p{Script=Han}/u.test(ch)).join('');
  return kanjiOnly || undefined;
}