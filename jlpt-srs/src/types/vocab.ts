// vocab.ts

import type { VocabItem } from "@/lib/api";

// ===== JLPT / Quiz =====
export type JLPTLevel = 1 | 2 | 3 | 4 | 5;
export type QuizKind = 'EN2JP' | 'JP2EN';

// ===== Topic canonical list (single source of truth) =====
// 23 canonical topics (must match your Firestore docs exactly)
export const TOPICS = [
  'People & Family',
  'Places & Directions',
  'Food & Drink',
  'Numbers, Time & Date',
  'Travel & Transport',
  'School & Study',
  'Work & Business',
  'Emotions & Personality',
  'Health & Body',
  'Counters & Quantifiers',
  'Colors, Shapes & Measures',
  'Grammar Function Words',
  'Greetings & Social',
  'Hobbies & Sports',
  'Technology & Media',
  'Weather & Nature',
  'Animals & Plants',
  'Science & Industry',
  'Shopping & Money',
  'Society & Politics',
  'Culture & Events',
  'Verbs of Motion & Position',
  'Abstract & Academic'
] as const;

export type Topic = typeof TOPICS[number];

// If parts of the app still send legacy bucket names, map them here:
type LegacyTopic =
  | 'people' | 'places' | 'food' | 'time' | 'travel' | 'school'
  | 'work' | 'feelings' | 'body' | 'numbers' | 'others';

// Convert legacy → canonical. Unknowns fall back to Abstract & Academic
export function toCanonicalTopic(input: string): Topic {
  const k = (input || '').trim().toLowerCase();

  // Already canonical? quick accept
  const found = TOPICS.find(t => t.toLowerCase() === k);
  if (found) return found;

  // Legacy buckets → canonical
  switch (k as LegacyTopic) {
    case 'people':   return 'People & Family';
    case 'places':   return 'Places & Directions';
    case 'food':     return 'Food & Drink';
    case 'time':     return 'Numbers, Time & Date';
    case 'travel':   return 'Travel & Transport';
    case 'school':   return 'School & Study';
    case 'work':     return 'Work & Business';
    case 'feelings': return 'Emotions & Personality';
    case 'body':     return 'Health & Body';
    case 'numbers':  return 'Counters & Quantifiers';
    case 'others':   return 'Abstract & Academic';
    default:         return 'Abstract & Academic';
  }
}
// Backward-compatible TopicKey:
// - Prefer Topic (above)
// - Allow '__ALL__' for filters
// - Still accept arbitrary strings during migration (narrow later via helper)
export type TopicKey = Topic | '__ALL__' | (string & { __brand?: 'legacyTopic' });

// Detect if a string has any CJK ideographs (very rough, good enough for kanji detection)
const HAS_KANJI = /[\u4E00-\u9FFF]/;

export type Word = {
  id: string;
  kanji?: string;
  hiragana?: string;
  romaji?: string;
  english: string;
  topicKey: Topic;
  level: 'N5'|'N4'|'N3'|'N2'|'N1';
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


export function mapVocabItemToWord(i: VocabItem): Word {
  const jp = i.jp || '';
  const kana = i.kana || '';
  const hasKanji = HAS_KANJI.test(jp);

  return {
    id: i.id,
    kanji: hasKanji ? jp : undefined,
    hiragana: (kana && kana.trim()) ? kana : (hasKanji ? undefined : jp),
    english: i.meaning || '',
    romaji: i.romaji || '',
    topicKey: toCanonicalTopic(i.topic),   // ✅ canonicalized
    level: i.level as Word['level'],
  };
}

export function normalizeTopicKey(key: string): Topic {
  return toCanonicalTopic(key);
}

/** Type guard: checks if a string is a canonical Topic. */
export function isTopic(x: string): x is Topic {
  return !!(TOPIC_SET as any)[x];
}

export function mapVocabDocToWord(
  doc: any,
  opts?: { lessonTopic?: string }
): Word {
  // Try to be tolerant with field names:
  const kanji    = (doc.kanji ?? doc.jpKanji ?? doc.jp ?? '').trim();
  const hiragana = (doc.hiragana ?? doc.kana ?? doc.reading ?? '').trim();
  const romaji   = (doc.romaji ?? doc.roumaji ?? '').trim();
  const english  = (doc.english ?? doc.meaning ?? doc.gloss ?? '').trim();

  // topicKey: use explicit doc.topicKey OR infer from lessonTopic OR from an id prefix
  const tkRaw =
    (doc.topic ?? doc.topicKey ?? doc.category ?? doc.tags?.[0]) ||
    opts?.lessonTopic ||
    inferTopicFromId(doc.id || doc.wordId || '');
  const topicKey = normalizeTopicKey(String(tkRaw || 'Abstract & Academic'));

  return {
    id: String(doc.id ?? doc.wordId ?? crypto.randomUUID()),
    level: (doc.level ?? doc.jlpt ?? '').trim() || undefined,
    kanji: kanji || undefined,
    hiragana: hiragana || undefined,
    romaji: romaji || undefined,
    english: english || '',
    topicKey, // Flashcard uses this for styling (canonicalized)
  } as Word;
}

function inferTopicFromId(id: string): string | undefined {
  // Example ids like "N3_travel_到着" -> "travel"
  const parts = id.split('_');
  if (parts.length >= 2) return parts[1];
  return undefined;
}
// If you want grammar cards as words too (optional):
export function mapGrammarDocToWord(doc: any): Word {
  return {
    id: doc.id,
    level: doc.level,
    kanji: doc.titleJP ?? doc.patternJP ?? null,
    hiragana: null,
    romaji: null,
    english: doc.explanationEN ?? doc.titleEN ?? '',
  } as unknown as Word; // cast to Word, but topicKey will be missing
}
