// TODO: fetchers via react-query
// src/lib/api.ts
import { useQuery } from '@tanstack/react-query';

const BASE = import.meta.env.VITE_JLPT_API_BASE ?? 'https://jlpt-vocab-api.vercel.app';

// Raw API item shape (based on that public API)
export type RawWord = {
  word: string;       // kanji or kana
  furigana?: string;  // reading
  meaning: string;    // english
  level: number;      // 1..5 (N1..N5)
};

async function fetchAllByLevel(level: number): Promise<RawWord[]> {
  const url = `${BASE}/api/words/all?level=${level}&cb=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// React Query hook — call this once in App bootstrap or a loader
export function useJLPTWords(level: number | undefined) {
  return useQuery({
    queryKey: ['jlptWords', level],
    queryFn: () => fetchAllByLevel(level!),
    enabled: typeof level === 'number',
    staleTime: 1000 * 60 * 60,
  });
}
