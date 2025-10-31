// src/helpers/text.ts
export const tokenizeEn = (s?: string) =>
  (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(to|a|an|the|of|in|on|at|for|with|and|or|be|is|are)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

export const bigrams = (s: string) => {
  const t = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const out: string[] = [];
  for (let i = 0; i < t.length - 1; i++) out.push(t.slice(i, i + 2));
  return out;
};

export const jaccard = (A: string[], B: string[]) => {
  if (!A.length && !B.length) return 0;
  const a = new Set(A), b = new Set(B);
  let inter = 0;
  a.forEach(x => { if (b.has(x)) inter++; });
  const uni = a.size + b.size - inter;
  return uni ? inter / uni : 0;
};

export const editDistance = (a?: string, b?: string) => {
  const s = a || '', t = b || '';
  const dp = Array.from({ length: s.length + 1 }, () => new Array(t.length + 1).fill(0));
  for (let i = 0; i <= s.length; i++) dp[i][0] = i;
  for (let j = 0; j <= t.length; j++) dp[0][j] = j;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 1; j <= t.length; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[s.length][t.length];
};

export const normLenDiff = (a: number, b: number) => {
  if (!a && !b) return 0;
  return Math.min(1, Math.abs(a - b) / Math.max(4, Math.max(a, b)));
};

export const kanjiOnly = (s: string) => (s || '').replace(/[^\u4E00-\u9FAF]/g, '');
export function kanjiOverlap(a?: string, b?: string) {
  const A = new Set(kanjiOnly(a || '').split(''));
  const B = new Set(kanjiOnly(b || '').split(''));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  A.forEach(ch => { if (B.has(ch)) inter++; });
  return inter / Math.min(A.size, B.size);
}
