import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useThemeMode } from '@/store/themeMode';

/* ==== Animations ==== */
const rollRight = keyframes`
  from { transform: translateX(2px) rotate(0deg); }
  to   { transform: translateX(28px) rotate(360deg); }
`;
const rollLeft = keyframes`
  from { transform: translateX(28px) rotate(0deg); }
  to   { transform: translateX(2px) rotate(-360deg); }
`;

/* ==== Track (pixel/retro) ==== */
const Track = styled.button<{ $dark: boolean }>`
  --h: 32px; --w: 60px;
  width: var(--w);
  height: var(--h);
  padding: 0;
  border: 0;
  cursor: pointer;
  position: relative;
  border-radius: 999px;

  /* Pixel-ish stacked borders */
  box-shadow:
    0 0 0 2px ${({ theme }) => theme.colors.pixelBorder},
    0 0 0 6px rgba(0,0,0,0.2);

  /* Retro plastic track using theme colors */
  background:
    ${({ $dark: dark, theme }) =>
      dark
        ? `linear-gradient(180deg, ${theme.colors.panel}, ${theme.colors.sheetBg})`
        : `linear-gradient(180deg, ${theme.colors.onPrimary ?? theme.colors.panel}, ${theme.colors.panel})`};

  /* tiny CRT/washi texture if you like */
  overflow: hidden;
  isolation: isolate;
  filter: ${({ theme }) => theme.textures.pixelShadow};

  display: inline-flex;
  align-items: center;

  transition: background 200ms ease;
  outline: none;
  user-select: none;

  /* keyboard focus */
  &:focus-visible {
    box-shadow:
      0 0 0 2px ${({ theme }) => theme.colors.accent},
      0 0 0 6px ${({ theme }) => theme.colors.borderDark};
  }
`;

/* Sun & Moon glyphs (pure SVG, themed) */
const Icon = styled.span<{ $side: 'left' | 'right'; $active: boolean }>`
  position: absolute;
  top: 50%;
  ${({ $side: side }) => (side === 'left' ? 'left: 8px;' : 'right: 8px;')}
  transform: translateY(-50%);
  width: 14px; height: 14px;
  opacity: ${({ $active: active }) => (active ? 1 : 0.55)};
  transition: opacity 180ms ease;
  pointer-events: none;

  svg { display: block; width: 100%; height: 100%; }
`;

/* Knob with roll animation */
const Knob = styled.div<{ $dark: boolean; $justToggled: 'left' | 'right' | null }>`
  --size: 26px;
  position: relative;
  width: var(--size);
  height: var(--size);
  border-radius: 999px;
  z-index: 1;

  /* knob colors invert between modes for contrast */
  background: ${({ $dark: dark, theme }) => (dark ? theme.colors.text : theme.colors.bg)};
  box-shadow:
    inset 0 0 0 2px ${({ theme }) => theme.colors.pixelBorder},
    0 3px 6px rgba(0,0,0,0.35);
  filter: ${({ theme }) => theme.textures.pixelShadow};

  /* position */
  transform: ${({ $dark: dark }) => (dark ? 'translateX(28px)' : 'translateX(2px)')};
  transition: transform 260ms cubic-bezier(.25,.8,.25,1);

  /* rolling flourish only when toggled, respects prefers-reduced-motion */
  @media (prefers-reduced-motion: no-preference) {
    animation: ${({ $justToggled: justToggled }) =>
      justToggled === 'right'
        ? rollRight
        : justToggled === 'left'
        ? rollLeft
        : 'none'} 420ms ease;
  }
`;

export const ThemeToggle: React.FC = () => {
  const { resolved, setMode } = useThemeMode();
  const isDark = resolved === 'dark';

  // Tiny state just to know the last direction (for the roll animation)
  const [pulse, setPulse] = React.useState<'left' | 'right' | null>(null);

  const toggle = () => {
    const nextIsDark = !isDark;
    setPulse(nextIsDark ? 'right' : 'left');
    setMode(nextIsDark ? 'dark' : 'light');

    // clear the pulse after animation ends
    window.setTimeout(() => setPulse(null), 500);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
    if (e.key === 'ArrowLeft' && isDark) toggle();
    if (e.key === 'ArrowRight' && !isDark) toggle();
  };

  return (
    <Track
      $dark={isDark}
      onClick={toggle}
      onKeyDown={onKey}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      title={isDark ? 'Dark mode' : 'Light mode'}
    >
      {/* Sun (left) */}
      <Icon $side="left" $active={!isDark}>
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <circle cx="12" cy="12" r="4" stroke="white" />
          <g strokeLinecap="round">
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
          </g>
        </svg>
      </Icon>

      {/* Moon (right) */}
      <Icon $side="right" $active={isDark}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3
               7 7 0 0 0 21 12.79z"
            fill="currentColor"
          />
        </svg>
      </Icon>

      <Knob $dark={isDark} $justToggled={pulse} />
    </Track>
  );
};
