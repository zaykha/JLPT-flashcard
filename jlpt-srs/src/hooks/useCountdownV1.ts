// src/hooks/useCountdown.ts
import { useEffect, useRef, useState } from 'react';

export function useCountdown({
  seconds,
  key,          // change when the question changes, e.g. question.id
  paused = false,
  onTimeout,
}: {
  seconds: number;
  key: string | number;
  paused?: boolean;
  onTimeout?: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, seconds));
  const timeoutRef = useRef(onTimeout);
  const pausedRef = useRef(!!paused);

  useEffect(() => { timeoutRef.current = onTimeout; }, [onTimeout]);
  useEffect(() => { pausedRef.current = !!paused; }, [paused]);

  // reset on key/per-question changes
  useEffect(() => {
    setTimeLeft(Math.max(0, seconds));
  }, [seconds, key]);

  useEffect(() => {
    if (seconds <= 0) return;
    let active = true;

    const id = setInterval(() => {
      if (!active || pausedRef.current) return;
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          // fire once
          timeoutRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, [seconds, key]);

  const pct = seconds > 0 ? (timeLeft / seconds) * 100 : 0;
  return { timeLeft, pct, setTimeLeft };
}
