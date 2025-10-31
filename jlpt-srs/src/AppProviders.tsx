// providers/AppProviders.tsx
import React, { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useThemeMode, bindThemeListeners } from '@/store/themeMode';
import { GlobalStyle } from '@/styles/global';
import { darkTheme, lightTheme } from './styles/theme';
import { WalletProvider } from '@/features/wallet/WalletProvider';
import { AppErrorBoundary } from './components/AppErrorBoundary';


export const AppProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { mode, resolved, _applySystem } = useThemeMode();
  const WALLET_ENABLED = import.meta.env.VITE_WALLET_ENABLED === 'true';

  // Create QueryClient once to avoid provider remounts on re-render
  const [queryClient] = React.useState(() => new QueryClient());
  useEffect(() => {
    _applySystem();
    bindThemeListeners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const theme = resolved === 'dark' ? darkTheme : lightTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <ThemeProvider theme={theme}>
          {WALLET_ENABLED ? (
            <WalletProvider>
              <GlobalStyle />
              {children}
            </WalletProvider>
          ) : (
            <>
              <GlobalStyle />
              {children}
            </>
          )}
        </ThemeProvider>
      </AppErrorBoundary>
    </QueryClientProvider>
  );
};
