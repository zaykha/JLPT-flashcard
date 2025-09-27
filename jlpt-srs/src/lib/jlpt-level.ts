import type { JLPTLevelStr } from '@/lib/user-data';
export function levelStrToNum(l: JLPTLevelStr): number {
  return { N1:1, N2:2, N3:3, N4:4, N5:5 }[l] ?? 5;
}
