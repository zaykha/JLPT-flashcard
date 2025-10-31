import React from 'react';
import { useSession } from '@/store/session';
import { FlashcardsPage } from '@/pages/FlashcardsPage';
import { QuizPage } from '@/pages/QuizPage';
import { QuizSummaryPage } from '@/pages/QuizSummaryPage';
import { GrammarStudyPage } from './GrammarStudyPage';
import { GrammarQuizPage } from './GrammarQuizPage';
import { GrammarQuizSummaryPage } from './GrammarQuizSummaryPage';
import { ExamFresherPage } from './ExamFresherPage';
import { ExamSummaryPage } from './ExamSummaryPage';

export const StudyFlowRouter: React.FC = () => {
  const stage = useSession(s => s.stage);

  switch (stage) {
    case 'studying':       return <FlashcardsPage />;
    case 'quiz':           return <QuizPage />;
    case 'summary':        return <QuizSummaryPage />;
    case 'grammar':        return <GrammarStudyPage />;
    case 'grammarQuiz':    return <GrammarQuizPage />;
    case 'grammarSummary': return <GrammarQuizSummaryPage />;
    case 'examFresher':    return <ExamFresherPage />;
    case 'examSummary':    return <ExamSummaryPage />;
    case 'srsFresher':  return <ExamFresherPage />;
    case 'srsExam':     return <QuizPage />;
    case 'srsSummary':  return <ExamSummaryPage  />;
    // no 'buy' page here — Home handles popup
    default:               return <FlashcardsPage />;
  }
};

// export const StudyFlowRouter: React.FC = () => {
//   const stage = useSession(s => s.stage);

//   switch (stage) {
//     case 'studying':
//       return <FlashcardsPage />;
//     case 'quiz':
//       return <QuizPage />;
//     case 'summary':
//       return <QuizSummaryPage />;
//     case 'grammar':
//       return <GrammarStudyPage />;
//     case 'grammarQuiz':
//       return <GrammarQuizPage />;
//     case 'grammarSummary':
//       return <GrammarQuizSummaryPage />;
//     case 'examFresher':
//       return <ExamFresherPage />;     // ✅ new
//     case 'examSummary':
//       return <ExamSummaryPage />;     // ✅ new
//     case 'buy':            
//       return <BuyTodayPage />; 
//     case 'settings':
//     default:
//       return <FlashcardsPage />;
//   }
// };
