import 'styled-components';
import type { Topic } from '@/types/topics'; // adjust if your Topic type lives elsewhere

declare module 'styled-components' {
  export interface DefaultTheme {
    fonts: {
      heading: string;
      body: string;
      mono: string;
    };
    radii: {
      pill: string;
      card: string;
    };
    radius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      pill: string;
    };
    shadow: {
      card: string;
      insetCrisp?: string;
    };
    gradient: {
      emeraldCyan: string;
      slate: string;
      green: string;
      torii: string;
      indigoNight: string;
    };
    topicGradients: Record<string, string>;
    textures: {
      scanlines: string;
      dither: string;
      border8: string;
      crtMask: string;
      washi: string;
      pixelShadow: string;
    };
    /** Use readonly to match `as const` tuple in theme.ts */
    space: readonly number[];
    z: Record<string, number>;

    colors: {
      primary: string;
      secondary: string;
      accent: string;
      sakura: string;
      indigo: string;
      gold: string;
      bg: string;
      panel: string;
      sheetBg: string;
      text: string;
      textMuted: string;
      onPrimary: string;
      onAccent: string;
      success: string;
      warning: string;
      danger: string;
      border: string;
      borderDark: string;
      pixelBorder: string;
    };

    color: {
      text: string;
      muted: string;
      border: string;
      card: string;
      panel: string;
      accent: string;
      danger: string;
    };

    components: {
      button: Record<string, { bg: string; fg: string; hover?: string; active?: string; hoverBg?: string }>;
      tag: Record<string, { bg: string; fg: string }>;
      card: { bg: string; border: string; headerBg: string; paperImage: string };
      progress: { track: string; fill: string };
      quiz: { correct: string; incorrect: string; timer: string; highlight: string };
      modal: {
        backdrop: string,
        frameImage: string,
        frameSlice: number,
        frameWidth: number,
        innerBg: string,
        shadow: string,
      },
    };

    backgrounds: {
      LoginPage: string;
      HomePage: string;
      FlashcardsPage: string;
      GrammarStudyPage: string;
      QuizPage: string;
      GrammarQuizPage: string;
      QuizSummaryPage: string;
      GrammarQuizSummaryPage: string;
      SummaryPage: string;
      SettingsPage: string;
      OnboardingPage: string;
      StudyFlowRouter: string;
    };
  }
}

