import { create } from 'zustand';
import { useAuth } from '@/store/auth';
import { useTopics } from '@/store/topics';
import { mapVocabItemToWord, type Word } from '@/types/vocab';
import { createOrGetTodaySession } from '@/lib/api';
import { recordLessonCompletion, type JLPTLevelStr } from '@/lib/user-data';
import { jstTodayISO } from '@/lib/cache/lessons';
import type { NumberMap } from 'framer-motion';

type Stage = 'settings'|'studying'|'quiz'|'summary';

export type QuizType = 'mcq' | 'matching' | 'kanjiToHiragana' | 'hiraganaToKanji';

export type QuizItem =
  | { id: string; type: 'mcq';   prompt: string; choices: string[]; correct: string; sourceId: string }
  // | { id: string; type: 'typing'; prompt: string; correct: string; sourceId: string }
  | {
      id: string;
      type: 'matching';
      // the correct right row for pairs[i] is the one whose id === pairs[i].sourceId
      pairs: Array<{ left: string; right: string; rightId: string; sourceId: string }>;
    }
  | { id: string; type: 'kanjiToHiragana';   prompt: string; choices: string[]; correct: string; sourceId: string }
  | { id: string; type: 'hiraganaToKanji';   prompt: string; choices: string[]; correct: string; sourceId: string };

type QuizConfig = {
  types: QuizType[];         // enabled types
  perQuestionSec: number;    // timer seconds
  size: number;              // how many questions (for matching we consume 1 item but multiple pairs)
};

type SessionState = {
  stage: Stage;
  today: Word[];
  index: number;
  lessonNo: number | null;   // e.g., 2025-10-03
  quizAttempt: number;       // attempt count for current lesson

  // quiz
  quiz: QuizItem[];
  quizIndex: number;
  quizConfig: QuizConfig;
  quizResults: Array<{ id: string; correct: boolean; your?: string; expected?: string }>;

  setStage: (s: Stage) => void;
  setToday: (w: Word[]) => void;
  next: () => void;
  prev: () => void;
  buildTodayFixed: () => Promise<void>;

  buildQuiz: () => void;
  setQuizIndex: (n: number) => void;
  pushQuizResult: (r: { id: string; correct: boolean; your?: string; expected?: string }) => void;
  resetQuiz: () => void;
  markLessonCompleted: () => Promise<void>;
};

