import 'styled-components';
// people
// places
// food
// time
// travel
// school
// work
// feelings
// body
// numbers
// Others
declare module 'styled-components' {
  export interface DefaultTheme {
      colors: {
    primary: string;   // brand gold-brown
    secondary: string;  // sage green
    text: string;
    textMuted: string;
    sheetBg: string;
    border: string;
    },
    fonts: {
      heading: string;
      body: string;
    },
    radii: {
      pill: string;
      card: string;
    },
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
    topicGradients: {
      people: string,           // ink-slate
      places: string,           // brand blend
      food:  string,           // indigo → blue
      time:  string,           // tealish
      travel: string,           // curry gold
      school: string,           // ocean jade
      work:  string,           // forest
      feelings: string,           // arcane violet
      body: string,           // steel/cyber
      numbers: string,           // clean green
      Others: string,           // charcoal
    };
    textures: {
      scanlines: string,
      dither: string,
      border8: string,
    },
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