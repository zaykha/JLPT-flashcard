import React from 'react';
import styled, { keyframes, css } from 'styled-components';

type Props = {
  /** isPerfect === true → sakura celebration, else gentle “ganbaru” uplift */
  perfect: boolean;
  /** How many floating bits to render (keep small for perf) */
  density?: number;
  /** Optional: place above/below content (default below) */
  z?: number;
  className?: string;
};

export const ResultFX: React.FC<Props> = ({ perfect, density = 16, z = 0, className }) => {
  // Render a fixed small number of nodes for performance
  const items = Array.from({ length: density });

  return (
    <FXWrap aria-hidden className={className} style={{ zIndex: z }}>
      {perfect ? (
        <SakuraLayer>
          {items.map((_, i) => (
            <Petal key={i} style={{ ['--i' as any]: i }} />
          ))}
        </SakuraLayer>
      ) : (
        <UpliftLayer>
          {items.map((_, i) => (
            <Paper key={i} style={{ ['--i' as any]: i }} />
          ))}
        </UpliftLayer>
      )}
    </FXWrap>
  );
};

/* ================= Styles ================= */

const FXWrap = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
`;

/* ------- Success: falling sakura petals ------- */
const fall = keyframes`
  0%   { transform: translate3d(var(--x,0px), -10%, 0) rotate(0deg); opacity: 0; }
  8%   { opacity: .95; }
  100% { transform: translate3d(var(--x,0px), 110%, 0) rotate(360deg); opacity: 0; }
`;
const sway = keyframes`
  0%   { transform: translateX(-12px) rotate(-8deg); }
  50%  { transform: translateX(12px)  rotate(8deg); }
  100% { transform: translateX(-12px) rotate(-8deg); }
`;

const SakuraLayer = styled.div`
  position: absolute; inset: 0;
`;

const Petal = styled.i`
  --size: 12px;
  position: absolute;
  top: -10%;
  left: 0;
  width: var(--size);
  height: calc(var(--size) * 0.7);
  border-radius: 60% 60% 60% 60% / 80% 80% 40% 40%;
  background: radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.9),
      transparent 55%
    ),
    ${({ theme }) => theme.colors.gold}33;
  box-shadow: inset 0 0 0 1px ${({ theme }) => `${theme.colors.gold}66`};

  /* Distribute across width with a bit of randomness */
  left: calc((var(--i) * 17%) % 100%);
  --x: calc((var(--i) * 9px) - 40px);

  /* Each petal falls at a slightly different speed/delay */
  animation:
    ${fall} calc(6s + (var(--i) * 0.2s)) linear calc((var(--i) * 0.12s)) infinite,
    ${sway} calc(2.6s + (var(--i) * 0.1s)) ease-in-out infinite alternate;

  will-change: transform, opacity;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    display: none;
  }
`;

/* ------- Retry: gentle uplifting “paper” (ganbaru vibes) ------- */
const rise = keyframes`
  0%   { transform: translate3d(var(--x,0px), 105%, 0) scale(.9); opacity: 0; }
  10%  { opacity: .7; }
  100% { transform: translate3d(var(--x,0px), -10%, 0) scale(1); opacity: 0; }
`;
const float = keyframes`
  0%   { transform: translateY(0) rotate(-2deg); }
  50%  { transform: translateY(-8px) rotate(2deg); }
  100% { transform: translateY(0) rotate(-2deg); }
`;

const UpliftLayer = styled.div`
  position: absolute; inset: 0;
`;

const Paper = styled.i`
  --w: 10px; --h: 6px;
  position: absolute;
  bottom: -10%;
  left: 0;
  width: var(--w);
  height: var(--h);
  background:
    linear-gradient(90deg, ${({ theme }) => `${theme.colors.secondary}66`} 0 50%, ${({ theme }) =>
      `${theme.colors.panel}`} 50% 100%);
  border: 1px solid ${({ theme }) => `${theme.colors.borderDark}`};
  border-radius: 2px;

  left: calc((var(--i) * 13%) % 100%);
  --x: calc((var(--i) * -8px) + 40px);

  opacity: 0.7;
  filter: saturate(1.1);

  animation:
    ${rise} calc(5.5s + (var(--i) * 0.15s)) linear calc((var(--i) * 0.18s)) infinite,
    ${float} calc(3.2s + (var(--i) * 0.12s)) ease-in-out infinite;

  will-change: transform, opacity;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    display: none;
  }
`;
