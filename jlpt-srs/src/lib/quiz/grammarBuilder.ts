// src/lib/quiz/grammarBuilders.ts
import type { QuizItem } from '@/types/quiz';
import { shuffle } from '@/helpers/arrays';
import { stripParentheses, uniq } from '@/helpers/grammarText';

type GP = {
  id: string;
  title_jp?: string;
  title_en?: string;
  shortExplanation?: string;
  examples?: Array<{ en?: string; jp?: string; romaji?: string }>;
};

const ok = (s?: string) => !!s && s.trim().length > 0;
const firstJPExample = (gp: GP) => gp.examples?.map(e => e?.jp || '').find(ok) || '';
const firstENExample = (gp: GP) => gp.examples?.map(e => e?.en || '').find(ok) || '';

// JP example sentence -> EN title
const jpEx2enTitle = (gp: GP, pool: GP[]): QuizItem | null => {
  const prompt  = firstJPExample(gp);           // 日本語例文
  const correct = gp.title_en || '';
  if (!ok(prompt) || !ok(correct)) return null;

  const ds = shuffle(pool.filter(x => x.id !== gp.id).map(x => x.title_en || ''))
    .filter(ok)
    .slice(0, 3);

  const choices = uniq([correct, ...ds]);
  if (choices.length < 4) return null;

  return {
    id: `g_jpex2ent_${gp.id}`,
    type: 'mcq',
    prompt,
    choices: shuffle(choices).slice(0, 4),
    correct,
    sourceId: gp.id,
  };
};

// EN title -> JP example sentence
const enTitle2jpEx = (gp: GP, pool: GP[]): QuizItem | null => {
  const prompt  = gp.title_en || '';
  const correct = firstJPExample(gp);
  if (!ok(prompt) || !ok(correct)) return null;

  const ds = shuffle(pool.filter(x => x.id !== gp.id).map(firstJPExample))
    .filter(ok)
    .slice(0, 3);

  const choices = uniq([correct, ...ds]);
  if (choices.length < 4) return null;

  return {
    id: `g_ent2jpex_${gp.id}`,
    type: 'mcq',
    prompt,
    choices: shuffle(choices).slice(0, 4),
    correct,
    sourceId: gp.id,
  };
};
const en2jp = (gp: GP, pool: GP): QuizItem | null => {
  const prompt = gp.examples?.[0]?.en || gp.title_en || '';
  const correct = stripParentheses(gp.title_jp || '');
  if (!ok(prompt) || !ok(correct)) return null;

  const ds = shuffle(
    (pool as unknown as GP[]).filter(x => x.id !== gp.id).map(x => stripParentheses(x.title_jp || ''))
  ).filter(ok).slice(0, 3);

  const choices = uniq([correct, ...ds]);
  if (choices.length < 4) return null;

  return {
    id: `g_en2jp_${gp.id}_ex0`,
    type: 'mcq',
    prompt,
    choices: shuffle(choices).slice(0, 4),
    correct,
    sourceId: gp.id,
  };
};

const jp2en = (gp: GP, pool: GP): QuizItem | null => {
  const prompt = stripParentheses(gp.title_jp || '');
  const correct = gp.examples?.[1]?.en || gp.title_en || '';
  if (!ok(prompt) || !ok(correct)) return null;

  const ds = shuffle(
    (pool as unknown as GP[]).filter(x => x.id !== gp.id).map(x => x.examples?.[0]?.en || x.title_en || '')
  ).filter(ok).slice(0, 3);

  const choices = uniq([correct, ...ds]);
  if (choices.length < 4) return null;

  return {
    id: `g_jp2en_${gp.id}_ex1`,
    type: 'mcq',
    prompt,
    choices: shuffle(choices).slice(0, 4),
    correct,
    sourceId: gp.id,
  };
};

const jp2ex = (gp: GP, pool: GP): QuizItem | null => {
  const prompt = stripParentheses(gp.title_jp || '');
  const correct = gp.shortExplanation || gp.title_en || '';
  if (!ok(prompt) || !ok(correct)) return null;

  const ds = shuffle(
    (pool as unknown as GP[]).filter(x => x.id !== gp.id).map(x => x.shortExplanation || x.title_en || '')
  ).filter(ok).slice(0, 3);

  const choices = uniq([correct, ...ds]);
  if (choices.length < 4) return null;

  return {
    id: `g_jp2ex_${gp.id}`,
    type: 'mcq',
    prompt,
    choices: shuffle(choices).slice(0, 4),
    correct,
    sourceId: gp.id,
  };
};

const ex2jp = (gp: GP, pool: GP): QuizItem | null => {
  const prompt = gp.shortExplanation || gp.title_en || '';
  const correct = stripParentheses(gp.title_jp || '');
  if (!ok(prompt) || !ok(correct)) return null;

  const ds = shuffle(
    (pool as unknown as GP[]).filter(x => x.id !== gp.id).map(x => stripParentheses(x.title_jp || ''))
  ).filter(ok).slice(0, 3);

  const choices = uniq([correct, ...ds]);
  if (choices.length < 4) return null;

  return {
    id: `g_ex2jp_${gp.id}`,
    type: 'mcq',
    prompt,
    choices: shuffle(choices).slice(0, 4),
    correct,
    sourceId: gp.id,
  };
};

/** Build exactly 2 questions per grammar point, picking from 6 directions. */
export function buildGrammarMixed(pool: GP[]): QuizItem[] {
  const out: QuizItem[] = [];
  const variants = [en2jp, jp2en, jp2ex, ex2jp, jpEx2enTitle, enTitle2jpEx];

  for (const gp of pool) {
    const tries = shuffle(variants);
    const built: QuizItem[] = [];
    for (const fn of tries) {
      const q = fn(gp, pool as any);
      if (q) built.push(q);
      if (built.length === 2) break;
    }
    if (built.length === 1) {
      for (const fn of tries) {
        const q = fn(gp, pool as any);
        if (q && !built.find(b => b.id === q.id)) { built.push(q); break; }
      }
    }
    out.push(...built);
  }
  return shuffle(out);
}