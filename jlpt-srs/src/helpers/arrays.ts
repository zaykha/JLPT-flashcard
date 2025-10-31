// src/helpers/arrays.ts
export const shuffle = <T,>(arr: T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function pickTop<T>(arr: T[], n: number, score: (x: T) => number): T[] {
  return arr
    .map(x => ({ x, s: score(x) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map(e => e.x);
}

// simple random sample
export const sample = <T,>(arr: T[], n: number) => shuffle(arr).slice(0, n);

export function rebalanceLength(choices: string[], targetLen: number) {
  const len = choices.map(c => c.length);
  const avg = len.reduce((a, b) => a + b, 0) / len.length;
  const tooFar = choices.some((c, i) => Math.abs(len[i] - avg) > Math.max(2, targetLen * 0.6));
  return tooFar ? shuffle(choices) : choices;
}
