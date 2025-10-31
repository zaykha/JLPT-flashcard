// ======================================================================
// src/lib/quiz/builders.ts
// ======================================================================
import type { QuizItem } from '@/types/quiz';
import type { Word } from '@/types/vocab';
import { shuffle, pickTop, sample, rebalanceLength } from '@/helpers/arrays';
import { hasKanji, moraCount, mutateHiraganaNear, isMixedKanjiKanaString, countHan } from '@/helpers/kana';
import { scoreMeaningDistractor } from './distractors';

// === VOCAB QUIZ BUILDERS ===
// --- MCQ: Kanji→English (default/safe) ---
export function buildVocabMCQ(
  pool: Word[],
  w: Word,
  opts: { direction?: 'english' | 'kanji' } = {}
): QuizItem {
  const dir = opts.direction ?? 'english';

  // ---- EN choices (JP → EN)  ------------------------------------------
  if (dir === 'english') {
    const correct = w.english;
    // Do not strip kana from mixed strings: show the raw JP surface if present
    const prompt  = w.kanji || w.hiragana || w.romaji || w.english;

    const rawCandidates = sample(
      pool.filter(x => x.id !== w.id && x.english && x.english !== correct),
      60
    );

    const ranked = pickTop(rawCandidates, 12, (c) =>
      scoreMeaningDistractor(correct, c.english, c.topicKey === w.topicKey)
    );

    const chosen = shuffle(ranked).slice(0, 3);
    if (chosen.length < 3) {
      const backfill = shuffle(
        rawCandidates.filter(x => !chosen.some(c => c.id === x.id))
      ).slice(0, 3 - chosen.length);
      chosen.push(...backfill);
    }

    const choices = rebalanceLength(
      shuffle([correct, ...chosen.map(x => x.english)]).slice(0, 4),
      correct.length
    );

    return { id: `q_${w.id}_mcq`, type: 'mcq', prompt, choices, correct, sourceId: w.id };
  }

  // ---- Kanji choices (EN → Kanji/mixed)  -------------------------------
  // Fallback to EN-choices if no kanji
  if (!w.kanji || !hasKanji(w.kanji)) {
    return buildVocabMCQ(pool, w, { direction: 'english' });
  }

  const correctDisplay = w.kanji!; // keep raw kanji/mixed surface
  const targetLen = Math.max(1, countHan(correctDisplay));

  // Candidates: ANY entry that has at least one Han char (pure or mixed)
  const cand = pool.filter(x => x.id !== w.id && x.kanji && hasKanji(x.kanji));

  // Rank by kanji-length proximity (loose) + tiny jitter to break ties
  const ranked = cand
    .map(c => {
      const disp = primaryKanjiVariant(c.kanji!) ?? c.kanji!;
      const len  = Math.max(1, countHan(disp));
      const score = -Math.abs(len - targetLen) + (Math.random() * 0.05);
      return { disp, score };
    })
    .filter(x => x.disp && x.disp !== correctDisplay)
    .sort((a, b) => b.score - a.score);

  // Dedup to top 3
  const seen = new Set<string>();
  const distractors: string[] = [];
  for (const r of ranked) {
    if (!seen.has(r.disp)) {
      seen.add(r.disp);
      distractors.push(r.disp);
      if (distractors.length === 3) break;
    }
  }
  // Backfill if needed
  if (distractors.length < 3) {
    const poolDisplays = cand
      .map(c => c.kanji!)
      .filter(txt => !!txt && txt !== correctDisplay && !seen.has(txt));
    for (let i = poolDisplays.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [poolDisplays[i], poolDisplays[j]] = [poolDisplays[j], poolDisplays[i]];
    }
    for (const d of poolDisplays) {
      distractors.push(d);
      if (distractors.length === 3) break;
    }
  }

  if (distractors.length < 3) {
    // ultimate fallback to EN-choices
    return buildVocabMCQ(pool, w, { direction: 'english' });
  }

  const choices = shuffle([correctDisplay, ...distractors]);
  return {
    id: `q_${w.id}_mcqk`,   // different id pattern to avoid collision
    type: 'mcq',            // <<< IMPORTANT: keep 'mcq' so UI renders choices
    prompt: w.english,      // EN → pick the Kanji/mixed
    choices,                // e.g., "閉", "閉じる", "開", "開く"
    correct: correctDisplay,
    sourceId: w.id,
  };
}
// --- Kanji→Hiragana (only when original kanji string is NOT mixed and hiragana exists) ---
export function buildKanjiToHiragana(pool: Word[], w: Word): QuizItem {
  const origKanji = w.kanji;
  if (!origKanji || isMixedKanjiKanaString(origKanji) || !w.hiragana) return buildVocabMCQ(pool, w);

  const correct = w.hiragana;
  // Create near variants and force the same length as the correct reading for tighter similarity
  const variants = mutateHiraganaNear(correct, 16)
    .filter(v => v !== correct && v.length === correct.length)
    .slice(0, 8);
  const distractors = variants.slice(0, 3);
  const choices = shuffle([correct, ...distractors]);

  return {
    id: `q_${w.id}_k2h`,
    type: 'kanjiToHiragana',
    prompt: origKanji,
    choices,
    correct,
    sourceId: w.id,
  };
}
// --- Hiragana→Kanji (only when original kanji string is NOT mixed and both forms exist) ---
export function buildHiraganaToKanji(pool: Word[], w: Word): QuizItem {
  const origKanji = w.kanji;
  if (!w.hiragana || !origKanji || isMixedKanjiKanaString(origKanji)) return buildVocabMCQ(pool, w);

  const correct = origKanji;
  if (!correct) return buildVocabMCQ(pool, w);

  const targetMoras = moraCount(w.hiragana);
  const targetKanjiLen = Array.from(correct).filter(ch => /[\u4E00-\u9FFF]/u.test(ch)).length;

  const candidates = sample(
    pool.filter(x =>
      x.id !== w.id &&
      x.kanji &&
      hasKanji(x.kanji) &&
      !isMixedKanjiKanaString(x.kanji) &&
      moraCount(x.hiragana || '') > 0 &&
      Math.abs(moraCount(x.hiragana || '') - targetMoras) <= 1 &&
      Math.abs(Array.from(x.kanji || '')
        .filter(ch => /[\u4E00-\u9FFF]/u.test(ch)).length - targetKanjiLen) <= 1
    ),
    60
  );

  if (candidates.length < 3) return buildVocabMCQ(pool, w);

  const ranked = candidates
    .map(c => {
      const a = w.hiragana || '', b = c.hiragana || '';
      // simple Levenshtein
      const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
      for (let i=0;i<=a.length;i++) dp[i][0] = i;
      for (let j=0;j<=b.length;j++) dp[0][j] = j;
      for (let i=1;i<=a.length;i++) for (let j=1;j<=b.length;j++) {
        dp[i][j] = Math.min(
          dp[i-1][j] + 1,
          dp[i][j-1] + 1,
          dp[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)
        );
      }
      const dist = dp[a.length][b.length];
      const sim = 1 - dist / Math.max(1, Math.max(a.length, b.length));
      const lenDiff = Math.abs(
        Array.from(c.kanji || '')
          .filter(ch => /[\u4E00-\u9FFF]/u.test(ch)).length - targetKanjiLen
      );
      return { c, score: sim - lenDiff * 0.2 };
    })
    .sort((x,y) => y.score - x.score)
    .map(e => e.c);

  const distractors = ranked.slice(0, 3).map(x => (x.kanji!));
  const choices = shuffle([correct, ...distractors]);

  return {
    id: `q_${w.id}_h2k`,
    type: 'hiraganaToKanji',
    prompt: w.hiragana,
    choices,
    correct,
    sourceId: w.id,
  };
}
// --- NEW: English→Kanji (only when original kanji string is NOT mixed and kanji exists) ---
export function buildEnToKanji(_pool: Word[], _w: Word): QuizItem {
  // Disabled: English → Kanji yields obvious answers; prefer JP → English.
  // Fallback to JP → English handled by buildVocabQuiz.
  throw new Error('EN→Kanji disabled');
}

