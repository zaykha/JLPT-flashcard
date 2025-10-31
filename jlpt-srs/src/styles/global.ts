import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /* Reset-ish */
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; width: 100%; overflow-x: hidden; }
  img, svg, video, canvas { max-width: 100%; height: auto; }
  /* Let flex/grid items actually shrink */
  .shrink, .card, .panel { min-width: 0; max-width: 100%; }
  body {
    margin: 0;
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.bg};
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => (theme.components as any)?.home?.fontSize || '14px'};
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;

    /* THE BACKGROUND STACK (different feel per theme automatically via tokens) */
    /* Layer 1: subtle large gradient wash (different hues work for both modes) */
    background-image:
      ${({ theme }) => theme.gradient.emeraldCyan},
      ${({ theme }) => theme.textures.washi},
      ${({ theme }) => theme.textures.scanlines},
      ${({ theme }) => theme.textures.crtMask};

    /* Layer 1 is a gradient; layer 2/3 are textures */
    background-repeat: no-repeat, repeat, repeat, no-repeat;
    background-attachment: fixed, fixed, fixed, fixed;
    background-size: cover, auto, auto, cover;
    /* Slightly different blending works great across light/dark */
    background-blend-mode: overlay, multiply, normal, normal;
  }

  @media (max-width: 480px) {
    body { font-size: ${({ theme }) => (theme.components as any)?.home?.fontSizeMobile || '13px'}; }
  }

  /* Headings / mono font opt-in */
  h1,h2,h3,h4,h5,h6 { font-family: ${({ theme }) => theme.fonts.heading}; }
  code, pre, kbd { font-family: ${({ theme }) => theme.fonts.mono}; }

  /* Cards & panels default look (optional helpers) */
  .panel {
    background: ${({ theme }) => theme.colors.panel};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.card};
    box-shadow: ${({ theme }) => theme.shadow.card};
  }
`;
