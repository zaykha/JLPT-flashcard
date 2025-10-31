// store/themeMode.ts
import { create } from 'zustand';

type Mode = 'light' | 'dark' | 'system';
type State = {
  mode: Mode;                 // user choice
  resolved: 'light' | 'dark'; // what we actually apply
  setMode: (m: Mode) => void;
  _applySystem: () => void;
};

const getSystem = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const useThemeMode = create<State>((set, get) => ({
  mode: (localStorage.getItem('theme.mode') as Mode) || 'system',
  resolved: 'light',
  setMode: (m) => {
    localStorage.setItem('theme.mode', m);
    const resolved = m === 'system' ? getSystem() : m;
    set({ mode: m, resolved });
    document.documentElement.dataset.theme = resolved; // handy for non-styled CSS too
  },
  _applySystem: () => {
    const { mode } = get();
    const resolved = mode === 'system' ? getSystem() : mode;
    set({ resolved });
    document.documentElement.dataset.theme = resolved;
  },
}));

// Call this once at startup to bind mql listener
export const bindThemeListeners = () => {
  const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (!mql) return;
  const onChange = () => useThemeMode.getState()._applySystem();
  mql.addEventListener?.('change', onChange);
};
