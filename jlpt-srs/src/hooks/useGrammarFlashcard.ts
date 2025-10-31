import type { GrammarPoint } from '@/types/grammar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';


type Grade = 'again'|'hard'|'good'|'easy';

export function useGrammarFlashcard(opts: {
  items: GrammarPoint[];
  initialIndex?: number;
  onGrade?: (g: { point: GrammarPoint; exampleIdx: number; grade: Grade }) => void;
}) {
  const { items, initialIndex = 0, onGrade } = opts;

  const [index, setIndex] = useState(() => Math.min(initialIndex, Math.max(items.length - 1, 0)));
  const [flipped, setFlipped] = useState(false);
  const [exampleIdx, setExampleIdx] = useState(0);

  const point = items[index];

  // choose a stable per-card random example if available
  useEffect(() => {
    if (!point?.examples?.length) { setExampleIdx(0); return; }
    const pick = Math.floor(Math.random() * point.examples.length);
    setExampleIdx(pick);
    setFlipped(false);
  }, [index, point?.id]);

  // audio TTS (browser SpeechSynthesis)
  const speak = useCallback(() => {
    const ex = point?.examples?.[exampleIdx];
    if (!ex?.jp || typeof window === 'undefined') return;
    const u = new SpeechSynthesisUtterance(ex.jp);
    u.lang = 'ja-JP';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [point, exampleIdx]);

  const flip = useCallback(() => setFlipped(f => !f), []);
  const next = useCallback(() => {
    setFlipped(false);
    setIndex(i => Math.min(i + 1, items.length - 1));
  }, [items.length]);
  const prev = useCallback(() => {
    setFlipped(false);
    setIndex(i => Math.max(i - 1, 0));
  }, []);

  const grade = useCallback((g: Grade) => {
    if (!point) return;
    onGrade?.({ point, exampleIdx, grade: g });
  }, [point, exampleIdx, onGrade]);

  // keyboard shortcuts: Space=flip, 1..4=grades, ←/→ nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT','TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === ' '){ e.preventDefault(); flip(); return; }
      if (e.key === 'ArrowRight'){ next(); return; }
      if (e.key === 'ArrowLeft'){ prev(); return; }
      if (e.key === '1') grade('again');
      if (e.key === '2') grade('hard');
      if (e.key === '3') grade('good');
      if (e.key === '4') grade('easy');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flip, next, prev, grade]);

  return {
    index, setIndex,
    flipped, flip,
    point,
    exampleIdx, setExampleIdx,
    speak,
    next, prev,
    grade,
    total: items.length,
  };
}
