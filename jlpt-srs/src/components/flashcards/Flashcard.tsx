
import React from 'react';
import styled, { css } from 'styled-components';
import type { Topic, Word } from '@/types/vocab';

// Helper to resolve topic background
// const topicBg = (topic: Topic | undefined, theme: any) =>
//   (topic && theme.topicGradients?.[topic]) || theme.gradient.slate;
  const Card = styled.div<{ flipped: boolean; $topic?: Topic }>`
  perspective: 1000px;
  width: 100%;
  max-width: 420px;
  height: 280px;
  margin: 0 auto;
  cursor: pointer;
  position: relative;
  user-select: none;
  image-rendering: pixelated;

  /* ensure sizing is consistent so faces don't shrink */
  &, * { box-sizing: border-box; }

  .inner {
    position: relative;
    inset: 0;  
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    transform: rotateY(${p => (p.flipped ? 180 : 0)}deg);
    will-change: transform;
    transform-origin: center; 
    border-radius: ${({ theme }) => theme.radii.card};
    // overflow: hidden;   
  }

  .face {
    backface-visibility: hidden;
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: ${({ theme }) => theme.radii.card};
    font-weight: 700;
    padding: 1rem;
    box-shadow: ${({ theme }) => theme.shadow.card};
    border: 2px solid rgba(0,0,0,0.25);
    -webkit-backface-visibility: hidden; /* Safari */
    /* sprite-like inner border */
    box-shadow:
      ${({ theme }) => theme.textures.border8},
      0 12px 24px rgba(0,0,0,0.25);
    // position: relative;
    overflow: hidden;

    /* overlays: scanlines + dither */
    &::after, &::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    &::before {
      background-image: ${({ theme }) => theme.textures.scanlines};
      mix-blend-mode: multiply;
      inset: 6px; 
      border-radius: calc(${({ theme }) => theme.radii.card} - 6px);
      pointer-events: none;
      box-shadow:
        inset 0 0 0 2px rgba(255,255,255,0.08),   /* crisp inner stroke */
        inset 0 0 18px rgba(255,255,255,0.06);    /* soft glow */
    }
    &::after {
      background-image: ${({ theme }) => theme.textures.dither};
      opacity: 0.5;
    }
  }

  .front {
    ${({ $topic, theme }) => css`
      background: ${$topic ? theme.topicGradients[$topic] : theme.gradient.slate};
      color: #f3f4f6;
    `}
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: clamp(1.6rem, 5vw, 2.6rem);
    text-align: center;
    letter-spacing: 0.02em;
    text-shadow: 0 2px 0 rgba(0,0,0,0.4);
    display: grid;
    place-items: center;
    padding: 1.25rem;
  }

  .back {
    ${({ theme }) => css`
      background: ${theme.gradient.green};
      // background: #;
      color: #f0fdf4;
    `}
    transform: rotateY(180deg);
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .kanji {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: clamp(1.4rem, 4.5vw, 2rem);
    line-height: 1.2;
  }
  .hiragana {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: clamp(1rem, 3vw, 1.25rem);
    color: #e5e7eb;
    opacity: 0.9;
  }
  .english {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: clamp(1rem, 3.2vw, 1.4rem);
    font-weight: 800;
    letter-spacing: 0.02em;
  }
  /* accessibility: reduce spin for motion-sensitive users */
  @media (prefers-reduced-motion: reduce) {
    .inner { transition: transform 0.2s ease; }
  }
`;

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
