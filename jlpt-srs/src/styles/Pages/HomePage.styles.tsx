// HomePage.styles.tsx
import styled from 'styled-components';
import type { PageBgKey } from '@/types/ui';

export const MainGrid = styled.div`
  display: grid;
  /* Let columns actually shrink: */
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: clamp(16px, 2.2vw, 24px);
  align-items: start;

  /* Prevent grid children from enforcing min-content width */
  & > * { min-width: 0; }

  @media (max-width: 1024px) {
    grid-template-columns: minmax(0, 1fr);
    font-size:0.8rem;
  }
`;

export const LeftColumn = styled.div`
  display: grid;
  gap: clamp(12px, 1.8vw, 20px);
  /* Critical: allow content to shrink inside grids/flex */
  min-width: 0;
`;

export const RightColumn = styled.div`
  /* Use grid so children stretch to full column width by default */
  display: grid;
  justify-items: stretch;
  align-items: start;
  width: 100%;
  min-width: 0; /* prevents intrinsic overflow */

  @media (max-width: 1024px) {
    width: 100%;
  }
`;

/**
 * Screen: full-page background, theme-driven
 */
export const Screen = styled.section<{ $page?: PageBgKey }>`
  /* Viewport height handling */
  min-height: 100vh;
  @supports (height: 100dvh) { min-height: 100dvh; }

  /* Kill horizontal scroll at the root of this page */
  overflow-x: hidden;

  /* Fluid + safe-area padding */
  padding: clamp(8px, 2vw, 16px);
  padding-left: calc(env(safe-area-inset-left, 0px) + clamp(8px, 2vw, 16px));
  padding-right: calc(env(safe-area-inset-right, 0px) + clamp(8px, 2vw, 16px));
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + clamp(6px, 1.8vw, 12px));

  display: grid;
  place-items: center;
  position: relative;

  // background-color: ${({ theme }) => theme.colors.bg};
  background-image:
    ${({ theme, $page: page }) => `url('${theme.backgrounds[page || 'HomePage']}')`},
    ${({ theme }) => theme.textures.dither},
    radial-gradient(1200px 600px at 20% -10%, ${({
      theme,
    }) => `${theme.colors.secondary}55`}, transparent 60%),
    radial-gradient(900px 500px at 120% 110%, ${({
      theme,
    }) => `${theme.colors.gold}40`}, transparent 65%);
  background-repeat: no-repeat, repeat, no-repeat, no-repeat;
  background-size: cover, auto, auto, auto;
  background-position: center, center, center, center;

  @media (max-width: 1024px) {
    background-image:
      ${({ theme, $page: page }) => `url('${theme.backgrounds[page || 'HomePage']}')`},
      ${({ theme }) => theme.textures.dither},
      radial-gradient(800px 420px at 15% -10%, ${({
        theme,
      }) => `${theme.colors.secondary}55`}, transparent 62%),
      radial-gradient(680px 380px at 115% 108%, ${({
        theme,
      }) => `${theme.colors.gold}3D`}, transparent 68%);
       font-size:0.8rem;
  }

  @media (max-width: 480px) {
    background-image:
      ${({ theme, $page: page }) => `url('${theme.backgrounds[page || 'HomePage']}')`},
      ${({ theme }) => theme.textures.dither},
      radial-gradient(560px 320px at 10% -12%, ${({
        theme,
      }) => `${theme.colors.secondary}4D`}, transparent 64%),
      radial-gradient(520px 300px at 110% 106%, ${({
        theme,
      }) => `${theme.colors.gold}33`}, transparent 70%);
  }
`;

/** Tile overlay uses theme text color with very low alpha so it adapts to light/dark */
export const TileOverlay = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.12;
  pointer-events: none;
  background-image:
    linear-gradient(to right, ${({ theme }) => `${theme.colors.text}0D`} 1px, transparent 1px),
    linear-gradient(to bottom, ${({ theme }) => `${theme.colors.text}0D`} 1px, transparent 1px);
  background-size: 24px 24px;

  @media (max-width: 480px) {
    background-size: 20px 20px;
    opacity: 0.1;
  }
`;

/** Main card: theme panel color w/ translucency + theme border/shadow */
export const Main = styled.main`
  position: relative;
  width: 100%;
  max-width: 1080px;

  display: flex;
  flex-direction: column;
  gap: clamp(16px, 2.2vw, 28px);
  padding: clamp(16px, 2.6vw, 24px);
  border-radius: clamp(16px, 2.2vw, 24px);

  border: 2px solid ${({ theme }) => theme.colors.borderDark};
  background: ${({ theme }) => `${theme.colors.panel}CC`};
  box-shadow: ${({ theme }) => theme.shadow.card};
  backdrop-filter: blur(9px);

  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => (theme.components as any)?.home?.fontSize || '12px'};

  /* Keep inner flex children from overflowing */
  min-width: 0;

  @media (max-width: 480px) {
    font-size: ${({ theme }) => (theme.components as any)?.home?.fontSizeMobile || '11px'};
    border-width: 1px;
    padding: 20px 10px;
    border:none;
    // background: white;
    backdrop-filter: blur(9px);
    box-shadow: none;

  }

  @media (prefers-reduced-motion: reduce) {
    backdrop-filter: none;
    box-shadow: none;
  }
`;
