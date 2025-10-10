import type { JLPTLevelStr } from '@/lib/user-data';

export const LEVEL_DISTRIBUTION: Record<JLPTLevelStr, number> = {
  N1: 346,
  N2: 183,
  N3: 180,
  N4: 63,
  N5: 66,
};

export function getTotalLessonsForLevel(level: JLPTLevelStr | null | undefined): number {
  if (!level) return 0;
  return LEVEL_DISTRIBUTION[level] ?? 0;
}
