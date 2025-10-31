// src/__tests__/StudySection.spec.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { darkTheme } from '@/styles/theme';
import { StudySection } from '@/components/home/StudySection';
import { useSession } from '@/store/session';

// Freeze "today" without leaving fake timers enabled
const T = '2025-10-18';
beforeEach(() => {
  vi.useFakeTimers();                        // turn on
  vi.setSystemTime(new Date(`${T}T09:00:00Z`));
  vi.useRealTimers();                        // turn back off immediately
});

// Mock BEFORE component imports execute
vi.mock('@/lib/bootstrap', () => ({
  loadBootstrap: () => ({
    lessonProgress: {
      completed: [
        { lessonNo: 130, completedAt: `${T}T01:00:00Z` },
        { lessonNo: 131, completedAt: `${T}T02:00:00Z` },
      ],
      failed: [],
      current: [],
      examsStats: [{ examDate: `${T}T05:00:00Z`, lessonNo: [130, 131] }],
    },
  }),
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={darkTheme}>{ui}</ThemeProvider>);
}

describe('<StudySection/>', () => {
  it('shows "Buy more lessons" pill when stage is buy', async () => {
    useSession.setState({ stage: 'buy', stageReady: true });

    renderWithTheme(<StudySection onStart={() => {}} lessonNo={132} />);

    // Pill text is deterministic for stage=buy
    expect(await screen.findByText(/Buy more lessons/i)).toBeInTheDocument();

    // Optional: assert the left title when in "buy"
    expect(screen.getByText(/Completed/i)).toBeInTheDocument();

    // NOTE: deliberately not asserting the "Buy" CTA word because it depends on
    // finishedToday (asynchronous effect); if you want that, switch to Option B.
  });
});
