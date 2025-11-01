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

const commonBase = {
  fonts: {
    heading: "'Press Start 2P', 'Noto Serif JP', serif",
    body: "'Press Start 2P', 'Noto Sans JP', system-ui, -apple-system, Arial, sans-serif",
    mono: "'VT323', ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  radii: { pill: '999px', card: '16px' },
  radius: { sm: '6px', md: '10px', lg: '14px', xl: '18px', pill: '9999px' },
  shadow: {
    card: '0 6px 16px rgba(15,23,42,0.18)',
    insetCrisp: 'inset 0 0 0 1px rgba(15,23,42,0.18)',
  },
  gradient: {
    emeraldCyan: 'linear-gradient(135deg, #10b981, #06b6d4)',
    slate: 'linear-gradient(145deg, #1f2937, #374151)',
    green: 'linear-gradient(145deg, #166534, #15803d)',
    torii: 'linear-gradient(135deg, #D44D2D, #8B1E1E)',
    indigoNight: 'linear-gradient(135deg, #0F172A, #1A2A4A)',
  },
  topicGradients,
  textures: {
    scanlines: `repeating-linear-gradient(
      to bottom,
      rgba(15,23,42,0.12) 0px,
      rgba(15,23,42,0.12) 1px,
      rgba(15,23,42,0) 2px,
      rgba(15,23,42,0) 4px
    )`,
    dither: `repeating-linear-gradient(
      45deg,
      rgba(248,244,233,0.06) 0 2px,
      rgba(15,23,42,0.06) 2px 4px
    )`,
    border8: '0 0 0 4px rgba(15,23,42,0.2), 0 0 0 8px rgba(248,244,233,0.06)',
    crtMask: `radial-gradient(circle at 50% 50%, rgba(15,23,42,0) 0, rgba(15,23,42,0.05) 70%, rgba(15,23,42,0.15) 100%)`,
    washi: `url('/assets/textures/washi-fibers.png')`,
    pixelShadow: `drop-shadow(0 1px 0 #0F172A33) drop-shadow(0 2px 0 #0F172A22)`,
  },
  space: [0,4,8,12,16,20,24,32,40,48],
  z: { header: 10, modal: 1000, tooltip: 1100 },
} as const;

// 🕊️ LIGHT THEME
export const lightTheme: DefaultTheme = {
  ...commonBase,
  colors: {
    primary:  '#8B6B3F',
    secondary:'#6F7E4F',
    accent:   '#D44D2D',
    sakura:   '#F2B6C1',
    indigo:   '#1A2A4A',
    gold:     '#C8A646',
    bg:       '#F7F3E8',
    panel:    '#F9F5EC',
    sheetBg:  '#F9F5EC',
    text:     '#161616',
    textMuted:'#6B7280',
    onPrimary:'#F9F5EC',
    onAccent: '#FFF7F5',
    success:  '#2E7D32',
    warning:  '#B26A00',
    danger:   '#C0352B',
    border:    'rgba(15,23,42,0.12)',
    borderDark:'rgba(15,23,42,0.32)',
    pixelBorder:'#0F172A',
  },
  color: {
    text:   '#161616',
    muted:  '#6B7280',
    border: 'rgba(15,23,42,0.12)',
    card:   '#F9F5EC',
    panel:  '#F9F5EC',
    accent: '#D44D2D',
    danger: '#C0352B',
  },
  components: {
    button: {
      primary:   { bg: '#8B6B3F', fg: '#F9F5EC', hover: '#7B5E38', active: '#6E5331' },
      secondary: { bg: '#6F7E4F', fg: '#F9F5EC', hover: '#627045', active: '#55633C' },
      accent:    { bg: '#D44D2D', fg: '#FFF7F5', hover: '#C04124', active: '#A6361D' },
      ghost:     { bg: 'transparent', fg: '#1A2A4A', hoverBg: 'rgba(26,42,74,0.06)' },
    },
    tag: {
      sakura: { bg: '#FCE7EF', fg: '#9C3B60' },
      indigo: { bg: '#E6ECF7', fg: '#1A2A4A' },
      gold:   { bg: '#FBF6E6', fg: '#8B6B3F' },
    },
    card: {
      bg: '#F9F5EC',
      border: '1px solid rgba(15,23,42,0.12)',
      headerBg: '#F9FAFB',
      paperImage: '/ui/card-paper-light.png',
    },
    progress: {
      track: '#E5E7EB',
      fill:  'linear-gradient(90deg, #F2B6C1, #F6E8C8)',
    },
    quiz: {
      correct: '#2E7D32',
      incorrect: '#C0352B',
      timer: '#1A2A4A',
      highlight: '#F2B6C1',
    },
    modal: {
      backdrop: 'rgba(15,23,42,0.55)',
      // put this parchment in /public/assets/ui/parchment-frame.png (or your path)
      frameImage: '/ui/parchment-frame.png',
      frameSlice: 120,  // adjust to your image
      frameWidth: 36,   // visual border thickness
      innerBg: '#F6E8C8',
      shadow: '0 14px 36px rgba(15,23,42,.45)',
    }
  },
  backgrounds: {
    LoginPage: "/LightTheme/LTLoginPage.jpg",
    HomePage: "/LightTheme/LTHomePageZenGarden.jpg",
    FlashcardsPage: "/LightTheme/LTVocabFC1.jpg",
    GrammarStudyPage: "/LightTheme/LTVocabFC1.jpg",
    QuizPage: "/LightTheme/LTVocabQuizPage.jpg",
    GrammarQuizPage: "/LightTheme/LTGrammarQuiz.png",
    QuizSummaryPage: "/LightTheme/LTQuizSummary.jpg",
    GrammarQuizSummaryPage: "/LightTheme/LTQuizSummary.jpg",
    SummaryPage: "/assets/bg/golden_scroll_ceremony_light.png",
    SettingsPage: "/assets/bg/settings_paper_light.png",
    OnboardingPage: "/assets/bg/onboarding_edo_light.png",
    StudyFlowRouter: "/assets/bg/study_flow_light.png",
  }
};

// 🌙 DARK THEME
export const darkTheme: DefaultTheme = {
  ...commonBase,
  colors: {
    primary:  '#8B6B3F',
    secondary:'#6F7E4F',
    accent:   '#E25A3A',
    sakura:   '#F2B6C1',
    indigo:   '#A9B9D9',
    gold:     '#D4BA5B',
    bg:       '#0B1220',
    panel:    '#111827',
    sheetBg:  '#0F172A',
    text:     '#F3F4F6',
    textMuted:'#9CA3AF',
    onPrimary:'#1C1C1C',
    onAccent: '#1C0E0B',
    success:  '#4CAF50',
    warning:  '#D79A22',
    danger:   '#F0523D',
    border:    'rgba(248,244,233,0.12)',
    borderDark:'rgba(248,244,233,0.24)',
    pixelBorder:'#93A0BC',
  },
  color: {
    text:   '#F3F4F6',
    muted:  '#9CA3AF',
    border: 'rgba(248,244,233,0.12)',
    card:   '#111827',
    panel:  '#111827',
    accent: '#E25A3A',
    danger: '#F0523D',
  },
  shadow: {
    card: '0 8px 20px rgba(15,23,42,0.5)',
    insetCrisp: 'inset 0 0 0 1px rgba(248,244,233,0.08)',
  },
  components: {
    button: {
      primary:   { bg: '#8B6B3F', fg: '#1C1C1C', hover: '#A38254', active: '#6E5331' },
      secondary: { bg: '#6F7E4F', fg: '#0E0E0E', hover: '#829458', active: '#55633C' },
      accent:    { bg: '#E25A3A', fg: '#130503', hover: '#C84124', active: '#A8381F' },
      ghost:     { bg: 'transparent', fg: '#E5E7EB', hoverBg: 'rgba(248,244,233,0.06)' },
    },
    tag: {
      sakura: { bg: '#3A2530', fg: '#F2B6C1' },
      indigo: { bg: '#1C2842', fg: '#A9B9D9' },
      gold:   { bg: '#2E2615', fg: '#D4BA5B' },
    },
    card: {
      bg: '#111827',
      border: '1px solid rgba(248,244,233,0.08)',
      headerBg: '#0F172A',
      paperImage: '/ui/card-paper-dark.png',
    },
    progress: {
      track: '#1F2937',
      fill:  'linear-gradient(90deg, #22c55e, #3b82f6)',
    },
    quiz: {
      correct: '#4CAF50',
      incorrect: '#F0523D',
      timer: '#D4BA5B',
      highlight: '#2B1C2A',
    },
    modal: {
      backdrop: 'rgba(15,23,42,0.65)',
      // Use dark parchment frame in dark theme
      frameImage: '/ui/parchment-frame-Dark.png',
      frameSlice: 120,
      frameWidth: 36,
      innerBg: '#EBDDBB',
      shadow: '0 16px 40px rgba(15,23,42,.6)',
    }
  },
  backgrounds: {
    LoginPage: "/DarkTheme/DTLoginPage.png",
    HomePage: "/DarkTheme/DTHomePage2.png",
    FlashcardsPage: "/DarkTheme/DTFlashCard.png",
    GrammarStudyPage: "/DarkTheme/DTFlashCard.png",
    QuizPage: "/DarkTheme/DTQuizPage.png",
    GrammarQuizPage: "/DarkTheme/DTGrammarQuiz.png",
    QuizSummaryPage: "/DarkTheme/DTQuizSummary.png",
    GrammarQuizSummaryPage: "/DarkTheme/DTQuizSummary.png",
    SummaryPage: "/assets/bg/golden_scroll_ceremony_dark.png",
    SettingsPage: "/assets/bg/settings_paper_dark.png",
    OnboardingPage: "/assets/bg/onboarding_edo_dark.png",
    StudyFlowRouter: "/assets/bg/study_flow_dark.png",
  }
};

export type AppTheme = typeof darkTheme;
