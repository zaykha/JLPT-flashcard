// theme.ts
import type { DefaultTheme } from 'styled-components';
import { type Topic } from '@/types/vocab';
const topicGradients: Record<Topic, string> = {
  'People & Family':              'linear-gradient(135deg,#1f2937,#374151)',
  'Places & Directions':          'linear-gradient(135deg,#6F7E4F,#8B6B3F)',
  'Food & Drink':                 'linear-gradient(135deg,#4338CA,#2563EB)',
  'Numbers, Time & Date':         'linear-gradient(135deg,#047857,#0EA5E9)',
  'Travel & Transport':           'linear-gradient(135deg,#B45309,#F59E0B)',
  'School & Study':               'linear-gradient(135deg,#0F766E,#0891B2)',
  'Work & Business':              'linear-gradient(135deg,#14532D,#166534)',
  'Emotions & Personality':       'linear-gradient(135deg,#7C3AED,#9333EA)',
  'Health & Body':                'linear-gradient(135deg,#0B1020,#263238)',
  'Counters & Quantifiers':       'linear-gradient(135deg,#065F46,#059669)',
  'Colors, Shapes & Measures':    'linear-gradient(135deg,#334155,#475569)',
  'Grammar Function Words':       'linear-gradient(135deg,#312e81,#1e3a8a)',
  'Greetings & Social':           'linear-gradient(135deg,#3f3f46,#52525b)',
  'Hobbies & Sports':             'linear-gradient(135deg,#2563eb,#06b6d4)',
  'Technology & Media':           'linear-gradient(135deg,#0ea5e9,#22d3ee)',
  'Weather & Nature':             'linear-gradient(135deg,#16a34a,#84cc16)',
  'Animals & Plants':             'linear-gradient(135deg,#65a30d,#a3e635)',
  'Science & Industry':           'linear-gradient(135deg,#1f2937,#0ea5e9)',
  'Shopping & Money':             'linear-gradient(135deg,#0f766e,#22c55e)',
  'Society & Politics':           'linear-gradient(135deg,#7c2d12,#b45309)',
  'Culture & Events':             'linear-gradient(135deg,#9333ea,#ef4444)',
  'Verbs of Motion & Position':   'linear-gradient(135deg,#059669,#22d3ee)',
  'Abstract & Academic':          'linear-gradient(135deg,#111827,#1F2937)'
};
export type TopicKey =
  | 'people' | 'places' | 'food' | 'time' | 'travel' | 'school'
  | 'work' | 'feelings' | 'body' | 'numbers' | 'Others';

  export const theme: DefaultTheme = {
    colors: {
      primary: "#8B6B3F",
      secondary: "#6F7E4F",
      text: "#161616",
      textMuted: "#6B7280",
      sheetBg: "#FFFFFF",
      border: "rgba(0,0,0,0.08)",
    },
    fonts: {
      heading: "'Press Start 2P', 'Noto Serif JP', serif",
      body: "'Press Start 2P', 'Noto Sans JP', system-ui, -apple-system, Arial, sans-serif",
    },
    radii: { pill: "999px", card: "24px" },
    radius: { sm:'8px', md:'12px', lg:'16px', xl:'20px', pill:'9999px' },
    shadow: { card: '0 10px 20px rgba(0,0,0,0.25)' },
    gradient: {
      emeraldCyan: 'linear-gradient(135deg, #10b981, #06b6d4)',
      slate: 'linear-gradient(145deg, #1f2937, #374151)',
      green: 'linear-gradient(145deg, #166534, #15803d)',
    },
    topicGradients,
    textures: {
      scanlines: `repeating-linear-gradient(
        to bottom,
        rgba(0,0,0,0.15) 0px,
        rgba(0,0,0,0.15) 1px,
        rgba(0,0,0,0) 2px,
        rgba(0,0,0,0) 4px
      )`,
      dither: `repeating-linear-gradient(
        45deg,
        rgba(255,255,255,0.06) 0 2px,
        rgba(0,0,0,0.06) 2px 4px
      )`,
      border8: '0 0 0 4px rgba(0,0,0,0.2), 0 0 0 8px rgba(255,255,255,0.06)',
    },
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
