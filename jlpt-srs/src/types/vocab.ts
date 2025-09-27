// vocab.ts

// ===== JLPT / Quiz =====
export type JLPTLevel = 1 | 2 | 3 | 4 | 5;
export type QuizKind = 'EN2JP' | 'JP2EN';

// ===== Topic canonical list (single source of truth) =====
export const TOPICS = [
  'people', 'places', 'food', 'time', 'travel', 'school',
  'work', 'feelings', 'body', 'numbers', 'others'
] as const;

export type Topic = typeof TOPICS[number];

// Backward-compatible TopicKey:
// - Prefer Topic (above)
// - Allow '__ALL__' for filters
// - Still accept arbitrary strings during migration (narrow later via helper)
export type TopicKey = Topic | '__ALL__' | (string & { __brand?: 'legacyTopic' });

// ===== Word =====
export type Word = {
  id: string;               // stable ID (e.g., `${kanji}|${hiragana}|${english}`)
  kanji: string;
  hiragana: string;
  english: string;
  level: JLPTLevel;
  topicKey: TopicKey;       // use canonical Topic wherever possible
};

// ===== SRS =====
export type SRSCard = {
  id: string;               // Word.id
  step: number;             // -1=new, 0..(intervals.length-1)
  next: number;             // epoch ms due date
};

// ===== Grouping & Progress =====
export type TopicGroup = {
  key: TopicKey;
  title: string;
  items: Word[];
};

export type ProgressBuckets = {
  newCount: number;
  dueCount: number;
  futureCount: number;
  byStep: Record<number, number>;
};

// ===== Quiz model =====
export type QuizQuestionModel = {
  id: string;
  kind: QuizKind;
  promptEN?: string;
  promptJP?: { kanji: string; hiragana: string };
  choices: Array<{
    id: string;       // Word.id
    en: string;
    kanji: string;
    hiragana: string;
  }>;
  correctId: string;  // Word.id
};

// ===== Topic utilities (for safe narrowing + migration) =====
const TOPIC_SET: Record<Topic, true> = Object.fromEntries(
  (TOPICS as readonly string[]).map(t => [t, true])
) as Record<Topic, true>;

/** Returns a canonical Topic from any TopicKey/string. Falls back to 'others'. */
export function normalizeTopicKey(key: TopicKey | string): Topic {
  const k = (key || '').toLowerCase().trim();
  if ((TOPIC_SET as any)[k]) return k as Topic;
  // map a few common legacy aliases
  if (k === '__all__') return 'others';
  if (k === 'emotion' || k === 'emotions') return 'feelings';
  if (k === 'number' || k === 'nums') return 'numbers';
  if (k === 'place') return 'places';
  return 'others';
}

/** Type guard: checks if a string is a canonical Topic. */
export function isTopic(x: string): x is Topic {
  return !!(TOPIC_SET as any)[x];
}
