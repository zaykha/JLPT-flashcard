import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSession } from '@/store/session';
import { Quiz, type QuizSubmitPayload } from '@/components/quiz/Quiz';

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
  } = useSession();

  const question = quiz[quizIndex];

  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const nextOrSummary = useCallback(() => {
    if (quizIndex + 1 >= quiz.length) {
      void markLessonCompleted();
      setStage('summary');
    } else setQuizIndex(quizIndex + 1);
  }, [quizIndex, quiz.length, setQuizIndex, setStage, markLessonCompleted]);

  const handleSubmit = useCallback((payload: QuizSubmitPayload) => {
    pushQuizResult({
      id: payload.id,
      correct: payload.correct,
      your: payload.your,
      expected: payload.expected,
    });

    setTimeout(nextOrSummary, payload.fromTimeout ? 300 : 400);
  }, [nextOrSummary, pushQuizResult]);

  if (!question) {
    setStage('summary');
    return null;
  }

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

const Screen = styled.div`
  min-height: 100vh;
  background: url('/homepagebg2.jpg') center/cover no-repeat fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
`;

const QuizCard = styled.div`
  position: relative;
  background: #8B6B3F;
  border-radius: ${({ theme }) => theme.radii.card};
  padding: 18px;
  width: 100%;
  max-width: 520px;
  color: #fff;
  text-align: center;
  border: 2px solid rgba(0,0,0,0.25);
  box-shadow: ${({ theme }) => theme.shadow.card};
  backdrop-filter: blur(6px);
  box-shadow:
    ${({ theme }) => theme.textures.border8},
    0 12px 24px rgba(0,0,0,0.25);

  &::after,
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &::before {
    background-image: ${({ theme }) => theme.textures.scanlines};
    mix-blend-mode: multiply;
    inset: 6px;
    border-radius: calc(${({ theme }) => theme.radii.card} - 6px);
    pointer-events: none;
    box-shadow:
      inset 0 0 0 2px rgba(255,255,255,0.08),
      inset 0 0 18px rgba(255,255,255,0.06);
  }

  &::after {
    background-image: ${({ theme }) => theme.textures.dither};
    opacity: 0.5;
  }

  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const LoaderCard = styled.div`
  background: rgba(0,0,0,0.65);
  border-radius: 16px;
  padding: 22px;
  width: 100%;
  max-width: 420px;
  color: #fff;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
`;

const LoaderBar = styled.div`
  height: 10px;
  background: rgba(255,255,255,0.2);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const LoaderFill = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #22c55e);
  animation: load 3s linear forwards;
  @keyframes load {
    from { width: 0%; }
    to { width: 100%; }
  }
`;

const LoaderText = styled.div`
  margin-bottom: 8px;
  font-weight: 600;
`;

const LoaderMeta = styled.div`
  opacity: 0.9;
  font-size: 13px;
  display: grid;
  gap: 4px;
`;
