import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import type { QuizItem } from '@/store/session';
import { QuizQuestion } from './QuizQuestion';

type QuizSubmitPayload = {
  id: string;
  correct: boolean;
  your: string;
  expected: string;
  fromTimeout: boolean;
};

type Props = {
  question: QuizItem;
  perQuestionSec: number;
  quizIndex: number;
  quizLength: number;
  lessonNo: number | null;
  quizAttempt: number;
  onSubmit: (payload: QuizSubmitPayload) => void;
};

export const Quiz: React.FC<Props> = ({
  question,
  perQuestionSec,
  quizIndex,
  quizLength,
  lessonNo,
  quizAttempt,
  onSubmit,
}) => {
  const [answer, setAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(perQuestionSec);
  const [submitted, setSubmitted] = useState(false);

  const computedInitialRights = useMemo(() => {
    if (question.type !== 'matching') return [];
    return question.pairs.map(p => ({ id: p.rightId, text: p.right }));
  }, [question]);

  const [rightsOrder, setRightsOrderState] = useState<{ id: string; text: string }[]>(computedInitialRights);

  const answeredCount = Math.max(0, quizIndex);
  const submittedRef = useRef(false);

  const handleSubmit = useCallback((fromTimeout = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);

    let correct = false;
    let your = '';
    let expected = '';

    if (question.type === 'matching') {
      correct =
        rightsOrder.length === question.pairs.length &&
        rightsOrder.every((r, idx) => r.id === question.pairs[idx].sourceId);
      your = rightsOrder.map(r => r.text).join(' | ');
      expected = question.pairs.map(p => p.right).join(' | ');
    } else {
      const qWithChoices = question as Extract<QuizItem, { type: 'mcq' | 'kanjiToHiragana' | 'hiraganaToKanji' }>;
      correct = answer === qWithChoices.correct;
      your = answer ?? '';
      expected = qWithChoices.correct ?? '';
    }

    onSubmit({
      id: question.id,
      correct,
      your,
      expected,
      fromTimeout,
    });
  }, [answer, onSubmit, question, rightsOrder]);

  const latestSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    latestSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    submittedRef.current = false;
    setSubmitted(false);
    setAnswer(null);
    setRightsOrderState(computedInitialRights);
    setTimeLeft(perQuestionSec);
  }, [question.id, perQuestionSec, computedInitialRights]);

  useEffect(() => {
    if (perQuestionSec <= 0) return;

    setTimeLeft(perQuestionSec);
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          latestSubmitRef.current(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [question.id, perQuestionSec]);

  const canSubmit = question.type === 'matching' ? true : !!answer;
  const pct = perQuestionSec > 0 ? (timeLeft / perQuestionSec) * 100 : 0;

  return (
    <div>
      <TopRow>
        <Small>Lesson: <b>{lessonNo ?? '-'}</b></Small>
        <Small>Attempt: <b>{quizAttempt}</b></Small>
        <Small>Progress: <b>{answeredCount}/{quizLength}</b></Small>
      </TopRow>

      <ProgressWrap>
        <ProgressFill $pct={pct} />
      </ProgressWrap>

      <QuizQuestion
        question={question}
        answer={answer}
        onAnswer={value => {
          if (submitted) return;
          setAnswer(value);
        }}
        rightsOrder={rightsOrder}
        setRightsOrder={updater => {
          if (submitted) return;
          setRightsOrderState(prev =>
            typeof updater === 'function' ? (updater as (prev: { id: string; text: string }[]) => { id: string; text: string }[])(prev) : updater
          );
        }}
        disabled={submitted}
      />

      <Actions>
        <Btn
          variant="secondary"
          onClick={() => handleSubmit(false)}
          disabled={!canSubmit || submitted}
        >
          Submit
        </Btn>
      </Actions>
    </div>
  );
};

const TopRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
  text-align: left;
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Small = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;

const ProgressWrap = styled.div`
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 999px;
  margin-bottom: 16px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => Math.max(0, Math.min(100, $pct))}%;
  background: linear-gradient(90deg, #22c55e, #3b82f6);
  transition: width 1s linear;
`;

const Actions = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
`;

const Btn = styled.button<{ variant?: 'primary' | 'secondary' | 'ghost' }>`
  --shadow: #000;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid #000;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(12px, 3.2vw, 13px);
  text-transform: uppercase;
  letter-spacing: .04em;
  cursor: pointer;
  color: #fff;

  background: ${({ variant, theme }) =>
    variant === 'secondary' ? theme.colors.secondary :
    variant === 'ghost' ? '#1f2937' : theme.colors.primary};

  box-shadow: 4px 4px 0 var(--shadow);
  transition: transform .1s ease, box-shadow .1s ease, opacity .15s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 var(--shadow);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 520px) {
    padding: 10px 12px;
  }
`;

export type { QuizSubmitPayload };
