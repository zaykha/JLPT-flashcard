import styled, { css, keyframes } from 'styled-components';

/* ===== Screen (theme background, Vite-safe) ===== */
export const Screen = styled.section`
  position: relative;
  /* Use dynamic viewport units for mobiles; fall back to 100vh */
  min-height: 100vh;
  @supports (height: 100dvh) { min-height: 100dvh; }
  @supports (height: 100svh) { min-height: 100svh; }

  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Fluid + safe-area padding */
  padding: clamp(12px, 2.4vw, 24px);
  padding-left: calc(env(safe-area-inset-left, 0px) + clamp(12px, 2.4vw, 24px));
  padding-right: calc(env(safe-area-inset-right, 0px) + clamp(12px, 2.4vw, 24px));
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + clamp(8px, 2vw, 16px));

  background-color: ${({ theme }) => theme.colors.bg};
  background-image:
    ${({ theme }) => `url('${theme.backgrounds.QuizSummaryPage}')`},
    ${({ theme }) => theme.textures.dither},
    radial-gradient(1000px 500px at 15% -5%, ${({ theme }) => `${theme.colors.secondary}40`}, transparent 60%),
    radial-gradient(800px 420px at 120% 110%, ${({ theme }) => `${theme.colors.gold}30`}, transparent 70%);
  background-repeat: no-repeat, repeat, no-repeat, no-repeat;
  background-size: cover, auto, auto, auto;
  background-position: center, center, center, center;

  /* Fixed backgrounds cause oversized pages on iOS; disable on narrow viewports */
  background-attachment: fixed;
  @media (max-width: 768px) {
    background-attachment: scroll;
  }

  /* Use mobile art on tall/narrow screens */
  @media (max-aspect-ratio: 4/3) {
    background-image:
      ${({ theme }) => `url('${(theme.backgrounds as any).QuizSummaryPageMobile ?? theme.backgrounds.QuizSummaryPage}')`},
      ${({ theme }) => theme.textures.dither};
  }
`;

/* ===== Frame (fixed height, inner scrolling list) ===== */
export const PixelFrame = styled.div`
  width: 100%;
  max-width: 720px;

  /* Let the frame size against the *visible* viewport; clamp for stability */
  /* block-size == height in writing-mode:horizontal */
  max-block-size: clamp(520px, 95dvh, 760px);
  @supports not (height: 100dvh) {
    /* fallback if dvh/svh unsupported */
    max-block-size: min(84vh, 760px);
  }

  display: grid;
  /* Make the list row actually shrink/scroll */
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  gap: 16px;

  background: ${({ theme }) => `${theme.colors.panel}EB`};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;

  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  box-shadow:
    0 0 0 2px ${({ theme }) => theme.colors.borderDark},
    inset 0 0 0 2px ${({ theme }) => theme.colors.border},
    ${({ theme }) => theme.shadow.card};

  padding: clamp(14px, 3vw, 24px);
  font-family: ${({ theme }) => theme.fonts.heading};
  text-shadow: 1px 1px 0 rgba(0,0,0,0.6);
  image-rendering: pixelated;

  position: relative;
  overflow: hidden; /* keep CRT overlays clipped */

  &::before, &::after {
    content: '';
    position: absolute; inset: 0; pointer-events: none;
  }
  &::before {
    background-image: ${({ theme }) => theme.textures.scanlines};
    mix-blend-mode: multiply;
    inset: 6px;
    border-radius: 4px;
    box-shadow:
      inset 0 0 0 2px ${({ theme }) => `${theme.colors.border}AA`},
      inset 0 0 18px ${({ theme }) => `${theme.colors.border}66`};
  }
  &::after { background-image: ${({ theme }) => theme.textures.dither}; opacity: .4; }
`;

