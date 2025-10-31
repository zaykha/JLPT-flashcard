import React, { useCallback, useEffect, useState } from 'react';
import { useSession } from '@/store/session';
import { Quiz } from '@/components/quiz/Quiz';
import { LoaderBar, LoaderCard, LoaderFill, LoaderMeta, LoaderText, QuizCard, Screen } from '@/styles/Pages/QuizPage.styles';
import type { QuizResultItem } from '@/types/quiz';

export const QuizPage: React.FC = () => {
  const {
    quiz,
    quizIndex,
    setQuizIndex,
    pushQuizResult,
    setStage,
    quizConfig,
    lessonNo,
    quizAttempt,
    markLessonCompleted,
    recordLocalAttempt,
    lessonPhase,
    finishSrsExamAndPromote,
  } = useSession();

  const question = quiz[quizIndex];
  const quizMode = useSession(s => s.quizMode); 
  // Keep splash brief to avoid perceived jank; 300ms is enough for layout settle
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 300);
    return () => clearTimeout(t);
  }, []);

  const nextOrSummary = useCallback(() => {
    if (quizIndex + 1 >= quiz.length) {
      void recordLocalAttempt({ durationSec: Math.max(1, quiz.length * 2) });
      if (quizMode === 'exam') {
        setStage('examSummary');
      } else if (quizMode === 'srs') {
        // Promote and route to ExamSummaryPage via 'srsSummary'
        void finishSrsExamAndPromote();
      } else {
        setStage('summary');
      }
    } else {
      setQuizIndex(quizIndex + 1);
    }
  }, [quizIndex, quiz.length, setQuizIndex, setStage, markLessonCompleted, recordLocalAttempt, lessonPhase, finishSrsExamAndPromote, quizMode]);

  const handleSubmit = useCallback((payload: QuizResultItem) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[QuizPage] handleSubmit received', payload);
    }

    // Defer store update to next tick to avoid render clashes
    setTimeout(() => {
      // ✅ pass through as-is so timeMs/fromTimeout are preserved
      pushQuizResult(payload);

      // tiny delay before moving on (slightly longer when timeout auto-submits)
      setTimeout(nextOrSummary, payload.fromTimeout ? 200 : 300);
    }, 0);
  }, [pushQuizResult, nextOrSummary]);


  // If no question (e.g., after last), route to summary in an effect
  useEffect(() => {
    if (!question) {
      if (quizMode === 'exam') setStage('examSummary');
      else if (quizMode === 'srs') void finishSrsExamAndPromote();
      else setStage('summary');
    }
  }, [question, setStage, quizMode, finishSrsExamAndPromote]);

  if (!question) return null;

  if (booting) {
    return (
      <Screen>
        <LoaderCard>
          <LoaderBar><LoaderFill /></LoaderBar>
          <LoaderText>Loading quiz…</LoaderText>
          <LoaderMeta>
            <div>Lesson: <b>{lessonNo ?? '-'}</b></div>
            <div>Attempt: <b>{quizAttempt}</b></div>
          </LoaderMeta>
        </LoaderCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <QuizCard>
        <Quiz
          key={question.id}
          question={question}
          perQuestionSec={quizConfig.perQuestionSec}
          quizIndex={quizIndex}
          quizLength={quiz.length}
          lessonNo={lessonNo}
          quizAttempt={quizAttempt}
          onSubmit={handleSubmit}
        />
      </QuizCard>
    </Screen>
  );
};
