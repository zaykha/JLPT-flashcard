import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { darkTheme } from '@/styles/theme'; // or lightTheme if you prefer

type Options = RenderOptions & { theme?: typeof darkTheme };

export function renderWithTheme(
  ui: React.ReactElement,
  { theme = darkTheme, ...options }: Options = {}
) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>, options);
}