export const List = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 4px;

  /* This is the key for inner scrolling in a CSS grid */
  min-height: 0;
  overflow: auto;

  padding-right: 4px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar { width: 10px; }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => `${theme.colors.borderDark}`};
    border-radius: 8px;
    border: 2px solid ${({ theme }) => theme.colors.panel};
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => `${theme.colors.panel}`};
    border-radius: 8px;
  }
`;


export const Title = styled.h2`
  margin: 0;
  text-align: center;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.gold};
`;

export const ScoreBox = styled.div`
  text-align: center;
  margin-bottom: 4px;
`;

export const ScoreText = styled.div`
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

export const ScoreBar = styled.div`
  background: ${({ theme }) => theme.colors.panel};
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  border-radius: 6px;
  height: 12px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.35);
`;

export const ScoreFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => Math.max(0, Math.min(100, $pct))}%;
  background:
    ${({ theme }) => theme.components.progress.fill};
  transition: width 0.3s ease-out;
`;

export const Small = styled.small`
  display: block;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 4px;
`;

export const Row = styled.div`
  padding: 10px 14px;
  border-radius: 6px;
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  background: ${({ theme }) => theme.colors.sheetBg};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: 0 2px 0 ${({ theme }) => theme.colors.borderDark};
  transition: transform 0.1s ease;

  &:active { transform: scale(0.98); }

  &[data-correct='true'] {
    border-color: ${({ theme }) => theme.components.quiz.correct};
    background: ${({ theme }) => `${theme.components.quiz.correct}15`};
  }
  &[data-correct='false'] {
    border-color: ${({ theme }) => theme.components.quiz.incorrect};
    background: ${({ theme }) => `${theme.components.quiz.incorrect}15`};
  }
`;

export const Prompt = styled.strong`
  display: block;
  font-size: 0.85rem;
  margin-bottom: 4px;
  color:white;
  @media (max-width: 520px) {
  font-size: 0.65rem;
  }
`;

export const Result = styled.small`
  display: flex; flex-wrap: wrap; gap: 4px;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.gold};
  &.ok { color: ${({ theme }) => theme.components.quiz.correct}; }
`;

/* ===== Buttons / Actions ===== */
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

  color: ${({ theme, $variant }) =>
    $variant === 'ghost' ? theme.colors.text : theme.colors.onPrimary};

  background: ${({ $variant, theme }) =>
    $variant === 'secondary' ? theme.colors.secondary :
    $variant === 'ghost' ? theme.colors.panel :
    theme.colors.primary};

  box-shadow: 4px 4px 0 var(--shadow);
  transition: transform .1s ease, box-shadow .1s ease, opacity .15s ease;

  &:hover { transform: translateY(-1px); }
  &:active { transform: translate(4px,4px); box-shadow: 0 0 0 var(--shadow); }

  @media (max-width: 520px) { padding: 10px 12px; }
`;

export const Actions = styled.div`
  margin-top: 4px;
  display: flex; justify-content: center; gap: 12px;
`;

const popIn = keyframes`
  0% { transform: scale(.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;
const wiggle = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  50% { transform: translateX(2px); }
  75% { transform: translateX(-1px); }
  100% { transform: translateX(0); }
`;

export const ResultNote = styled.small<{ $perfect?: boolean }>`
  display: block;
  margin-top: 10px;
  font-size: clamp(0.75rem, 1.8vw, 0.85rem);
  font-family: ${({ theme }) => theme.fonts.heading};
  letter-spacing: 0.03em;
  text-align: center;

  ${({ $perfect, theme }) =>
    $perfect
      ? css`
          color: ${theme.components.quiz.correct ?? '#16a34a'};
          text-shadow: 0 1px 0 rgba(0, 0, 0, 0.5);
          animation: ${popIn} 280ms ease-out both;
        `
      : css`
          color: ${theme.components.quiz.incorrect ?? '#ef4444'};
          opacity: 0.9;
          animation: ${wiggle} 320ms ease-out 150ms 1;
        `}

  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
  }
`;
