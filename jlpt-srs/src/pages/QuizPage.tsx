// TODO: Quiz page
import React, { useMemo } from 'react';
import { useSession } from '@/store/session';
import { useTopics } from '@/store/topics';
import { useSRS } from '@/store/srs';
import type { Word, QuizQuestionModel } from '@/types/vocab';
import { Quiz } from '@/components/quiz/Quiz';

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}
function sample<T>(arr: T[], n: number): T[] {
  const a = shuffle(arr);
  return a.slice(0, Math.max(0, Math.min(n, a.length)));
}

export const QuizPage: React.FC = () => {
  const today = useSession(s => s.today);
  const setStage = useSession(s => s.setStage);

  const allWords = useTopics(s => s.allWords);

  const markCorrect = useSRS(s => s.markCorrect);
  const markWrong = useSRS(s => s.markWrong);

  const questions = useMemo<QuizQuestionModel[]>(() => {
    if (!today.length) return [];

    const pool = allWords.length ? allWords : today;
    const half = Math.floor(today.length / 2);

    const A = today.slice(0, half);          // EN2JP
    const B = today.slice(half);             // JP2EN

    const makeEN2JP = (w: Word): QuizQuestionModel => {
      // distractors: prefer same topic to be confusable, then fill any
      const sameTopic = pool.filter(x => x.topicKey === w.topicKey && x.id !== w.id);
      const others = pool.filter(x => x.topicKey !== w.topicKey);
      const picks = sample(sameTopic, 2).concat(sample(others, 1));
      const choices = shuffle([w, ...picks]).map(x => ({
        id: x.id, en: x.english, kanji: x.kanji, hiragana: x.hiragana
      }));
      return {
        id: `Q-${w.id}-EN2JP`,
        kind: 'EN2JP',
        promptEN: w.english,
        choices,
        correctId: w.id,
      };
    };

    const makeJP2EN = (w: Word): QuizQuestionModel => {
      const rest = pool.filter(x => x.id !== w.id);
      const picks = sample(rest, 3);
      const choices = shuffle([w, ...picks]).map(x => ({
        id: x.id, en: x.english, kanji: x.kanji, hiragana: x.hiragana
      }));
      return {
        id: `Q-${w.id}-JP2EN`,
        kind: 'JP2EN',
        promptJP: { kanji: w.kanji, hiragana: w.hiragana },
        choices,
        correctId: w.id,
      };
    };

    const qa = A.map(makeEN2JP);
    const qb = B.map(makeJP2EN);

    // If today has odd count, one pile will have +1 → still fine.
    return shuffle([...qa, ...qb]);
  }, [today, allWords]);

  function handleFinished(score: number, total: number) {
    // move to summary (or back to settings)
    setStage('summary');
    // you can stash score in a store if you want to show a summary page
    console.log('Quiz done:', score, '/', total);
  }

  function handleAnswer(ok: boolean, correctId: string) {
    if (ok) markCorrect(correctId);
    else markWrong(correctId); // schedules to tomorrow and keeps step
  }

  if (!today.length) return <div style={{padding:16}}>No quiz available. Start a session first.</div>;

  return (
    <div style={{padding:'1rem'}}>
      <Quiz questions={questions} onFinished={handleFinished} onAnswer={handleAnswer} />
    </div>
  );
};
