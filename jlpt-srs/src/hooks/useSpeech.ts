// TODO: useSpeech (ja-JP voice)
// src/hooks/useSpeech.ts
import { useCallback } from 'react';

export function useSpeech() {
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported');
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    window.speechSynthesis.speak(u);
  }, []);

  return { speak };
}
