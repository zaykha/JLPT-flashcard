import React from 'react';
import styled from 'styled-components';
import { useSession } from '@/store/session';

// 🧠 PIXEL STYLE SUMMARY PAGE
export const QuizSummaryPage: React.FC = () => {
  const { quiz, quizResults, setStage, resetQuiz } = useSession();
  const correct = quizResults.filter(r => r.correct).length;

  const ratio = Math.round((correct / Math.max(1, quiz.length)) * 100);

  return (
    <Screen>
      <PixelFrame>
        <Title>🧩 Lesson Summary</Title>
        <ScoreBox>
          <ScoreText>{correct} / {quiz.length}</ScoreText>
          <ScoreBar>
            <ScoreFill pct={ratio} />
          </ScoreBar>
          <Small>Accuracy: {ratio}%</Small>
        </ScoreBox>

        <List>
          {quiz.map((q) => {
            const r = quizResults.find(x => x.id === q.id);
            const ok = r?.correct;
            const your = r?.your ?? '—';
            const expected = r?.expected ?? '—';
            const prompt = q.type === 'matching' ? 'Matching' : (q as any).prompt;
            return (
              <Row key={q.id} data-correct={ok}>
                <Prompt>{prompt}</Prompt>
                {!ok && q.type !== 'matching' && (
                  <Result>
                    <span>❌ Your:</span> <b>{your}</b>
                    <span>✅ Correct:</span> <b>{expected}</b>
                  </Result>
                )}
                {ok && q.type !== 'matching' && <Result className="ok">✔ Correct</Result>}
              </Row>
            );
          })}
        </List>

        <Actions>
          <Button onClick={() => { resetQuiz(); setStage('studying'); }}>🔁 Review Again</Button>
        </Actions>
      </PixelFrame>
    </Screen>
  );
};

/* === STYLES === */

const Screen = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: url(/quizsummarybg.jpg) center/cover no-repeat fixed;


  @media (max-aspect-ratio: 4/3) {
    background: url('/assets/bg-summary-mobile.png') center/cover no-repeat fixed;
  }

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const PixelFrame = styled.div`
  max-width: 720px;
  width: 100%;
  background: rgba(15, 20, 30, 0.92);
  border: 4px solid #000;
  box-shadow: 0 0 0 2px #555, inset 0 0 0 2px #222;
  border-radius: 8px;
  padding: 24px;
  color: #f8fafc;
  font-family: 'Press Start 2P', 'Pixelify Sans', monospace;
  text-shadow: 1px 1px 0 #000;
  image-rendering: pixelated;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  font-size: 1rem;
  color: #ffe58f;
`;

const ScoreBox = styled.div`
  text-align: center;
  margin-bottom: 16px;
`;

const ScoreText = styled.div`
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: #fff;
`;

const ScoreBar = styled.div`
  background: #1e293b;
  border: 2px solid #000;
  border-radius: 4px;
  height: 12px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.6);
`;

const ScoreFill = styled.div<{ pct: number }>`
  height: 100%;
  width: ${({ pct }) => pct}%;
  background: linear-gradient(90deg, #4ade80, #16a34a);
  transition: width 0.3s ease-out;
`;

const Small = styled.small`
  display: block;
  color: #cbd5e1;
  margin-top: 4px;
`;

const List = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 20px;
`;

const Row = styled.div`
  padding: 10px 14px;
  border-radius: 6px;
  border: 2px solid #000;
  background: #0b1020;
  color: #f8fafc;
  box-shadow: 0 2px 0 #222;
  transition: transform 0.1s ease;
  &:active {
    transform: scale(0.98);
  }

  &[data-correct='true'] {
    border-color: #22c55e;
    background: #0f1a0f;
  }
  &[data-correct='false'] {
    border-color: #ef4444;
    background: #1a0f0f;
  }
`;

const Prompt = styled.strong`
  display: block;
  font-size: 0.85rem;
  margin-bottom: 4px;
`;

const Result = styled.small`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  line-height: 1.4;
  color: #fcd34d;
  &.ok {
    color: #4ade80;
  }
`;

const Actions = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: center;
`;

const Button = styled.button`
  font-family: 'Press Start 2P', 'Pixelify Sans', monospace;
  font-size: 0.7rem;
  letter-spacing: 1px;
  padding: 12px 18px;
  border: 3px solid #000;
  border-radius: 6px;
  background: linear-gradient(to bottom, #3b82f6, #1e40af);
  color: #fff;
  box-shadow: 0 3px 0 #000;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 #000;
  }
  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 0 #000;
  }
`;
