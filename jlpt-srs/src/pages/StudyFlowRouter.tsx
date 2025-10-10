import React from 'react';
import { useSession } from '@/store/session';
import { FlashcardsPage } from '@/pages/FlashcardsPage';
import { QuizPage } from '@/pages/QuizPage';
import { QuizSummaryPage } from '@/pages/QuizSummaryPage';

export const StudyFlowRouter: React.FC = () => {
  const stage = useSession(s => s.stage);

  switch (stage) {
    case 'studying':
      return <FlashcardsPage />;
    case 'quiz':
      return <QuizPage />;
    case 'summary':
      return <QuizSummaryPage />;
    case 'settings':
    default:
      return <FlashcardsPage />;
  }
};
