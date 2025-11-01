import type { JLPTLevelStr } from '@/types/userV1';
export function levelStrToNum(l: JLPTLevelStr): number {
  const map = { N1: 1, N2: 2, N3: 3, N4: 4, N5: 5 } as const;
  return map[l] ?? 5;
}