export function buildVocabQuiz(today: Word[], targetSize: number): QuizItem[] {
  if (!today.length) return [];
  const pool = today.slice();
  const workSet = pool.slice(0, targetSize);
  return shuffle(workSet).map((w) => {
    const hasAnyKanji = !!w.kanji && hasKanji(w.kanji);
    const isMixed = !!w.kanji && isMixedKanjiKanaString(w.kanji);

    const builders: Array<() => QuizItem> = [() => buildVocabMCQ(pool, w)];

    // EN→Kanji disabled as per UX: too obvious

    // Keep kana-based only for pure-kanji entries with a separate kana form
    if (!isMixed && hasAnyKanji && w.hiragana) {
      builders.push(() => buildHiraganaToKanji(pool, w));
      builders.push(() => buildKanjiToHiragana(pool, w));
    }

    const weighted =
      builders.length >= 4
        ? [builders[0], builders[1], builders[2], builders[3], builders[0], builders[1]]
        : builders;

    return weighted[Math.floor(Math.random() * weighted.length)]();
  });
}

// === GRAMMAR QUIZ BUILDERS (MCQ only) ===
type GP = { id: string; title_jp?: string; title_en?: string;
  examples?: Array<{ jp: string; en: string; romaji?: string }>;
};

export function buildGrammarQuizFromPool(pool: GP[], targetSize: number): QuizItem[] {
  const gps = pool.slice(0, targetSize);
  const items = shuffle(gps).map((gp) => {
    const promptJP  = gp.examples?.[0]?.jp || gp.title_jp || '—';
    const correctEN = gp.examples?.[0]?.en || gp.title_en || '—';
    const others = shuffle(gps.filter(x => x.id !== gp.id))
      .map(x => x.examples?.[0]?.en || x.title_en)
      .filter(Boolean) as string[];
    const distractors = others.slice(0, 3);
    const choices = shuffle([correctEN, ...distractors].slice(0, 4));

    const q: QuizItem = {
      id: `gq_${gp.id}_mcq`,
      type: 'mcq',
      prompt: promptJP,
      choices,
      correct: correctEN,
      sourceId: gp.id,
    };
    return q;
  });
  return items;
}

