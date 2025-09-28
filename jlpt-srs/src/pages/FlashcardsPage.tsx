import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSession } from '@/store/session';
import { Flashcard } from '@/components/flashcards/Flashcard';
import { SpeechButton } from '@/components/flashcards/SpeechButton';
import { useNavigate } from 'react-router-dom';
import flashcardbg from "@/assets/LoginPage/kozaloginmobile.png";

/** ====== Animations / Layout ====== */
// const float = keyframes`
//   0% { transform: translateY(0) }
//   50% { transform: translateY(-4px) }
//   100% { transform: translateY(0) }
// `;

const Screen = styled.div`
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 24px 12px;
  background:
    url(${flashcardbg}) center/cover no-repeat,
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

const Panel = styled.section`
  width: min(860px, 100%);
  // background: ${({ theme }) => theme.colors.sheetBg};
  
  border: 2px solid #000;
  border-radius: 16px;
  box-shadow: 0 2px 0 #000, 0 8px 0 rgba(0,0,0,.35), ${({ theme }) => theme.shadow.card};
  padding: 16px;
  position: relative;
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 4px 6px 12px;
  border-bottom: 2px dashed ${({ theme }) => theme.colors.border};
`;

const Title = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  color:#fff;
  font-size: clamp(14px, 3.6vw, 18px);
  letter-spacing: .5px;
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

// const CardFrame = styled.div`
//   width: min(680px, 96%);
//   border: 2px solid #000;
//   border-radius: 16px;
//   background: #ffffff;
//   padding: 10px;
//   box-shadow: 6px 6px 0 #000;  /* pixel offset */
//   animation: ${float} 6s ease-in-out infinite;

//   @media (max-width: 520px) {
//     padding: 8px;
//     box-shadow: 4px 4px 0 #000;
//   }
// `;

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

// const ModeWrap = styled.div`
//   margin-top: 8px;
//   display: grid;
//   gap: 6px;
//   justify-items: center;
// `;

// const ModeLabel = styled.div`
//   font-family: ${({ theme }) => theme.fonts.body};
//   font-size: clamp(11px, 3vw, 12px);
//   color: ${({ theme }) => theme.colors.textMuted};
// `;

// const ModeChips = styled.div`
//   display: grid;
//   grid-auto-flow: column;
//   gap: 8px;
// `;

// const Chip = styled.button<{active?: boolean}>`
//   padding: 8px 10px;
//   border-radius: 12px;
//   border: 2px solid #000;
//   font-family: ${({ theme }) => theme.fonts.body};
//   font-size: clamp(11px, 3vw, 12px);
//   letter-spacing: .02em;
//   cursor: pointer;

//   color: ${({ active, theme }) => active ? '#fff' : theme.colors.text};
//   background: ${({ active, theme }) => active ? theme.colors.secondary : '#fff'};
//   box-shadow: 3px 3px 0 #000;

//   transition: transform .1s ease, box-shadow .1s ease, background .15s ease;
//   &:hover { transform: translateY(-1px); }
//   &:active { transform: translate(3px,3px); box-shadow: 0 0 0 #000; }
// `;

/** ====== Component ====== */
export const FlashcardsPage: React.FC = () => {
  const today = useSession(s => s.today);
  const index = useSession(s => s.index);
  const next = useSession(s => s.next);
  const prev = useSession(s => s.prev);
  const setStage = useSession(s => s.setStage);
  const buildTodayFixed = useSession(s => s.buildTodayFixed);
  const nav = useNavigate();

  const [flipped, setFlipped] = useState(false);
  const [mode] = useState<'kanji-to-english' | 'english-to-kanji'>('kanji-to-english');

  useEffect(() => { (async () => {
    if (!today.length) await buildTodayFixed();
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
  const pct = Math.min(100, Math.round(((index + 1) / today.length) * 100));

  function handleNext() {
    if (index + 1 >= today.length) {
      setStage('quiz'); // continue flow
      return;
    }
    setFlipped(false);
    next();
  }
  function handlePrev() {
    setFlipped(false);
    prev();
  }

  return (
    <Screen>
      <TileOverlay />
      <Panel>
        <Header>
        <Btn variant="secondary" onClick={() => nav(-1)}>← Back</Btn>
          <Title>Flashcards</Title>
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
      </Panel>
    </Screen>
  );
};
