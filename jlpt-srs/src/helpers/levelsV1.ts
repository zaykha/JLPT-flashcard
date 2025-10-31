// src/helpers/levels.ts

import type { JLPTLevelStr } from "@/types/userV1";

export const JLPT_LEVEL_RANGES: Record<JLPTLevelStr, { start: number; end: number }> = {
  N5: { start: 1, end: 66 },
  N4: { start: 67, end: 129 },
  N3: { start: 130, end: 309 },
  N2: { start: 310, end: 492 },
  N1: { start: 493, end: 838 },
};

export function pickInitialLessons(level: JLPTLevelStr, howMany = 2): number[] {
  const { start, end } = JLPT_LEVEL_RANGES[level];
  const out: number[] = [];
  for (let n = start; n <= end && out.length < howMany; n += 1) out.push(n);
  return out;
}

// Default lessons per day
export const PER_DAY_DEFAULT: 2 | 3 = 2;