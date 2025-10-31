import React from 'react';
import { useSession } from '@/store/session';
import { Screen, PixelFrame, Title, ScoreBox, ScoreText, ScoreBar, ScoreFill, Small,
  List, Row, Prompt, Result, Actions, Btn, 
  ResultNote} from '@/styles/Pages/QuizSummaryPage.styles';
import { calcAvgSec } from '@/helpers/quizTiming';
import { ResultFX } from '@/components/animated/ResultFX';


// 🧠 QUIZ SUMMARY PAGE
export const QuizSummaryPage: React.FC = () => {
  const quiz        = useSession(s => s.quiz);
  const quizResults = useSession(s => s.quizResults);
  const setStage    = useSession(s => s.setStage);
  const resetQuiz   = useSession(s => s.resetQuiz);
  const buildQuiz   = useSession(s => s.buildQuiz);
  const recordAdvance = useSession(s => s.recordVocabAttemptAndMaybeAdvance);
  const setQuizIndex = useSession(s => s.setQuizIndex);

  const correct = quizResults.filter(r => r.correct).length;
  const isPerfect = quiz.length > 0 && correct === quiz.length;
  const ratio = Math.round((correct / Math.max(1, quiz.length)) * 100);

  // Average time (only display if perfect)
  const avgSec = calcAvgSec(quizResults, true); // null unless perfect
  if (process.env.NODE_ENV !== 'production') {
    console.log('[QuizSummary] quiz length', quiz.length);
    console.log('[QuizSummary] results length', quizResults.length);
    console.log('[QuizSummary] results (ids,timeMs)', quizResults.map(r => ({ id: r.id, timeMs: r.timeMs, correct: r.correct })));
  }

  return (
    <Screen>
      <PixelFrame>
        <ResultFX perfect={isPerfect} density={18} />
        <Title>🧩 Lesson Summary</Title>
        <ScoreBox>
          <ScoreText>{correct} / {quiz.length}</ScoreText>
          <ScoreBar><ScoreFill $pct={ratio} /></ScoreBar>
          <Small>Accuracy: {ratio}%{isPerfect && avgSec !== null ? ` · Avg time: ${avgSec}s` : ''}</Small>
          <ResultNote $perfect={isPerfect}>
            {isPerfect
              ? '🎉 Congrats! You have successfully passed the quiz.'
              : '⚠️ Please score 100% to move forward.'}
          </ResultNote>
        </ScoreBox>

        <List>
          {quiz.map((q, i) => {
            const r = quizResults.find(x => x.id === q.id);
            const ok = r?.correct;
            const your = r?.your ?? '—';
            const expected = r?.expected ?? '—';
            const prompt = q.type === 'matching' ? 'Matching' : (q as any).prompt;

            const timeSec = r?.timeMs != null ? Math.round(r.timeMs / 100) / 10 : null; // 1 decimal
            const showTime = isPerfect && timeSec != null;

            return (
              <Row key={q.id} data-correct={ok}>
                <Prompt>{prompt}</Prompt>
                {!ok && q.type !== 'matching' && (
                  <Result>
                    <span>❌ Your:</span> <b>{your}</b>{' '}
                    <span>✅ Correct:</span> <b>{expected}</b>
                  </Result>
                )}
                {ok && q.type !== 'matching' && <Result className="ok">✔ Correct</Result>}
                {showTime && <Small style={{opacity:0.8}}>⏱ {timeSec}s</Small>}
              </Row>
            );
          })}
        </List>

        <Actions>
          {isPerfect ? (
            <Btn
              onClick={async () => {
                // Use actual measured total if you want, else keep your heuristic
                const durationSec =
                  Math.round((quizResults.reduce((s, r) => s + (r.timeMs ?? 0), 0) / 1000)) || Math.max(1, quiz.length * 2);
                await recordAdvance({ durationSec });
              }}
            >
              Start Grammar Study →
            </Btn>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <Btn
                $variant="primary"
                onClick={() => {
                  resetQuiz();
                  setQuizIndex(0);
                  buildQuiz();
                  setStage('quiz');
                }}
              >
                Retake  →
              </Btn>
              <Btn
                $variant="secondary"
                onClick={() => {
                  setStage('studying');
                  resetQuiz();
                }}
              >
                Review 📚
              </Btn>
            </div>
          )}
        </Actions>
      </PixelFrame>
    </Screen>
  );
};

