import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
@font-face {
    font-family: 'gaijinshodo';
    src: url('./Gaijin\ Shodo.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  :root {
    --bg: #0f172a;
    --panel: #111827;
    --text: #e5e7eb;
    --muted: #94a3b8;
    --accent: #10b981;
    --accent-2: #06b6d4;
    --danger: #ef4444;
    --border: #263041;
    --card: #1f2937;
  }

  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: ${(p) => p.theme.fonts.body};
    color: ${(p) => p.theme.colors.text};
    background: #fff;
  }
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button { font: inherit; }
`
