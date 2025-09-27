// Simple daily sequence of topic keys per level. Expand/curate anytime.
export type TopicKey =
  | 'people' | 'feelings' | 'body' | 'food' | 'places' | 'time' | 'school' | 'work' | 'travel' | 'numbers' | 'other';

export const curriculum: Record<'N5'|'N4'|'N3'|'N2'|'N1', TopicKey[]> = {
  N5: ['numbers','people','food','places','time','school','other'],
  N4: ['people','feelings','time','places','food','school','work','other'],
  N3: ['people','work','feelings','travel','time','places','food','body','other'],
  N2: ['work','feelings','time','places','people','food','other'],
  N1: ['work','feelings','time','places','people','other'],
};

/** fixed day -> topic rotation; wraps around */
export function topicsForDay(level: keyof typeof curriculum, dayIndex: number, count = 2) {
  const seq = curriculum[level];
  const res: TopicKey[] = [];
  for (let i=0;i<count;i++){
    res.push(seq[(dayIndex + i) % seq.length]);
  }
  return res;
}
