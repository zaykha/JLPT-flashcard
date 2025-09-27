// TODO: Audio button
import React from 'react';
import styled from 'styled-components';
import { useSpeech } from '@/hooks/useSpeech';
import type { Word } from '@/types/vocab';

const Btn = styled.button`
--shadow: #000;
padding: 12px 16px;
border-radius: 12px;
border: 2px solid #000;
font-family: ${({ theme }) => theme.fonts.heading};
font-size: clamp(12px, 3.2vw, 13px);
text-transform: uppercase;
letter-spacing: .04em;
cursor: pointer;
color: #fff;

background: linear-gradient(135deg, #7cdaf7, #214e5c);

box-shadow: 4px 4px 0 var(--shadow);
transition: transform .1s ease, box-shadow .1s ease, opacity .15s ease;

&:hover { transform: translateY(-1px); }
&:active { transform: translate(4px,4px); box-shadow: 0 0 0 var(--shadow); }

@media (max-width: 520px) {
  padding: 10px 12px;
}
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
`;


type Props = { word: Word };

export const SpeechButton: React.FC<Props> = ({ word }) => {
  const { speak } = useSpeech();

  return (
    <Btn onClick={(e) => { e.stopPropagation(); speak(word.hiragana || word.kanji); }}>
      🔊
    </Btn>
  );
};
