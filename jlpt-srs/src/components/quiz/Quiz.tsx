// TODO: Quiz root
import React, { useMemo, useState } from 'react';
import type { QuizQuestionModel } from '@/types/vocab';
import { QuizQuestion } from './QuizQuestion';

type Props = {
  questions: QuizQuestionModel[];
  onFinished: (score: number, total: number) => void;
  onAnswer: (isCorrect: boolean, correctId: string) => void; // hook SRS updates
};

export const Quiz: React.FC<Props> = ({ questions, onFinished, onAnswer }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);

  const q = questions[idx];

  function handleChoose(chosenId: string) {
    const ok = chosenId === q.correctId;
    onAnswer(ok, q.correctId);
    if (ok) setScore(s => s + 1);

    // small pause is handled inside QuizQuestion; we just advance
  }

  function next() {
    if (idx + 1 >= questions.length) {
      onFinished(score, questions.length);
    } else {
      setIdx(i => i + 1);
    }
  }

  if (!questions.length) return <div style={{padding:16}}>No quiz questions.</div>;

  return (
    <QuizQuestion
      key={q.id}
      question={q}
      index={idx}
      total={questions.length}
      onChoose={handleChoose}
      onNext={next}
    />
  );
};
