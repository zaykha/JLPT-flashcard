// src/styles/styled.d.ts
import 'styled-components';
import type { Topic } from '@/types/vocab';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      text: string;
      textMuted: string;
      sheetBg: string;
      border: string;
    };
    fonts: {
      heading: string;
      body: string;
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
    };
    gradient: {
      emeraldCyan: string;
      slate: string;
      green: string;
    };

    // ✅ canonical topics map → gradient string
    topicGradients: Record<Topic, string>;

    textures: {
      scanlines: string;
      dither: string;
      border8: string;
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
  }
}
