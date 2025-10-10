import { useCallback, useEffect, useRef, useState } from 'react';

type SpeakOpts = {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string; // default 'ja-JP'
};

function pickJapaneseVoice(voices: SpeechSynthesisVoice[] | undefined) {
  if (!voices?.length) return undefined;
  const byLang = voices.filter(v => v.lang?.toLowerCase().startsWith('ja'));
  const preferredNames = [
    'Kyoko',
    'O-Ren',
    'Mizuki',
    'Google Japanese',
    'Google Japanese (Japan)',
    'Google Japanese (ja-JP)'
  ];
  for (const name of preferredNames) {
    const found = byLang.find(v => v.name.includes(name));
    if (found) return found;
  }
  return byLang[0] || undefined;
}

export function useSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[] | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const unlockedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    function loadVoices() {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length) {
        setVoices(v);
        setIsReady(true);
        return true;
      }
      return false;
    }

    let attempts = 0;
    const tryLoad = () => {
      if (loadVoices()) return;
      if (++attempts < 10) setTimeout(tryLoad, 200);
    };

    tryLoad();
    const handler = () => loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', handler);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', handler);
  }, []);

  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    if (!('speechSynthesis' in window)) return;
    setIsUnlocking(true);
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    u.lang = 'ja-JP';
    u.onend = () => {
      unlockedRef.current = true;
      setIsUnlocking(false);
    };
    try { window.speechSynthesis.cancel(); } catch {}
    try { window.speechSynthesis.speak(u); } catch {
      setIsUnlocking(false);
    }
  }, []);

  const speakAsync = useCallback((text: string, opts: SpeakOpts = {}) => {
    return new Promise<void>((resolve, reject) => {
      if (!text || !text.trim()) return resolve();

      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return reject(new Error('Speech synthesis not supported'));
      }

      const doSpeak = () => {
        try { window.speechSynthesis.cancel(); } catch {}

        const u = new SpeechSynthesisUtterance(text);
        const lang = (opts.lang || 'ja-JP').toLowerCase();

        u.lang = lang;
        u.rate = opts.rate ?? 1;
        u.pitch = opts.pitch ?? 1;
        u.volume = opts.volume ?? 1;

        const jp = pickJapaneseVoice(voices || undefined);
        if (jp) u.voice = jp;

        u.onstart = () => setIsSpeaking(true);
        u.onend = () => { setIsSpeaking(false); resolve(); };
        u.onerror = (e) => { setIsSpeaking(false); reject(e.error || e); };

        try {
          window.speechSynthesis.speak(u);
        } catch (e) {
          setIsSpeaking(false);
          reject(e);
        }
      };

      // Ensure unlock first (must be called inside a user gesture)
      if (!unlockedRef.current) {
        unlock();
        // small delay to let unlock finish; safe on mobile
        setTimeout(doSpeak, 120);
      } else if (!isReady) {
        setTimeout(doSpeak, 120);
      } else {
        doSpeak();
      }
    });
  }, [voices, isReady, unlock]);

  return { speakAsync, unlock, isReady, isUnlocking, isSpeaking };
}
