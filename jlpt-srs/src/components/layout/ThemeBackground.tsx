// components/ThemedBackground.tsx
import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useLocation } from 'react-router-dom';

const Bg = styled.div`
  position: fixed; inset: 0; z-index: 0;
  pointer-events: none;
  background-size: cover;
  background-position: center;
  /* A subtle overlay of scanlines/dither for retro vibe */
  &::after {
    content: '';
    position: absolute; inset: 0;
    background-image: ${({ theme }) => theme.textures.scanlines};
    opacity: 0.25;
  }
`;

export const ThemedBackground: React.FC = () => {
  const theme = useTheme();
  const { pathname } = useLocation();

  // Per-theme base
  const isDark = theme.colors.bg === '#0B1220';

  // Optional per-route override
  let routeBg: string;
  if (pathname === '/login') {
    // Keep the dramatic torii for login only
    routeBg = theme.gradient.torii;
  } else if (pathname === '/welcome' || pathname === '/wallet') {
    // No background for prerequisite and purchase pages
    routeBg = 'none';
  } else {
    routeBg = isDark
      ? `${theme.gradient.indigoNight}, ${theme.textures.crtMask}`
      : `${theme.textures.washi}, ${theme.textures.dither}`;
  }

  return <Bg style={{ backgroundImage: routeBg }} />;
};
