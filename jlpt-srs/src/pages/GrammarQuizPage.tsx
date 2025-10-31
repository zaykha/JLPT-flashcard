// src/pages/grammar/GrammarQuizPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { QuizCard, Header, Buttons, Btn, LoaderCard, LoaderBar, LoaderFill, LoaderText, LoaderMeta, ScreenGQ } from '@/styles/Pages/GrammarQuizPage.styles';
import { useSession } from '@/store/session';
import { Quiz  } from '@/components/quiz/Quiz';
import type { QuizResultItem } from '@/types/quiz';

export const GrammarQuizPage: React.FC = () => {
  // pick only what you need to minimize re-renders
  const grammarQuiz         = useSession(s => s.grammarQuiz);
  const grammarQuizIndex    = useSession(s => s.grammarQuizIndex);
  const setGrammarQuizIndex = useSession(s => s.setGrammarQuizIndex);
  const pushGrammarQuizResult = useSession(s => s.pushGrammarQuizResult);
  const quizConfig          = useSession(s => s.quizConfig);
  const lessonNo            = useSession(s => s.lessonNo);
  const quizAttempt         = useSession(s => s.quizAttempt);
  const setStage            = useSession(s => s.setStage);
  const grammarToday     = useSession(s => s.grammarToday);
  const startGrammarQuiz = useSession(s => s.startGrammarQuiz);
  const hasQuiz = (grammarQuiz?.length ?? 0) > 0;
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 300); // short, snappy splash
    return () => clearTimeout(t);
  }, []);
    useEffect(() => {
    if (!booting && !hasQuiz && grammarToday.length) {
      startGrammarQuiz(); // rebuild items + set stage
    }
  }, [booting, hasQuiz, grammarToday.length, startGrammarQuiz]);

  const question = useMemo(
    () => (hasQuiz ? grammarQuiz[grammarQuizIndex] : undefined),
    [hasQuiz, grammarQuiz, grammarQuizIndex]
  );

  // If index slipped past the end somehow, go to summary after boot
  useEffect(() => {
    if (!booting && hasQuiz && !question) {
      setStage('grammarSummary');
    }
  }, [booting, hasQuiz, question, setStage]);

  const nextOrSummary = useCallback(() => {
    if (grammarQuizIndex + 1 >= grammarQuiz.length) {
      setStage('grammarSummary'); // go to summary
      return;
    }
    setGrammarQuizIndex(grammarQuizIndex + 1);
  }, [grammarQuizIndex, grammarQuiz.length, setGrammarQuizIndex, setStage]);

  const handleSubmit = useCallback(
    (payload: QuizResultItem) => {
      // Defer store updates to avoid parent/child render clashes
      setTimeout(() => {
        pushGrammarQuizResult(payload);
        setTimeout(nextOrSummary, payload.fromTimeout ? 200 : 300);
      }, 0);
    },
    [nextOrSummary, pushGrammarQuizResult]
  );

  return (
    <ScreenGQ>
      <QuizCard>
        <Header>Grammar Quiz</Header>

        {booting && (
          <LoaderCard>
            <LoaderBar><LoaderFill /></LoaderBar>
            <LoaderText>Preparing grammar quiz…</LoaderText>
            <LoaderMeta>
              <div>Lesson: <b>{lessonNo ?? '-'}</b></div>
              <div>Attempt: <b>{quizAttempt}</b></div>
            </LoaderMeta>
          </LoaderCard>
        )}

        {!booting && !hasQuiz && (
          <>
            <p>No grammar questions available.</p>
            <Buttons>
              <Btn onClick={() => setStage('grammar')}>Back to Study</Btn>
            </Buttons>
          </>
        )}

        {!booting && hasQuiz && question && (
          <Quiz
            key={question.id}                          // remount per question to reset timers
            question={question}
            perQuestionSec={quizConfig.perQuestionSec}  // 20s (set in store for grammar)
            quizIndex={grammarQuizIndex}
            quizLength={grammarQuiz.length}
            lessonNo={lessonNo}
            quizAttempt={quizAttempt}
            onSubmit={handleSubmit}
          />
        )}
      </QuizCard>
    </ScreenGQ>
  );
};


/* styles moved to styles/Pages/GrammarQuizPage.styles.tsx */
