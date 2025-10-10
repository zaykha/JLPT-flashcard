import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSession } from '@/store/session';
import { Flashcard } from '@/components/flashcards/Flashcard';
import { SpeechButton } from '@/components/flashcards/SpeechButton';
import { useNavigate } from 'react-router-dom';
import { TodayPeek } from '@/components/dev/TodayPeek';

const Screen = styled.div`
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 24px 12px;
  background:
    url(/kozaloginmobile.png) center/cover no-repeat,
    radial-gradient(1200px 600px at 20% -10%, rgba(111,126,79,.35), transparent 60%),
    radial-gradient(900px 500px at 120% 110%, rgba(139,107,63,.25), transparent 65%),
    #0b0f14;
  position: relative;
  overflow: hidden;
`;

const TileOverlay = styled.div`
  position: absolute; inset: 0;
  opacity: .14;
  background-image: linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
`;

export const Panel = styled.section`
  width: min(860px, 100%);
  // background: linear-gradient(145deg, #1f2937, #374151, 0.6);
  
  border: 2px solid #000;
  border-radius: 16px;
  box-shadow: 0 2px 0 #000, 0 8px 0 rgba(0,0,0,.35), ${({ theme }) => theme.shadow.card};
  padding: 16px;
  position: relative;
  /* From https://css.glass */
  background: rgba(255, 255, 255, 0.23);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(6.3px);
  -webkit-backdrop-filter: blur(6.3px);
  border: 1px solid rgba(255, 255, 255, 0.67);
`;

const Header = styled.div`
  // display: flex; 
  // justify-content: 
  // space-between; 
  // align-items: center;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin: 8px 0 6px;
  padding: 4px 6px 12px;
  border-bottom: 2px dashed ${({ theme }) => theme.colors.border};
`;

const Title = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  // color:${({ theme }) => theme.colors.primary};
  color:#fff;
  font-size: clamp(14px, 3.6vw, 18px);
  letter-spacing: .5px;
  text-align: center;
  // background: linear-gradient(to right, #1f2937, rgba(55, 65, 81, 0));
  // padding: 20px;
  // border-radius: 10px;
  // backdrop-filter: blur(6.3px);
  // -webkit-backdrop-filter: blur(6.3px);
`;

const Body = styled.div`
  display: grid;
  gap: 12px;
  padding-top: 12px;
`;

/** ====== Card Stage ====== */
const Stage = styled.div`
  display: grid;
  gap: 10px;
  justify-items: center;
`;

/** ====== HUD / Progress ====== */
const Hud = styled.div`
  display: grid;
  gap: 8px;
  justify-items: center;
`;

const Counter = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(12px, 3.2vw, 13px);
  color: ${({ theme }) => theme.colors.text};
`;

const BarWrap = styled.div`
  width: min(420px, 90%);
  height: 12px;
  border: 2px solid #000;
  border-radius: 10px;
  background: #f3f4f6;
  overflow: hidden;
`;

const BarFill = styled.div<{ pct:number }>`
  width: ${({ pct }) => `${pct}%`};
  height: 100%;
  background: ${({ theme }) => theme.gradient.green};
  transition: width 200ms ease;
`;

/** ====== Controls ====== */
const Controls = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 10px;
  @media (max-width: 520px) {
    grid-auto-flow: row;
    grid-template-columns: 1fr 1fr;
  }
`;

const Btn = styled.button<{variant?: 'primary'|'secondary'|'ghost'}>`
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

  &:hover { transform: translateY(-1px); }
  &:active { transform: translate(4px,4px); box-shadow: 0 0 0 var(--shadow); }

  @media (max-width: 520px) {
    padding: 10px 12px;
  }
