
import { Card } from '@/styles/Pages/FlashCardPage.styles';
import type { Word } from '@/types/vocab';
import React from 'react';

type Props = {
  word: Word;
  flipped: boolean;
  onFlip: () => void;
  mode: 'kanji-to-english' | 'english-to-kanji';
};

export const Flashcard: React.FC<Props> = ({ word, flipped, onFlip, mode }) => {
  const activeTopic = (word.topicKey as any) || 'default';

  const frontJP =
   (word.kanji && word.kanji.trim()) ||
   (word.hiragana && word.hiragana.trim()) ||
   (word.romaji && word.romaji.trim()) ||
   '—';
  const backHira = (word.hiragana && word.hiragana.trim()) || '';
  const backKanji = (word.kanji && word.kanji.trim()) || '';
  const backEng = (word.english && String(word.english).trim()) || '';
  const front = mode === 'kanji-to-english' ? frontJP : (backEng || '—');

  return (
    <Card flipped={flipped} onClick={onFlip} $topic={activeTopic} data-topic={activeTopic}>
      <div className="inner">
        <div className="face front">{front}</div>
        <div className="face back">
          {backHira ? <div className="hiragana">{backHira}</div> : null}
          {backKanji ? <div className="kanji">{backKanji}</div> : null}
          <div className="english">{backEng}</div>
        </div>
      </div>
    </Card>
  );
};
