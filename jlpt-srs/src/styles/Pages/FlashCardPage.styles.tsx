import type { Topic } from '@/types/vocab';
import styled, { css }  from 'styled-components';

/* ===== Screen ===== */
export const Screen = styled.section`
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 24px 12px;
  position: relative;
  overflow: hidden;

  /* Theme-safe background (quoted URL) */
  background-color: ${({ theme }) => theme.colors.bg};
  background-image:
    ${({ theme }) => `url('${theme.backgrounds.FlashcardsPage}')`},
    ${({ theme }) => theme.textures.dither},
    radial-gradient(1200px 600px at 20% -10%, ${({ theme }) => `${theme.colors.secondary}59`}, transparent 60%),
    radial-gradient(900px 500px at 120% 110%, ${({ theme }) => `${theme.colors.gold}40`}, transparent 65%);
  background-repeat: no-repeat, repeat, no-repeat, no-repeat;
  background-size: cover, auto, auto, auto;
  background-position: center, center, center, center;

  @media (max-width: 520px) {
    /* Optional mobile art: FlashcardsPageMobile in theme.backgrounds */
    background-image:
      ${({ theme }) => `url('${(theme.backgrounds as any).FlashcardsPageMobile ?? theme.backgrounds.FlashcardsPage}')`},
      ${({ theme }) => theme.textures.dither};
  }
`;

export const TileOverlay = styled.div`
  position: absolute; inset: 0;
  opacity: .14;
  background-image:
    linear-gradient(to right, ${({ theme }) => `${theme.colors.text}0F`} 1px, transparent 1px),
    linear-gradient(to bottom, ${({ theme }) => `${theme.colors.text}0F`} 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
`;

/* ===== Panel ===== */
export const Panel = styled.section`
  width: min(860px, 100%);
  position: relative;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.card};

  /* Glassy panel using theme colors */
  background: ${({ theme }) => `${theme.colors.panel}3A`};
  border: 2px solid ${({ theme }) => theme.colors.borderDark};
  box-shadow:
    ${({ theme }) => theme.textures.border8},
    ${({ theme }) => theme.shadow.card};
  backdrop-filter: blur(6px);

  @media (min-width: 768px) { padding: 20px; }
`;

/* ===== Header ===== */
export const Header = styled.header`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  gap: 8px;
  margin: 8px 0 6px;
  padding: 4px 6px 12px;
  border-bottom: 2px dashed ${({ theme }) => theme.colors.border};

  @media (max-width: 520px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const Title = styled.h2`
  margin: 0;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(14px, 3.6vw, 18px);
  color: ${({ theme }) => theme.colors.text};
`;

/* ===== Body/Stage/HUD ===== */
export const Body = styled.div`
  display: grid;
  gap: 12px;
  padding-top: 12px;
`;

export const Stage = styled.div`
  display: grid;
  gap: 10px;
  justify-items: center;
`;

export const Hud = styled.div`
  display: grid;
  gap: 8px;
  justify-items: center;
`;

export const Counter = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(12px, 3.2vw, 13px);
  color: ${({ theme }) => theme.colors.text};
`;

export const BarWrap = styled.div`
  width: min(420px, 90%);
  height: 12px;
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  border-radius: 10px;
  background: ${({ theme }) => `${theme.colors.textMuted}22`};
  overflow: hidden;
`;

export const BarFill = styled.div<{ $pct: number }>`
  width: ${({ $pct: pct }) => `${pct}%`};
  height: 100%;
  background:
    ${({ theme }) => theme.components.progress.fill};
  transition: width 200ms ease;
`;

