import { create } from 'zustand';
import dayjs from 'dayjs';
import { getSrsMap, saveSrsMap, type SRSMap } from '@/lib/user-data';
import { useAuth } from './auth';

const STEPS = [1, 3, 7, 14, 30]; // days

type SRSState = {
  map: SRSMap;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  markCorrect: (wordId: string) => void;
  markWrong: (wordId: string) => void;
  flush: () => Promise<void>;
};

let dirty = false;
let flushTimer: any = null;

export const useSRS = create<SRSState>((set, get) => ({
  map: {},
  hydrated: false,
  async hydrate() {
    const uid = useAuth.getState().user?.uid;
    if (!uid) return;
    const m = await getSrsMap(uid);
    set({ map: m, hydrated: true });
  },

  markCorrect(wordId) {
    const uid = useAuth.getState().user?.uid;
    if (!uid) return;
    const map = { ...get().map };
    const now = dayjs();
    const rec = map[wordId] || { step: 0, due: now.format('YYYY-MM-DD'), last: now.format('YYYY-MM-DD') };
    const nextStep = Math.min(rec.step + 1, STEPS.length - 1);
    const due = now.add(STEPS[nextStep], 'day').format('YYYY-MM-DD');
    map[wordId] = { step: nextStep, due, last: now.format('YYYY-MM-DD') };
    set({ map });
    scheduleFlush();
  },

  markWrong(wordId) {
    const uid = useAuth.getState().user?.uid;
    if (!uid) return;
    const map = { ...get().map };
    const now = dayjs();
    const rec = map[wordId] || { step: 0, due: now.format('YYYY-MM-DD'), last: now.format('YYYY-MM-DD') };
    // keep same step; push due to tomorrow
    const due = now.add(1, 'day').format('YYYY-MM-DD');
    map[wordId] = { step: rec.step, due, last: now.format('YYYY-MM-DD') };
    set({ map });
    scheduleFlush();
  },

  async flush() {
    const uid = useAuth.getState().user?.uid;
    if (!uid) return;
    const map = get().map;
    await saveSrsMap(uid, map);
    dirty = false;
  },
}));

function scheduleFlush() {
  dirty = true;
  if (flushTimer) clearTimeout(flushTimer);
  // debounce writes to Firestore
  flushTimer = setTimeout(() => {
    useSRS.getState().flush();
  }, 1000);
}
