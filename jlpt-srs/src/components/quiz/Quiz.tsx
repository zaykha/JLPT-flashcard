import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Small, TopRow, ProgressWrap, ProgressFill, Actions, Btn, QuizScreen, QuestionArea, FixedSubmit } from '@/styles/Pages/QuizPage.styles';
import type { QuizItem, QuizResultItem } from '@/types/quiz';
import { QuizQuestion } from './QuizQuestion';
import { useCountdown } from '@/hooks/useCountdownV1';
import { gradeQuestion } from '@/helpers/quizGradeV1';

type Props = {
  question: QuizItem;
  perQuestionSec: number;
  quizIndex: number;
  quizLength: number;
  lessonNo?: number | null;
  quizAttempt: number;
  onSubmit: (payload: QuizResultItem) => void;
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
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false);

  // Precompute rights for matching once per question
  const computedInitialRights = useMemo(() => {
    if (question.type !== 'matching') return [];
    return question.pairs.map(p => ({ id: p.rightId, text: p.right }));
  }, [question]);

  const [rightsOrder, setRightsOrderState] = useState<{ id: string; text: string }[]>(computedInitialRights);

  // Per-question timer (prefer override on the item)
  const effectiveSec =
    (question as any).perQuestionSec != null
      ? Number((question as any).perQuestionSec)
      : perQuestionSec;

  // Track start time for this question
  const startTsRef = useRef<number>(performance.now());

  // Reset local UI state per question
  useEffect(() => {
    submittedRef.current = false;
    setSubmitted(false);
    setAnswer(null);
    setRightsOrderState(computedInitialRights);
    startTsRef.current = performance.now(); // reset start for the new question
  }, [question.id, computedInitialRights]);

  // Countdown (auto-submit upon timeout)
  const { timeLeft, pct } = useCountdown({
    seconds: effectiveSec,
    key: question.id,
    paused: submitted,
    onTimeout: () => handleSubmit(true),
  });

  const answeredCount = Math.max(0, quizIndex);
  const canSubmit = question.type === 'matching' ? true : !!answer;

  const handleSubmit = useCallback((fromTimeout = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);

    const { correct, your, expected } = gradeQuestion(question, answer, rightsOrder);

    const elapsedMs = performance.now() - startTsRef.current;
    const cappedMs  = Math.min(elapsedMs, Math.max(0, effectiveSec) * 1000);

    const payload = {
      id: question.id,
      correct,
      your,
      expected,
      fromTimeout,
      timeMs: fromTimeout
        ? Math.max(0, effectiveSec) * 1000
        : Math.max(1, Math.round(cappedMs)),
    };

    if (process.env.NODE_ENV !== 'production') {
      console.log('[Quiz] submit payload', payload, {
        questionId: question.id,
        type: question.type,
        effectiveSec,
        startTs: startTsRef.current,
        now: performance.now(),
        elapsedMs,
        cappedMs,
      });
    }

    onSubmit(payload);
  }, [answer, onSubmit, question, rightsOrder, effectiveSec]);


  return (
    <QuizScreen>

      <TopRow>
        <Small>Lesson: <b>{lessonNo ?? '-'}</b></Small>
        <Small>Attempt: <b>{quizAttempt}</b></Small>
        <Small>Progress: <b>{answeredCount}/{quizLength}</b></Small>
      </TopRow>

      {effectiveSec > 0 && (
        <ProgressWrap>
          <ProgressFill $pct={pct} />
        </ProgressWrap>
      )}
  
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
              typeof updater === 'function'
                ? (updater as (prev: { id: string; text: string }[]) => { id: string; text: string }[])(prev)
                : updater
            );
          }}
          disabled={submitted}
        />


       <FixedSubmit
        $variant="primary"
        onClick={() => handleSubmit(false)}
        disabled={!canSubmit || submitted}
        aria-label="Submit answer"
      >
        Submit
      </FixedSubmit>

    </QuizScreen>

  );
};