`;
const ModalBackdrop = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.8);
  display: grid; place-items: center; z-index: 50;
`;
const Modal = styled.div`
background:  linear-gradient(135deg,#1f2937,#374151);
  color: #fff; 
  border-radius: 16px;
  padding: 30px; 
  width: min(92vw, 420px); box-shadow: 0 20px 60px rgba(0,0,0,0.5);
`;
const TopRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 8px 0 6px;
  text-align: left;
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;
const Small = styled.div` font-size: 12px; opacity: 0.9; `;
/** ====== Component ====== */
export const FlashcardsPage: React.FC = () => {
  const today = useSession(s => s.today);
  const index = useSession(s => s.index);
  const next = useSession(s => s.next);
  const prev = useSession(s => s.prev);
  const setStage = useSession(s => s.setStage);
  const lessonNo = useSession(s => s.lessonNo);
  const quizAttempt = useSession(s => s.quizAttempt);
  const buildTodayFixed = useSession(s => s.buildTodayFixed);
  const nav = useNavigate();
  const buildQuiz = useSession(s => s.buildQuiz);
  const [flipped, setFlipped] = useState(false);
  const [mode] = useState<'kanji-to-english' | 'english-to-kanji'>('kanji-to-english');
  // NEW: modal state
  const [showQuizPrompt, setShowQuizPrompt] = useState(false);
  useEffect(() => { (async () => {
    if (!today.length) try{await buildTodayFixed();}
    catch (e) { console.error(e); }
  })(); }, [today.length, buildTodayFixed]);

  // keyboard: ← → navigate, Space flips
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); handleNext(); }
      if (e.code === 'Space') { e.preventDefault(); setFlipped(f => !f); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, today.length]);

  if (!today.length) {
    return (
      <Screen>
        <TileOverlay />
        <Panel>
          <Header><Title>Flashcards</Title></Header>
          <Body><Counter>No cards selected. Go back to settings.</Counter></Body>
        </Panel>
      </Screen>
    );
  }

  const word = today[index];
  const atEnd = index + 1 >= today.length;
  const pct = Math.min(100, Math.round(((index + 1) / today.length) * 100));

  function handleNext() {
    if (atEnd) {
      setShowQuizPrompt(true);   // ← show modal instead of jumping
      return;
    }
    setFlipped(false);
    next();
  }
  function handlePrev() {
    setFlipped(false);
    prev();
  }

  function startQuizNow() {
    setShowQuizPrompt(false);
    buildQuiz();
    setStage('quiz');
  }

  return (
    <Screen>
      <TileOverlay />
      <Panel>
        <Header>
        <Btn variant="secondary" onClick={() => nav(-1)}>← Back</Btn>
          <Title>Flashcards</Title>
          <TopRow>
            <Small>Lesson: <b>{lessonNo ?? '-'}</b></Small>
            <Small>Quiz attempt: <b>{quizAttempt}</b></Small>
          </TopRow>
          {/* You can put a tiny sprite/icon here later if you want */}
        </Header>

        <Body>
          <Stage>
            <Hud>
              <Counter>{index + 1} / {today.length}</Counter>
              <BarWrap><BarFill pct={pct} /></BarWrap>
            </Hud>
            {/* <CardFrame>
            </CardFrame> */}
            <Flashcard word={word} flipped={flipped} onFlip={() => setFlipped(f => !f)} mode={mode} />

            <Controls>
              <Btn variant="secondary" onClick={handlePrev}>← Prev</Btn>
              {/* <Btn variant="ghost" onClick={() => setFlipped(f => !f)}>Flip</Btn> */}
              <SpeechButton word={word} />
              <Btn variant="primary" onClick={handleNext}>Next →</Btn>
            </Controls>
           
          </Stage>
        </Body>
        <div>
            {atEnd && (
              <Btn variant="primary" onClick={() => setShowQuizPrompt(true)}>Start Quiz →</Btn>
            )}
          </div>
      </Panel>
      {showQuizPrompt && (
        <ModalBackdrop onClick={() => setShowQuizPrompt(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <h3>Ready for the quiz?</h3>
            <TopRow>
              <Small>Lesson: <b>{lessonNo ?? '-'}</b></Small>
              <Small>Quiz attempt: <b>{quizAttempt}</b></Small>
            </TopRow>
            <div style={{ display:'flex', gap:12, marginTop:16 }}>
              <Btn variant="secondary" onClick={() => setShowQuizPrompt(false)}>Review more</Btn>
              <Btn variant="primary" onClick={startQuizNow}>Start Quiz</Btn>
            </div>
          </Modal>
        </ModalBackdrop>
      )}
      {/* {process.env.NODE_ENV !== 'production' && <TodayPeek />} */}
    </Screen>
  );
};
