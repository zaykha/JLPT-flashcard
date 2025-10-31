import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/store/session';
import { Flashcard } from '@/components/flashcards/Flashcard';
import { SpeechButton } from '@/components/flashcards/SpeechButton';
import { useNavigate } from 'react-router-dom';
import { Screen, TileOverlay, Panel, Header, Title, Body, Stage, Hud,
  Counter, BarWrap, BarFill, Controls, Btn, TopRow, 
  Small} from '@/styles/Pages/FlashCardPage.styles';
import { useKeyNav } from '@/hooks/useKeyNavsV1';
import {
  ModalRoot, ModalHeader, ModalTitle, ModalBody, ModalActions, ModalClose
} from '@/components/ui/Modal';
import { useShallow } from 'zustand/shallow';
import type { SessionState } from '@/types/session';

/** ====== Component ====== */
export const FlashcardsPage: React.FC = () => {
  const {
    today, index, lessonNo, quizAttempt, lessonPhase,
    next, prev, buildTodayFixed, buildQuiz, setStage, stage, ensureStageForHome
  } = useSession(
    useShallow((s: SessionState) => ({
      today: s.today,
      index: s.index,
      lessonNo: s.lessonNo,
      quizAttempt: s.quizAttempt,
      lessonPhase: s.lessonPhase,
      next: s.next,
      prev: s.prev,
      buildTodayFixed: s.buildTodayFixed,
      buildQuiz: s.buildQuiz,
      setStage: s.setStage,
      stage: s.stage,
      ensureStageForHome: s.ensureStageForHome,
    }))
  );

  const nav = useNavigate();
  const [flipped, setFlipped] = useState(false);
  const [mode] = useState<'kanji-to-english' | 'english-to-kanji'>('kanji-to-english');
  const [showQuizPrompt, setShowQuizPrompt] = useState(false);

  // --- One-shot init; ensure we build even if stage is transient (e.g., 'buy')
  const initRanRef = useRef(false);
  useEffect(() => {
    if (initRanRef.current) return;
    initRanRef.current = true;

    if (Array.isArray(today) && today.length > 0) {
      if (process.env.NODE_ENV !== 'production') console.info('[Flashcards] today already built:', today.length);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        if (process.env.NODE_ENV !== 'production') console.info('[Flashcards] building today (init)…', { stage });
        await buildTodayFixed();
        if (cancelled) return;
        await ensureStageForHome();
        if (process.env.NODE_ENV !== 'production') console.info('[Flashcards] build complete; ensuring stage');
      } catch {}
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch page once when grammar phase begins
  useEffect(() => { if (lessonPhase === 'grammar' && stage !== 'grammar') setStage('grammar'); }, [lessonPhase, stage, setStage]);

  // Reset flip on index change
  useEffect(() => { setFlipped(false); }, [index]);

  const word  = useMemo(() => today[index], [today, index]);
  const atEnd = useMemo(() => index + 1 >= today.length, [index, today.length]);
  const pct   = useMemo(() => (today.length ? Math.min(100, Math.round(((index + 1) / today.length) * 100)) : 0), [index, today.length]);

  const handlePrev = useCallback(() => { setFlipped(false); prev(); }, [prev]);
  const handleNext = useCallback(() => { if (atEnd) { setShowQuizPrompt(true); return; } setFlipped(false); next(); }, [atEnd, next]);
  const handleFlip = useCallback(() => setFlipped(f => !f), []);
  const startQuizNow = useCallback(() => { setShowQuizPrompt(false); buildQuiz(); }, [buildQuiz]);

  useKeyNav({ onPrev: handlePrev, onNext: handleNext, onFlip: handleFlip, disabled: showQuizPrompt });

  if (!today.length) {
    return (
      <Screen>
        <TileOverlay />
        <Panel>
          <Header><Title>Flashcards</Title></Header>
          <Body><Counter>Loading today’s cards…</Counter></Body>
        </Panel>
      </Screen>
    );
  }

  return (
    <Screen>
      <TileOverlay />
      <Panel>
        <Header>
          <div><Btn $variant="secondary" onClick={() => nav(-1)}>←</Btn></div>
          <div><Title>Flashcards (Vocab)</Title></div>
          
        </Header>

        <Body>
          <Stage>
            <Hud>
              <Counter>{index + 1} / {today.length}</Counter>
              <BarWrap><BarFill $pct={pct} /></BarWrap>
            </Hud>

            <Flashcard word={word} flipped={flipped} onFlip={() => setFlipped(f => !f)} mode={mode} />

            <Controls>
              <Btn $variant="secondary" onClick={handlePrev}>←</Btn>
              <SpeechButton word={word} />
              <Btn $variant="primary" onClick={handleNext}>→</Btn>
            </Controls>
          </Stage>
          {atEnd && <Btn $variant="primary" onClick={() => setShowQuizPrompt(true)}>Start Quiz →</Btn>}
        </Body>
      </Panel>

      {showQuizPrompt && (
        <ModalRoot open={showQuizPrompt} onClose={() => setShowQuizPrompt(false)} maxWidth={520} labelledBy="quiz-start-title">
          <ModalHeader>
            <ModalTitle id="quiz-start-title">
              {lessonPhase === 'grammar' ? 'Ready for the grammar quiz?' : 'Ready for the vocab quiz?'}
            </ModalTitle>
            <ModalClose onClick={() => setShowQuizPrompt(false)} aria-label="Close">×</ModalClose>
          </ModalHeader>
          <ModalBody>
            <TopRow>
              <Small>Lesson: <b>{lessonNo ?? '-'}</b></Small>
              <Small>Quiz attempt: <b>{quizAttempt}</b></Small>
            </TopRow>
          </ModalBody>
          <ModalActions>
            <Btn $variant="ghost" onClick={() => setShowQuizPrompt(false)}>Review more</Btn>
            <Btn $variant="primary" onClick={startQuizNow}>Start Quiz</Btn>
          </ModalActions>
        </ModalRoot>
      )}
    </Screen>
  );
};