// === EXAM BUILDERS ===
export function buildMatching(chunk: Word[]) {
  const pick = chunk.slice(0, 4);
  if (pick.length < 4) return null;
  const lefts = pick.map(x => ({
    left: x.kanji || x.hiragana || x.romaji || x.english,
    sourceId: x.id,
  }));
  const rightPool = pick.map(x => ({ text: x.english, id: x.id }));
  const shuf = shuffle(rightPool);
  const pairs = lefts.map((L, i) => ({
    left: L.left,
    sourceId: L.sourceId,
    right: shuf[i].text,
    rightId: shuf[i].id,
  }));
  return { id: `q_match_${pick.map(p => p.id).join('_')}`, type: 'matching', pairs } as const;
}

// === SRS QUIZ MIXERS ===
/**
 * Build a balanced set of vocab quiz items for SRS, mixing Matching and MCQs.
 * - Up to 3 matching groups (4 words each) when enough words exist
 * - Remaining slots filled with the standard vocab question mix
 */
export function buildSrsVocabMixed(words: Word[], targetSize: number): QuizItem[] {
  if (!Array.isArray(words) || words.length === 0 || targetSize <= 0) return [];
  const pool = shuffle(words.slice());

  const maxGroups = Math.min(3, Math.floor(targetSize / 4));
  const groups: QuizItem[] = [];
  for (let i = 0; i < maxGroups; i++) {
    const start = i * 4;
    const chunk = pool.slice(start, start + 4);
    const m = buildMatching(chunk as Word[]);
    if (m) groups.push(m as unknown as QuizItem);
  }
  const remaining = Math.max(0, targetSize - groups.length);
  const rest = buildVocabQuiz(pool, remaining);
  return shuffle([...groups, ...rest]);
}
