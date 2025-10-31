import React, { useCallback, useMemo } from 'react';
import { PixelFrame, Title, ScoreBox, ScoreText, ScoreBar, ScoreFill, Small, List, Prompt, Result, Actions, Btn, ResultNote } from '@/styles/Pages/QuizSummaryPage.styles';
import { hasPrompt } from '@/helpers/shared';
import { ResultFX } from '@/components/animated/ResultFX';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/store/session';
import { Row, Screen } from '@/styles/Pages/GrammarQuizSummaryPage.styles';

// prompt guard moved to helpers/shared

export const GrammarQuizSummaryPage: React.FC = () => {
  const nav = useNavigate();

  const grammarQuizResults = useSession(s => s.grammarQuizResults);
  const grammarQuiz        = useSession(s => s.grammarQuiz);
  const setStage           = useSession(s => s.setStage);
  const resetGrammarQuiz   = useSession(s => s.resetGrammarQuiz);
  const recordGrammarDone  = useSession(s => s.recordGrammarAttemptAndMaybeComplete);
  const grammarToday       = useSession(s => s.grammarToday);
  const startGrammarStudy  = useSession(s => s.startGrammarStudy);
  const startGrammarQuiz   = useSession(s => s.startGrammarQuiz);

  const total       = grammarQuiz.length;
  const correctCount= grammarQuizResults.filter(r => r.correct).length;
  const pct         = total ? Math.round((correctCount / total) * 100) : 0;
  const perfect     = pct === 100;

  const avgSec = perfect
    ? Math.round(
        (grammarQuizResults.reduce((s, r) => s + (r.timeMs ?? 0), 0) / Math.max(1, grammarQuizResults.length)) / 100
      ) / 10
    : null;

  const rows = useMemo(() => {
    return grammarQuizResults.map((r, i) => {
      const q = grammarQuiz.find(q => q.id === r.id);
      const prompt = q && hasPrompt(q) ? q.prompt : (q?.type === 'matching' ? 'Matching' : '');
      return {
        id: r.id,
        idx: i + 1,
        correct: r.correct,
        your: r.your || '-',
        expected: r.expected || '-',
        prompt,
        timeSec: r.timeMs != null ? Math.round(r.timeMs / 100) / 10 : null,
      };
    });
  }, [grammarQuizResults, grammarQuiz]);

  const handleRetry = useCallback(async () => {
    resetGrammarQuiz();
    if (!grammarToday.length) await startGrammarStudy();
    startGrammarQuiz();
  }, [resetGrammarQuiz, grammarToday.length, startGrammarStudy, startGrammarQuiz]);

  const handleNextLesson = useCallback(async () => {
    const durationSec =
      Math.round((grammarQuizResults.reduce((s, r) => s + (r.timeMs ?? 0), 0) / 1000)) || Math.max(1, total * 2);
    await recordGrammarDone({ durationSec });
    nav('/');
  }, [recordGrammarDone, nav, total, grammarQuizResults]);

  return (
    <Screen>
      <PixelFrame>
        <ResultFX perfect={perfect} density={18} />
        <Title>Grammar Quiz Summary</Title>

        <ScoreBox>
          <ScoreText><strong>{correctCount}</strong> / {total}</ScoreText>
          <ScoreBar><ScoreFill $pct={pct} /></ScoreBar>
          <Small>Accuracy: {pct}%{perfect && avgSec !== null ? ` · Avg time: ${avgSec}s` : ''}</Small>
          <ResultNote $perfect={perfect}>
            {perfect
              ? '🎉 Congrats! You have successfully passed the quiz.'
              : '⚠️ Please score 100% to move forward.'}
          </ResultNote>
        </ScoreBox>

        <List>
          {rows.map(r => (
            <Row key={r.id} $correct={r.correct}>
              <Prompt>Q{r.idx}: {r.prompt}</Prompt>
              <Result className={r.correct ? 'ok' : ''}>
                {r.correct ? '✔ Correct' : (
                  <>
                    <span>❌ Your:</span> <b>{r.your}</b>{' '}
                    <span>✅ Correct:</span> <b>{r.expected}</b>
                  </>
                )}
              </Result>
              {perfect && r.timeSec != null && <Small style={{opacity:0.8}}>⏱ {r.timeSec}s</Small>}
            </Row>
          ))}
        </List>

        <Actions>
          {perfect ? (
            <Btn onClick={handleNextLesson}>Next Lesson</Btn>
          ) : (
            <>
              <Btn $variant="secondary" onClick={() => setStage('grammar')}>Back to Study</Btn>
              <Btn $variant="primary" onClick={handleRetry}>Retry Quiz</Btn>
            </>
          )}
        </Actions>
      </PixelFrame>
    </Screen>
  );
};

/* styles moved to styles/Pages/GrammarQuizSummaryPage.styles.tsx */
