import React, { useCallback, useMemo, useRef } from 'react';
import styled, { css } from 'styled-components';
import type { GrammarPoint } from '@/types/grammar';
import { stripParentheses } from '@/helpers/sanitize';

type Props = {
  point: GrammarPoint;
  flipped: boolean;
  onFlip: () => void;
};

export const GrammarFlashcard: React.FC<Props> = ({ point, flipped, onFlip }) => {
  const exampleIdx = 0;
  const ex = point.examples?.[exampleIdx];
  const titleJp = useMemo(() => stripParentheses(point.title_jp ?? '—'), [point.title_jp]);
  const shortExplanation = point.shortExplanation || point.explanation || '';
  const formationLines = (point.formation || point.core_form || '')
    .split(',')
    .map(f => f.trim())
    .filter(Boolean);

  const handleFlip = useCallback(() => onFlip?.(), [onFlip]);
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleFlip();
    }
  };

  // Prevent flipping when scrolling/touching inside
  const stopBubble = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <Card
      flipped={flipped}
      onKeyDown={onKeyDown}
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      aria-label="flip-card"
      aria-pressed={flipped ? 'true' : 'false'}
    >
      <div className="inner">
        {/* FRONT */}
        <Face className="front">
          <Wrap
            onClickCapture={stopBubble}
            onTouchStartCapture={stopBubble}
            onPointerDownCapture={stopBubble}
          >
            <Title>{titleJp}</Title>

            <Section>
              <Label>Explanation</Label>
              <Explain title={shortExplanation}>{shortExplanation}</Explain>
            </Section>

            <Section>
              <Label>Formation</Label>
              <FormationList>
                {formationLines.map((f, i) => (
                  <FormLine key={i}>
                    <code>{f}</code>
                  </FormLine>
                ))}
              </FormationList>
            </Section>
          </Wrap>
        </Face>

        {/* BACK */}
        <Face className="back">
          <Wrap
            onClickCapture={stopBubble}
            onTouchStartCapture={stopBubble}
            onPointerDownCapture={stopBubble}
          >
            <Title>Example {titleJp}</Title>
            <Section>
              <LabelBack>English</LabelBack>
              <TextEn>{ex?.en ?? ''}</TextEn>
            </Section>
            <Section>
              <LabelBack>Japanese</LabelBack>
              <TextJp>{ex?.jp ?? ''}</TextJp>
            </Section>
            {ex?.romaji && (
              <Section>
                <LabelBack>Romaji</LabelBack>
                <TextRomaji>{ex.romaji}</TextRomaji>
              </Section>
            )}
          </Wrap>
        </Face>
      </div>
    </Card>
  );
};
const Card = styled.div<{ flipped: boolean }>`
  perspective: 1000px;
  width: 100%;
  max-width: 560px;
  height: clamp(320px, 56vw, 380px);
  margin: 0 auto;
  position: relative;
  cursor: pointer;
  user-select: none;
  &, * { box-sizing: border-box; }

  .inner {
    width: 100%;
    height: 100%;
    position: relative;
    transition: transform 0.6s ease;
    transform-style: preserve-3d;
    transform: rotateY(${p => (p.flipped ? 180 : 0)}deg);
  }
`;

const Face = styled.div`
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: ${({ theme }) => theme.radii.card};
  border: 2px solid rgba(0,0,0,0.25);
  box-shadow: ${({ theme }) => theme.textures.border8}, 0 12px 24px rgba(0,0,0,0.25);
  overflow: hidden;
  transform: translateZ(0);

  &.front {
    background: ${({ theme }) => theme.gradient.slate};
    color: #f3f4f6;
    transform: rotateY(0deg);
    display: flex;
    flex-direction: column;
  }

  &.back {
    ${({ theme }) => css`background: ${theme.gradient.indigoNight}; color: #f0fdf4;`}
    transform: rotateY(180deg);
    display: flex;
    flex-direction: column;
  }
`;

const Wrap = styled.div`
  flex: 1;
  min-height: 0; /* ✅ critical for scroll */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: clamp(0.8rem, 2.5vw, 1.1rem);
  display: grid;
  gap: 0.9rem;
  contain: paint layout style;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
    border-radius: 6px;
  }
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.1rem, 2.2vw, 1.35rem);
  line-height: 1.3;
  font-weight: 800;
  text-align: center;
  text-shadow: 0 2px 0 rgba(0,0,0,0.35);
`;

const Section = styled.section`
  display: grid;
  gap: 0.3rem;
`;

const Label = styled.h3`
  font-size: clamp(0.65rem, 1vw, 0.78rem);
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.secondary};
  letter-spacing: 0.06em;
  margin: 0;
`;

const LabelBack = styled(Label)`
  color: ${({ theme }) => theme.colors.sakura};
`;

const Explain = styled.p`
  font-size: clamp(0.6rem, 1.6vw, 0.7rem);
  line-height: 1.55;
  overflow-wrap: anywhere;
  margin: 0;
`;

const FormationList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-content: flex-start;
`;

const FormLine = styled.div`
  code {
    font-size: clamp(0.7rem, 1.5vw, 0.8rem);
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.22);
    padding: 0.25rem 0.5rem;
    border-radius: 10px;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
`;

const TextEn = styled.p`
  font-size: clamp(0.55rem, 1.6vw, 0.65rem);
  line-height: 1.5;
  margin: 0;
`;

const TextJp = styled.p`
  font-size: clamp(0.9rem, 1.8vw, 1rem);
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
`;

const TextRomaji = styled.p`
  font-size: clamp(0.55rem, 1.5vw, 0.65rem);
  opacity: 0.9;
  margin: 0;
`;

/* ✅ Mobile adjustments */
const Responsive = css`
  @media (max-width: 480px) {
    ${Card} { height: clamp(260px, 60vw, 320px); }
    ${Title} { font-size: 0.9rem; }
    ${Explain}, ${TextEn}, ${TextJp}, ${TextRomaji} { font-size: 0.65rem; }
    ${Label}, ${LabelBack} { font-size: 0.55rem; }
  }
`;