const shuffle = <T,>(arr: T[]) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const useSession = create<SessionState>((set, get) => ({
  stage: 'settings',
  today: [],
  index: 0,
  lessonNo: null,
  quizAttempt: 0,

  quiz: [],
  quizIndex: 0,
  quizResults: [],
  quizConfig: {
    types: ['mcq', 'matching', 'kanjiToHiragana', 'hiraganaToKanji'],
    perQuestionSec: 20,
    size: 10,
  },

  setStage: (s) => set({ stage: s }),
  setToday: (w) => set({ today: w, index: 0 }),
  next: () => set(s => ({ index: Math.min(s.index + 1, Math.max(0, s.today.length-1)) })),
  prev: () => set(s => ({ index: Math.max(0, s.index - 1) })),

  // session.ts — 3) REPLACE buildTodayFixed() to wire perDay/level from profile AND set quiz size dynamically
async buildTodayFixed() {
  const auth = useAuth.getState();
  if (!auth.user) return;

  // ---- 1) Profile & progress
 const boot = (await import('@/lib/bootstrap')).loadBootstrap();
  if (!boot?.profile || !boot?.lessonProgress || !boot?.catalogLevel) return;

  const level = boot.catalogLevel as JLPTLevelStr;
  const profile = boot.profile;
  const progress = boot.lessonProgress;

  if (!profile) return;
  const todayISO = jstTodayISO();

  // ---- 2) Catalog (cached)
  const { loadBootCatalog } = await import('@/lib/bootstrap');
  const catalog = await loadBootCatalog(level);
  if (!catalog) {
    console.warn('[session] missing catalog for', level);
    return;
  }
  // If your LessonCatalog type doesn't include lessons in TS, cast here:
  const lessons = (catalog as any).lessons as Array<{ lessonNo: number; vocabIds: string[]; grammarIds: string[] }>;
    if (!Array.isArray(lessons)) {
      // keep the warn for when console works again
      console.warn('[session] catalog.lessons missing/invalid');
      return;
    }

  // ---- 3) Ensure today's queue in Firestore: progress.current: string[]
  // Rebuild if date changed or queue missing/empty
  let queue = Array.isArray(progress.current) ? progress.current.map(String) : [];
  const sameDay = progress.currentDateISO === todayISO;

  if (!sameDay || queue.length === 0) {
    // derive base from last completed
    const lastCompletedNo = Math.max(...(progress?.completed?.map(e => e.lessonNo ?? -Infinity) ?? [-Infinity]));
    const range = (catalog as any).lessonRange as { start: number; end: number };
    const perDay = 2; // default daily count; increase elsewhere if user buys more

    const startNo = Number.isFinite(lastCompletedNo) ? (lastCompletedNo as number) + 1 : range.start;
    const nextNos: number[] = [];
    for (let n = startNo; n <= range.end && nextNos.length < perDay; n += 1) nextNos.push(n);
    queue = nextNos.map(String);

    // write back to Firestore
    const [{ doc, getDoc, setDoc, updateDoc }, { db }] = await Promise.all([
      import('firebase/firestore'),
      import('@/lib/firebase'),
    ]);
    const ref = doc(db, 'users', auth.user.uid, 'progress', 'lessons');
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { completed: [], failed: [], current: queue, currentDateISO: todayISO });
    } else {
      await updateDoc(ref, { current: queue, currentDateISO: todayISO } as any);
    }
  }
    // DEBUG output
    console.group('[session][DEBUG] catalog snapshot');
    console.log('level:', level);
    console.log('catalog keys:', Object.keys(catalog as any));
    console.log('has lessons:', Array.isArray((catalog as any).lessons));
    console.log('sample lesson:', (catalog as any).lessons?.[0] ?? null);
    console.groupEnd();


  // pick first lesson in today's queue that exists in catalog
  const lessonNoStr = queue[0];
  const lessonNo = lessonNoStr ? Number(lessonNoStr) : NaN;
  if (!Number.isFinite(lessonNo)) {
    console.warn('[session] invalid lessonNo in queue', queue);
    return;
  }
  const entry = lessons.find(l => l.lessonNo === lessonNo);
  if (!entry) {
    console.warn('[session] lesson entry not found', { level, lessonNo });
    return;
  }
  
    // console.group('[session][DEBUG] pick today lesson');
    // console.log('todayISO:', todayISO);
    // console.log('queue:', queue);
    // console.log('picked lessonNo:', lessonNo);
    // console.groupEnd();

// Also mirror to window for quick inspection:
try { (window as any).__KOZA_TODAY_PICK__ = { todayISO, queue, lessonNo, level }; } catch {}

  // ---- 4) Today cache hit?
  const { loadTodayLesson, saveTodayLesson, endOfTodayJST } = await import('@/lib/cache/lessons');
  const todayKey = { uid: auth.user.uid, level, lessonNo, dateISO: todayISO };

  //debug session
  console.log('[session][DEBUG] todayKey', todayKey);

  // optional: list entire local cache (one-time)
  import('@/lib/cache/lessons').then(m => m.debugListAllTodayLessons());

  const cached = loadTodayLesson(todayKey);
  if (cached?.words?.length) {
    useTopics.getState().setWords(cached.words as any);
    set(s => ({
      today: cached.words as any,
      index: 0,
      stage: 'studying',
      lessonId: todayISO,
      quizAttempt: 0,
      quizConfig: { ...s.quizConfig, size: Math.min(s.quizConfig.size || 10, (cached.words as any).length) },
    }));console.group('[session][DEBUG] today cache HIT');

    // Debug Session
    // console.log('todayKey:', todayKey);
    // console.log('words.length:', cached.words.length);
    // console.log('first word:', cached.words[0] ?? null);
    // console.groupEnd();
    // try { (window as any).__KOZA_TODAY_SOURCE__ = { source: 'cache', todayKey, words: cached.words }; } catch {}

    return;
  }
  
    // console.group('[session][DEBUG] today cache MISS → fetching content');
    // console.log('lesson entry:', entry);
    // console.log('vocabIds:', entry.vocabIds);
    // console.log('grammarIds:', entry.grammarIds);
    // console.groupEnd();

  // ---- 5) Fetch vocab & grammar content (IDs from catalog entry)
  const [{ getVocabByIds, getGrammarByIds }, { mapVocabDocToWord /*, mapGrammarDocToWord*/ }] = await Promise.all([
    import('@/lib/firestore/content'),
    import('@/types/vocab'),
  ]);

  const [vocabDocs, grammarDocs] = await Promise.all([
    getVocabByIds(entry.vocabIds || []),
    getGrammarByIds(entry.grammarIds || []),
  ]);

  // Map to Word[]
  // Each vocab document from Firestore should already contain its own topic
const vocabWords = vocabDocs.map(d => {
  const topic = d.topic || d.topicKey || d.category || d.tags?.[0] || 'general';
  return mapVocabDocToWord(d, { lessonTopic: topic });
});

  // If you want grammar as cards too, uncomment:
  // const grammarWords = grammarDocs.map(mapGrammarDocToWord);
  const words = vocabWords; // or [...vocabWords, ...grammarWords];

  useTopics.getState().setWords(words as any);

  // ---- 6) Save to today cache (expires end-of-day JST)
  saveTodayLesson({
    key: todayKey,
    words,
    expiresAt: endOfTodayJST(),
  });

  // ---- 7) Set session
  set(s => ({
    today: words as any,
    index: 0,
    stage: 'studying',
    lessonId: todayISO,
    quizAttempt: 0,
    quizConfig: { ...s.quizConfig, size: Math.min(s.quizConfig.size || 10, words.length || 10) },
  }));
},


// session.ts — 4) REMOVE the typing builder and references (delete your old buildTyping)
// and REPLACE buildQuiz() to use dynamic size and no 'typing'
// buildQuiz() {
//   const { today, quizConfig } = get();
//   const pool = today.slice();
//   if (pool.length === 0) { set({ quiz: [], quizIndex: 0 }); return; }

//   const items: QuizItem[] = [];
//   const shuffled = shuffle(pool);
//   const targetSize = Math.max(1, quizConfig.size || 10);

//   const buildMCQ = (w: Word): QuizItem => {
//     const correct = w.english;
//     const distractors = shuffle(pool.filter(x => x.id !== w.id)).slice(0, 3).map(x => x.english);
//     const choices = shuffle([correct, ...distractors]);
//     const prompt = w.kanji || w.hiragana || w.romaji || w.english;
//     return { id: `q_${w.id}_mcq`, type: 'mcq', prompt, choices, correct, sourceId: w.id };
//   };

//   const buildMatching = (chunk: Word[]): QuizItem => {
//     const pick = chunk.slice(0, 4);
//     const lefts = pick.map(x => ({
//       left: x.kanji || x.hiragana || x.romaji || x.english,
//       sourceId: x.id
//     }));
//     const rightPool = pick.map(x => ({ text: x.english, id: x.id }));
//     const shuf = shuffle(rightPool);
//     const pairs = lefts.map((L, i) => ({
//       left: L.left,
//       sourceId: L.sourceId,
//       right: shuf[i].text,
//       rightId: shuf[i].id,
//     }));
//     return { id: `q_match_${pick.map(p=>p.id).join('_')}`, type: 'matching', pairs };
//   };

//   const buildKanjiToHiragana = (w: Word, pool: Word[]): QuizItem => {
//     if (!w.kanji || !w.hiragana) throw new Error('Not a kanji word');
//     const correct = w.hiragana;
//     const distractors = shuffle(pool.filter(x => x.id !== w.id && x.hiragana))
//       .slice(0, 3)
//       .map(x => x.hiragana!);
//     const choices = shuffle([correct, ...distractors]);
//     return { id: `q_${w.id}_k2h`, type: 'kanjiToHiragana', prompt: w.kanji, choices, correct, sourceId: w.id };
//   };

//   const buildHiraganaToKanji = (w: Word, pool: Word[]): QuizItem => {
//     if (!w.hiragana || !w.kanji) throw new Error('Not a kana+kanji word');
//     const correct = w.kanji;
//     const distractors = shuffle(pool.filter(x => x.id !== w.id && x.kanji))
//       .slice(0, 3)
//       .map(x => x.kanji!);
//     const choices = shuffle([correct, ...distractors]);
//     return { id: `q_${w.id}_h2k`, type: 'hiraganaToKanji', prompt: w.hiragana, choices, correct, sourceId: w.id };
//   };

//   let i = 0;
//   while (items.length < targetSize && i < shuffled.length) {
//     for (const kind of quizConfig.types) {
//       if (items.length >= targetSize) break;

//       if (kind === 'matching') {
//         const chunk = shuffled.slice(i, i + 4);
//         if (chunk.length < 4) break;
//         items.push(buildMatching(chunk));
//         i += 4;
//         continue;
//       }

//       const w = shuffled[i++];
//       if (!w) break;

//       if (kind === 'kanjiToHiragana') {
//         if (w.kanji && w.hiragana) items.push(buildKanjiToHiragana(w, pool));
//         continue;
//       }
//       if (kind === 'hiraganaToKanji') {
//         if (w.hiragana && w.kanji) items.push(buildHiraganaToKanji(w, pool));
//         continue;
//       }

//       // default to MCQ
//       items.push(buildMCQ(w));
//     }
//   }

//   set({ quiz: items, quizIndex: 0, quizResults: [] });
// },
buildQuiz() {
  const { today, quizConfig } = get();
  const pool = today.slice();
  if (pool.length === 0) { set({ quiz: [], quizIndex: 0 }); return; }

  const items: QuizItem[] = [];
  const shuffled = shuffle(pool);
  const targetSize = Math.max(1, quizConfig.size || 10);

  const isKanaOnly = (str: string) => /^[\u3040-\u30FFー]+$/.test(str); // hiragana + katakana only

  const buildMCQ = (w: Word): QuizItem => {
    const correct = w.english;
    const distractors = shuffle(pool.filter(x => x.id !== w.id)).slice(0, 3).map(x => x.english);
    const choices = shuffle([correct, ...distractors]);
    const prompt = w.kanji || w.hiragana || w.romaji || w.english;
    return { id: `q_${w.id}_mcq`, type: 'mcq', prompt, choices, correct, sourceId: w.id };
  };

  const buildMatching = (chunk: Word[]): QuizItem => {
    const pick = chunk.slice(0, 4);
    const lefts = pick.map(x => ({
      left: x.kanji || x.hiragana || x.romaji || x.english,
      sourceId: x.id
    }));
    const rightPool = pick.map(x => ({ text: x.english, id: x.id }));
    const shuf = shuffle(rightPool);
    const pairs = lefts.map((L, i) => ({
      left: L.left,
      sourceId: L.sourceId,
      right: shuf[i].text,
      rightId: shuf[i].id,
    }));
    return { id: `q_match_${pick.map(p=>p.id).join('_')}`, type: 'matching', pairs };
  };

  const buildKanjiToHiragana = (w: Word, pool: Word[]): QuizItem => {
    if (!w.kanji || !w.hiragana) throw new Error('Not a kanji word');
    if (isKanaOnly(w.kanji)) return buildMCQ(w); // skip kana-only words
    const correct = w.hiragana;
    const distractors = shuffle(pool.filter(x => x.id !== w.id && x.hiragana))
      .slice(0, 3)
      .map(x => x.hiragana!);
    const choices = shuffle([correct, ...distractors]);
    return { id: `q_${w.id}_k2h`, type: 'kanjiToHiragana', prompt: w.kanji, choices, correct, sourceId: w.id };
  };

  const buildHiraganaToKanji = (w: Word, pool: Word[]): QuizItem => {
    if (!w.hiragana || !w.kanji) throw new Error('Not a kana+kanji word');
    if (isKanaOnly(w.hiragana)) return buildMCQ(w); // skip kana-only words
    const correct = w.kanji;
    const distractors = shuffle(pool.filter(x => x.id !== w.id && x.kanji))
      .slice(0, 3)
      .map(x => x.kanji!);
    const choices = shuffle([correct, ...distractors]);
    return { id: `q_${w.id}_h2k`, type: 'hiraganaToKanji', prompt: w.hiragana, choices, correct, sourceId: w.id };
  };

  let i = 0;
  while (items.length < targetSize && i < shuffled.length) {
    for (const kind of quizConfig.types) {
      if (items.length >= targetSize) break;

      if (kind === 'matching') {
        const chunk = shuffled.slice(i, i + 4);
        if (chunk.length < 4) break;
        items.push(buildMatching(chunk));
        i += 4;
        continue;
      }

      const w = shuffled[i++];
      if (!w) break;

      if (kind === 'kanjiToHiragana') {
        // Skip if kana-only (no real kanji difference)
        if (w.kanji && w.hiragana && !isKanaOnly(w.kanji))
          items.push(buildKanjiToHiragana(w, pool));
        continue;
      }
      if (kind === 'hiraganaToKanji') {
        if (w.hiragana && w.kanji && !isKanaOnly(w.hiragana))
          items.push(buildHiraganaToKanji(w, pool));
        continue;
      }

      // fallback
      items.push(buildMCQ(w));
    }
  }

  set({ quiz: items, quizIndex: 0, quizResults: [] });
},


  setQuizIndex(n) { set({ quizIndex: n }); },
  pushQuizResult(r) { set(s => ({ quizResults: [...s.quizResults, r] })); },
  resetQuiz() { set({ quiz: [], quizIndex: 0, quizResults: [] }); },

async markLessonCompleted() {
  const auth = useAuth.getState();
  const uid = auth.user?.uid;
  const lessonNo = get().lessonNo;
  if (!uid || !lessonNo) return;

  const todayWords = get().today;
  const level = todayWords[0]?.level as JLPTLevelStr | undefined;
  const completedAt = new Date().toISOString();

  try {
    // 1️⃣ Record in Firestore
    await recordLessonCompletion(uid, {
      lessonNo,
      level: level ?? null,
      completedAt,
    });

    // 2️⃣ Update local bootstrap snapshot (central state)
    const { loadBootstrap, saveBootstrap } = await import('@/lib/bootstrap');
    const bootNow = loadBootstrap();
    if (!bootNow) return;

    const prevCompleted = Array.isArray(bootNow.lessonProgress?.completed)
      ? bootNow.lessonProgress.completed
      : [];

    const updatedProgress = {
      ...bootNow.lessonProgress,
      completed: [
        ...prevCompleted,
        { lessonNo, level, completedAt },
      ],
      // ensure `failed` is always defined as an array
      failed: bootNow.lessonProgress?.failed ?? [],
      // optionally remove from "current"
      current: Array.isArray(bootNow.lessonProgress?.current)
        ? bootNow.lessonProgress.current.filter(n => n !== String(lessonNo))
        : [],
      currentDateISO: bootNow.lessonProgress?.currentDateISO ?? new Date().toISOString().slice(0, 10),
    };

    const updatedBoot = {
      ...bootNow,
      lessonProgress: updatedProgress,
      cachedAt: Date.now(),
    };

    saveBootstrap(updatedBoot);

    // 3️⃣ Optional: debug confirmation
    console.info('[session] ✅ Lesson marked complete', { lessonNo, updatedProgress });
  } catch (error) {
    console.warn('[session] ❌ Failed to record lesson completion', error);
  }
},

}));
