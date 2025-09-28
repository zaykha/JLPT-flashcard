
import { create } from 'zustand';
import dayjs from 'dayjs';
import { useAuth } from '@/store/auth';
import { useTopics } from '@/store/topics';
import { useSRS } from '@/store/srs';
import { topicsForDay } from '@/lib/curriculum';
import type { Word } from '@/types/vocab';
import { getProfile } from '@/lib/user-data';

type Stage = 'settings'|'studying'|'quiz'|'summary';

type SessionState = {
  stage: Stage;
  today: Word[];
  index: number;
  setStage: (s: Stage) => void;
  setToday: (w: Word[]) => void;
  next: () => void;
  prev: () => void;
  buildTodayFixed: () => Promise<void>;
};

export const useSession = create<SessionState>((set) => ({
  stage: 'settings',
  today: [],
  index: 0,
  setStage: (s) => set({ stage: s }),
  setToday: (w) => set({ today: w, index: 0 }),
  next: () => set(s => ({ index: Math.min(s.index + 1, Math.max(0, s.today.length-1)) })),
  prev: () => set(s => ({ index: Math.max(0, s.index - 1) })),

  /** FIXED plan: determine day number, pick topics → select due+new per pace */
  async buildTodayFixed() {
    const auth = useAuth.getState();
    const topics = useTopics.getState();
    const srs = useSRS.getState();

    if (!auth.user) return;

    const profile = await getProfile(auth.user.uid);
    if (!profile) return;

    const pace = profile.pace;                  // 10/20/30/50
    const level = profile.vocabLevel;           // N5..N1

    // Day index: count days since first login (or createdAt). Simple approach:
    const created = (profile as any).createdAt?.toDate?.() ?? new Date();
    const dayIndex = Math.max(0, Math.floor((Date.now() - created.getTime()) / (1000*60*60*24)));

    // Which topics today
    const todayTopics = topicsForDay(level, dayIndex, 2); // 2 topics/day by default
    const pool = topics.allWords.filter(w => todayTopics.includes(w.topicKey as any));

    // Split due/new from SRS map
    const todayISO = dayjs().format('YYYY-MM-DD');
    const due: Word[] = [];
    const future: Word[] = [];
    const unseen: Word[] = [];

    const map = srs.map; // SRSMap
    for (const w of pool) {
      const rec = map[w.id];
      if (!rec) { unseen.push(w); continue; }
      if (rec.due <= todayISO) due.push(w); else future.push(w);
    }

    // 30% due (rounded), rest new
    const dueTarget = Math.max(0, Math.floor(pace * 0.3));
    // const newTarget = Math.max(0, pace - dueTarget);

    // helpers
    const pick = (arr: Word[], n: number) => arr.slice(0, Math.min(n, arr.length));

    const pickedDue = pick(due, dueTarget);
    const remaining = pace - pickedDue.length;
    const pickedNew = pick(unseen, remaining);

    const todayList = [...pickedDue, ...pickedNew];

    set({ today: todayList, index: 0, stage: 'studying' });
  },
}));

// // TODO: Session state (today list, mode, progress)
// import { create } from 'zustand';
// import { devtools } from 'zustand/middleware';
// import type { Word, TopicKey } from '@/types/vocab';
// import type { SRSCard } from '@/types/vocab';

// type Stage = 'idle' | 'studying' | 'quiz' | 'summary';

// type SessionState = {
//   stage: Stage;
//   today: Word[];            // the ordered set for today
//   index: number;            // pointer in flashcards
//   seed: string;             // daily seed for deterministic picks

//   setStage(s: Stage): void;
//   setToday(words: Word[], seed?: string): void;
//   next(): void;
//   prev(): void;
//   reset(): void;

//   // derive a suggested mix: simple 30% review + 70% new
//   buildToday(
//     all: Word[],
//     selectedTopics: Set<TopicKey> | TopicKey[],
//     perDay: number,
//     srsMap: Record<string, SRSCard>
//   ): Word[];
// };

// function pickN<T>(arr: T[], n: number): T[] {
//   // cheap shuffle; we’ll refine if needed
//   return arr.slice().sort(() => Math.random() - 0.5).slice(0, n);
// }

// export const useSession = create<SessionState>()(
//   devtools((set, get) => ({
//     stage: 'idle',
//     today: [],
//     index: 0,
//     seed: new Date().toISOString().slice(0,10),

//     setStage(s) { set({ stage: s }); },
//     setToday(words, seed) { set({ today: words, index: 0, seed: seed ?? get().seed }); },
//     next() {
//       const { index, today } = get();
//       if (!today.length) return;
//       set({ index: Math.min(index + 1, today.length - 1) });
//     },
//     prev() {
//       const { index } = get();
//       set({ index: Math.max(index - 1, 0) });
//     },
//     reset() { set({ stage: 'idle', today: [], index: 0 }); },

//     buildToday(all, selectedTopics, perDay, srsMap) {
//       const topics = selectedTopics instanceof Set ? Array.from(selectedTopics) : selectedTopics;
//       const filtered = topics.length ? all.filter(w => topics.includes(w.topicKey)) : all;

//       const now = Date.now();
//       const review = filtered.filter(w => {
//         const s = srsMap[w.id];
//         return s && s.next <= now;
//       });
//       const unseen = filtered.filter(w => !srsMap[w.id]);

//       const reviewQuota = Math.round(perDay * 0.3);
//       const newQuota = Math.max(0, perDay - reviewQuota);

//       const chosenReviews = pickN(review, reviewQuota);
//       const chosenNew = pickN(unseen, newQuota);

//       // fallback: if not enough review, top up with more new; if not enough new, top up with more review
//       let pool = [...chosenReviews, ...chosenNew];
//       if (pool.length < perDay) {
//         const extraNew = unseen.filter(w => !pool.includes(w));
//         const extraRev = review.filter(w => !pool.includes(w));
//         pool = pool.concat(pickN(extraNew, perDay - pool.length));
//         if (pool.length < perDay) pool = pool.concat(pickN(extraRev, perDay - pool.length));
//       }

//       return pool;
//     },
//   }))
// );
