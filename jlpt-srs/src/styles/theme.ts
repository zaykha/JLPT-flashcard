// theme.ts
import type { DefaultTheme } from 'styled-components';

export type TopicKey =
  | 'people' | 'places' | 'food' | 'time' | 'travel' | 'school'
  | 'work' | 'feelings' | 'body' | 'numbers' | 'Others';

export const theme: DefaultTheme = {
  colors: {
    primary: "#8B6B3F",    // brand gold-brown
    secondary: "#6F7E4F",  // sage green
    text: "#161616",
    textMuted: "#6B7280",
    sheetBg: "#FFFFFF",
    border: "rgba(0,0,0,0.08)",
  },
  fonts: {
    heading: "'Press Start 2P', 'Noto Serif JP', serif",
    body: "'Press Start 2P', 'Noto Sans JP', system-ui, -apple-system, Arial, sans-serif",
  },
  radii: {
    pill: "999px",
    card: "24px",
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    pill: '9999px',
  },
  shadow: {
    card: '0 10px 20px rgba(0,0,0,0.25)',
  },
  gradient: {
    emeraldCyan: 'linear-gradient(135deg, #10b981, #06b6d4)',
    slate: 'linear-gradient(145deg, #1f2937, #374151)',
    green: 'linear-gradient(145deg, #166534, #15803d)',
  },

  // NEW: topic palettes (retro-2D vibe). Tune as you like.
  topicGradients: {
    people:    'linear-gradient(135deg, #1f2937, #374151)',           // ink-slate
    places:    'linear-gradient(135deg, #6F7E4F, #8B6B3F)',           // brand blend
    food:  'linear-gradient(135deg, #4338CA, #2563EB)',           // indigo → blue
    time:  'linear-gradient(135deg, #047857, #0EA5E9)',           // tealish
    travel:     'linear-gradient(135deg, #B45309, #F59E0B)',           // curry gold
    school:   'linear-gradient(135deg, #0F766E, #0891B2)',           // ocean jade
    work:   'linear-gradient(135deg, #14532D, #166534)',           // forest
    feelings:     'linear-gradient(135deg, #7C3AED, #9333EA)',           // arcane violet
    body:     'linear-gradient(135deg, #0B1020, #263238)',           // steel/cyber
    numbers:  'linear-gradient(135deg, #065F46, #059669)',           // clean green
    Others: 'linear-gradient(135deg, #111827, #1F2937)',           // charcoal
  },

  // NEW: pixel textures (scanlines + dithering layered)
  textures: {
    // subtle scanlines overlay
    scanlines: `repeating-linear-gradient(
      to bottom,
      rgba(0,0,0,0.15) 0px,
      rgba(0,0,0,0.15) 1px,
      rgba(0,0,0,0) 2px,
      rgba(0,0,0,0) 4px
    )`,
    // checker dithering overlay
    dither: `repeating-linear-gradient(
      45deg,
      rgba(255,255,255,0.06) 0 2px,
      rgba(0,0,0,0.06) 2px 4px
    )`,
    // pixel edge stroke
    border8: '0 0 0 4px rgba(0,0,0,0.2), 0 0 0 8px rgba(255,255,255,0.06)',
  },

  // keep existing color object if you use CSS vars somewhere
  color: {
    text: 'var(--text)',
    muted: 'var(--muted)',
    border: 'var(--border)',
    card: 'var(--card)',
    panel: 'var(--panel)',
    accent: 'var(--accent)',
    danger: 'var(--danger)',
  },
};
