// TODO: Topics selection, per-day, cached groups
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { kvGet, kvSet, KEYS } from '@/lib/storage';
import type { TopicGroup, Word, TopicKey, ProgressBuckets, SRSCard } from '@/types/vocab';

type TopicsState = {
  hydrated: boolean;

  // prefs
  perDay: number;                  // target new+review per day
  selected: Set<TopicKey>;         // empty=set means "All"

  // data
  allWords: Word[];                // raw normalized words (from API)
  groups: TopicGroup[];            // grouped words

  hydrate(): Promise<void>;
  setPerDay(n: number): void;
  toggleTopic(key: TopicKey): void;
  setSelected(keys: TopicKey[] | Set<TopicKey>): void;

  setAllWords(words: Word[]): void;
  setGroups(groups: TopicGroup[]): void;

  // compute progress for each topic from SRS map
  progressByTopic(srsMap: Record<string, SRSCard>): Record<TopicKey, ProgressBuckets>;
};

export const useTopics = create<TopicsState>()(
  devtools((set, get) => ({
    hydrated: false,
    perDay: 20,
    selected: new Set<TopicKey>(),

    allWords: [],
    groups: [],

    async hydrate() {
      const [perDay, topics] = await Promise.all([
        kvGet<number>(KEYS.perDay),
        kvGet<TopicKey[]>(KEYS.topics),
      ]);
      set({
        perDay: perDay ?? 20,
        selected: new Set(topics ?? []),
        hydrated: true,
      });
    },

    setPerDay(n) {
      const perDay = Math.max(1, Math.min(200, Math.floor(n || 1)));
      set({ perDay });
      kvSet(KEYS.perDay, perDay);
    },

    toggleTopic(key) {
      const sel = new Set(get().selected);
      sel.has(key) ? sel.delete(key) : sel.add(key);
      set({ selected: sel });
      kvSet(KEYS.topics, Array.from(sel));
    },

    setSelected(keys) {
      const sel = keys instanceof Set ? new Set(keys) : new Set(keys);
      set({ selected: sel });
      kvSet(KEYS.topics, Array.from(sel));
    },

    setAllWords(words) {
      set({ allWords: words });
    },

    setGroups(groups) {
      set({ groups });
    },

    progressByTopic(srsMap) {
      const out: Record<TopicKey, ProgressBuckets> = {};
      const byTopic = get().groups;

      byTopic.forEach(g => {
        const buckets: ProgressBuckets = {
          newCount: 0,
          dueCount: 0,
          futureCount: 0,
          byStep: {},
        };

        g.items.forEach(w => {
          const s = srsMap[w.id];
          if (!s) { buckets.newCount++; return; }
          const now = Date.now();
          if (s.next <= now) buckets.dueCount++; else buckets.futureCount++;
          buckets.byStep[s.step] = (buckets.byStep[s.step] ?? 0) + 1;
        });

        out[g.key] = buckets;
      });

      return out;
    },
  }))
);