/* ===== Controls & Buttons ===== */
export const Controls = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 10px;
  @media (max-width: 520px) {
    grid-auto-flow: row;
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

export const Btn = styled.button<{ $variant?: 'primary' | 'secondary' | 'ghost' }>`
  --shadow: ${({ theme }) => theme.colors.pixelBorder};
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid var(--shadow);
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(12px, 3.2vw, 13px);
  text-transform: uppercase;
  letter-spacing: .04em;
  cursor: pointer;
  color: ${({ theme, $variant: variant }) =>
    variant === 'ghost' ? theme.colors.text : theme.colors.onPrimary};

  background: ${({ $variant: variant, theme }) =>
    variant === 'secondary'
      ? theme.colors.secondary
      : variant === 'ghost'
      ? theme.colors.panel
      : theme.colors.primary};

  box-shadow: 4px 4px 0 var(--shadow);
  transition: transform .1s ease, box-shadow .1s ease, opacity .15s ease;

  &:hover { transform: translateY(-1px); }
  &:active { transform: translate(4px,4px); box-shadow: 0 0 0 var(--shadow); }

  @media (max-width: 520px) { padding: 10px 12px; }
`;

/* ===== Modal ===== */
export const ModalBackdrop = styled.div`
  position: fixed; inset: 0; z-index: 50;
  display: grid; place-items: center;
  background: ${({ theme }) => `${theme.colors.bg}CC`};
  backdrop-filter: blur(4px);
`;

export const Modal = styled.div`
  width: min(92vw, 420px);
  padding: 30px;
  border-radius: ${({ theme }) => theme.radii.card};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.gradient.slate};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

export const TopRow = styled.div`
  display: flex; flex-direction: column;
  gap: 8px; margin: 8px 0 6px; text-align: left;
`;

export const Small = styled.div`
  font-size: 12px; opacity: 0.9; color: ${({ theme }) => theme.colors.primary};
`;

/* ===== Flashcard ===== */
export const Card = styled.div<{ flipped: boolean; $topic?: Topic }>`
  perspective: 1000px;
  width: 100%;
  max-width: 420px;
  height: 280px;
  margin: 0 auto;
  cursor: pointer;
  position: relative;
  user-select: none;
  image-rendering: pixelated;
  &, * { box-sizing: border-box; }

  .inner {
    position: relative;
    inset: 0;
    width: 100%; height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    transform: rotateY(${p => (p.flipped ? 180 : 0)}deg);
    will-change: transform;
    transform-origin: center;
    border-radius: ${({ theme }) => theme.radii.card};
  }

  .face {
    backface-visibility: hidden;
    position: absolute; inset: 0;
    display: flex; justify-content: center; align-items: center;
    border-radius: ${({ theme }) => theme.radii.card};
    font-weight: 700; padding: 1rem;

    /* pixel border + glow using theme tokens */
    border: 2px solid ${({ theme }) => theme.colors.borderDark};
    box-shadow:
      ${({ theme }) => theme.textures.border8},
      0 12px 24px rgba(0,0,0,0.25);

    &::before, &::after {
      content: ''; position: absolute; inset: 0; pointer-events: none;
    }
    &::before {
      background-image: ${({ theme }) => theme.textures.scanlines};
      mix-blend-mode: multiply;
      inset: 6px;
      border-radius: calc(${({ theme }) => theme.radii.card} - 6px);
      box-shadow:
        inset 0 0 0 2px ${({ theme }) => `${theme.colors.border}AA`},
        inset 0 0 18px ${({ theme }) => `${theme.colors.border}66`};
    }
    &::after {
      background-image: ${({ theme }) => theme.textures.dither};
      opacity: .5;
    }
  }

  .front {
    ${({ $topic, theme }) => {
      const bg = $topic && (theme.topicGradients as any)[$topic]
        ? (theme.topicGradients as any)[$topic]
        : theme.gradient.slate;
      return css`
        background: ${bg};
        color: ${theme.colors.sakura};
      `;
    }}
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: clamp(1.6rem, 5vw, 2.6rem);
    text-align: center;
    letter-spacing: 0.02em;
    text-shadow: 0 2px 0 rgba(0,0,0,0.35);
    display: grid; place-items: center; padding: 1.25rem;
  }

  .back {
    ${({ theme }) => css`
      background: ${theme.gradient.green};
      color: ${theme.colors.onPrimary};
    `}
    transform: rotateY(180deg);
    flex-direction: column; gap: .5rem; text-align: center;
  }

  .kanji {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: clamp(1.4rem, 4.5vw, 2rem);
    line-height: 1.2;
  }
  .hiragana {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: clamp(1rem, 3vw, 1.25rem);
    color: ${({ theme }) => theme.colors.onAccent};
    opacity: 0.95;
  }
  .english {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: clamp(1rem, 3.2vw, 1.4rem);
    font-weight: 800;
    letter-spacing: 0.02em;
    color: ${({ theme }) => theme.colors.text};
  }

  @media (prefers-reduced-motion: reduce) {
    .inner { transition: transform 0.2s ease; }
  }
`;
