import { create } from 'zustand';
import type { TopicGroup, Word, Topic, ProgressBuckets, SRSCard } from '@/types/vocab';
import { TOPICS } from '@/types/vocab';

type TopicsState = {
  words: Word[];
  groups: TopicGroup[];
  setWords(words: Word[]): void;
  reset(): void;
  progressByTopic(srsMap: Record<string, SRSCard>): Record<Topic, ProgressBuckets>;
};

function emptyGroups(): TopicGroup[] {
  return TOPICS.map(topic => ({ key: topic, title: topic, items: [] }));
}

export const useTopics = create<TopicsState>()((set, get) => ({
  words: [],
  groups: emptyGroups(),

  setWords(words) {
    const map = new Map<Topic, Word[]>();
    TOPICS.forEach(topic => map.set(topic, []));

    words.forEach(word => {
      const bucket = map.get(word.topicKey as Topic);
      if (bucket) bucket.push(word);
    });

    const groups: TopicGroup[] = TOPICS.map(topic => ({
      key: topic,
      title: topic,
      items: map.get(topic) ?? [],
    }));

    set({ words, groups });
  },

  reset() {
    set({ words: [], groups: emptyGroups() });
  },

  progressByTopic(srsMap) {
    const out = Object.fromEntries(
      TOPICS.map(topic => [topic, { newCount: 0, dueCount: 0, futureCount: 0, byStep: {} as Record<number, number> }])
    ) as Record<Topic, ProgressBuckets>;

    const now = Date.now();

    for (const group of get().groups) {
      const buckets = out[group.title as Topic];
      if (!buckets) continue;

      for (const word of group.items) {
        const card = srsMap[word.id];
        if (!card) {
          buckets.newCount += 1;
          continue;
        }
        if (card.next <= now) buckets.dueCount += 1; else buckets.futureCount += 1;
        buckets.byStep[card.step] = (buckets.byStep[card.step] ?? 0) + 1;
      }
    }

    return out;
  },
}));
