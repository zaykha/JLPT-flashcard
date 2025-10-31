// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { AppProviders } from './AppProviders';

// Optional: silence console if explicitly requested (set localStorage 'koza.silent'='1')
try {
  const silent = ((): boolean => {
    try { return localStorage.getItem('koza.silent') === '1'; } catch { return false; }
  })();
  if (silent) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.log = () => {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    console.warn = () => {};
  }
} catch {}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
