// TODO: makeTopicGroups(words)
// src/lib/group.ts
import type { Word, TopicGroup } from '@/types/vocab';

/**
 * Very simple topic heuristics v1:
 * - Check english gloss for keywords
 * - You can refine/replace with a curated map later
 */

type TopicDef = {
  key: string;
  title: string;
  // return true if word belongs to this topic
  test: (w: Word) => boolean;
};

const any = (s: string, arr: string[]) =>
  arr.some(k => s.includes(k));

const TOPIC_DEFS: TopicDef[] = [
  { key:'people',  title:'People',  test: (w) => any(w.english.toLowerCase(), ['person','people','man','woman','boy','girl','friend','family','teacher','student']) },
  { key:'body',    title:'Body',    test: (w) => any(w.english.toLowerCase(), ['hand','head','eye','ear','mouth','face','leg','arm','body','stomach']) },
  { key:'feelings',title:'Feelings',test: (w) => any(w.english.toLowerCase(), ['happy','sad','angry','fear','nervous','love','like','dislike','tired','sleepy']) },
  { key:'food',    title:'Food',    test: (w) => any(w.english.toLowerCase(), ['eat','drink','rice','water','tea','meat','fish','vegetable','fruit','sweets','cook']) },
  { key:'places',  title:'Places',  test: (w) => any(w.english.toLowerCase(), ['home','house','school','station','office','park','shop','store','city','country']) },
  { key:'school',  title:'School',  test: (w) => any(w.english.toLowerCase(), ['study','learn','exam','class','homework','teacher','student','university']) },
  { key:'work',    title:'Work',    test: (w) => any(w.english.toLowerCase(), ['work','company','job','office','boss','colleague','meeting']) },
  { key:'time',    title:'Time',    test: (w) => any(w.english.toLowerCase(), ['day','week','month','year','hour','minute','early','late','tomorrow','yesterday','today']) },
  { key:'travel',  title:'Travel',  test: (w) => any(w.english.toLowerCase(), ['go','come','return','train','bus','car','airport','hotel','travel','trip']) },
  { key:'numbers', title:'Numbers', test: (w) => /\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b/.test(w.english.toLowerCase()) },
];

const OTHER = { key:'other', title:'Other' };

export function makeTopicGroups(words: Word[]): { groups: TopicGroup[]; withTopics: Word[] } {
  // assign topicKey on each word
  const withTopics = words.map(w => {
    const hit = TOPIC_DEFS.find(def => def.test(w));
    return { ...w, topicKey: hit ? hit.key : OTHER.key };
  });

  // group
  const map = new Map<string, { title: string; items: Word[] }>();
  TOPIC_DEFS.forEach(def => map.set(def.key, { title: def.title, items: [] }));
  map.set(OTHER.key, { title: OTHER.title, items: [] });

  withTopics.forEach(w => {
    const g = map.get(w.topicKey)!;
    g.items.push(w);
  });

  // finalize array in a nice order
  const groups: TopicGroup[] = [];
  TOPIC_DEFS.forEach(def => groups.push({ key: def.key, title: def.title, items: map.get(def.key)!.items }));
  groups.push({ key: OTHER.key, title: OTHER.title, items: map.get(OTHER.key)!.items });

  return { groups, withTopics };
}
