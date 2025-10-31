// src/hooks/useKeyNav.ts
import { useEffect, useRef } from 'react';

type KeyNavOpts = {
  onPrev?: () => void;
  onNext?: () => void;
  onFlip?: () => void;
  disabled?: boolean;
};

export function useKeyNav({ onPrev, onNext, onFlip, disabled }: KeyNavOpts) {
  const disabledRef = useRef(!!disabled);
  const prevRef = useRef(onPrev);
  const nextRef = useRef(onNext);
  const flipRef = useRef(onFlip);

  useEffect(() => { disabledRef.current = !!disabled; }, [disabled]);
  useEffect(() => { prevRef.current = onPrev; }, [onPrev]);
  useEffect(() => { nextRef.current = onNext; }, [onNext]);
  useEffect(() => { flipRef.current = onFlip; }, [onFlip]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabledRef.current) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); prevRef.current?.(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); nextRef.current?.(); }
      else if (e.code === 'Space') { e.preventDefault(); flipRef.current?.(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
