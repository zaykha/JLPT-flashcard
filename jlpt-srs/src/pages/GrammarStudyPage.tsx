// src/pages/GrammarStudyPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/store/session';
import { GrammarFlashcard } from '@/components/flashcards/GrammarFlashcard';
import { Screen, TileOverlay, Panel, Header, Title, Body, Stage, Hud, Counter, BarWrap, BarFill, Controls, Btn, ModalBackdrop, Modal, TopRow, Small } from '@/styles/Pages/GrammarStudyPage.styles';
import { useKeyNav } from '@/hooks/useKeyNavsV1';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const GrammarStudyPage: React.FC = () => {
  const nav = useNavigate();
  const grammar = useSession(s => s.grammarToday);
  const gIndex  = useSession(s => s.grammarIndex);
  const startGrammarStudy = useSession(s => s.startGrammarStudy);
  const launchGrammarQuiz = useSession(s => s.startGrammarQuiz);

  const [flipped, setFlipped] = useState(false);

  // If user lands here without data, fetch it once (idempotent action from session)
  useEffect(() => {
    if (grammar.length > 0) return;
    (async () => {
      try { await startGrammarStudy(); } catch (e) { console.warn('[grammar] startGrammarStudy failed', e); }
    })();
  }, [grammar.length, startGrammarStudy]);

  // Derived
  const point = useMemo(() => grammar[gIndex], [grammar, gIndex]);
  const atEnd = useMemo(() => gIndex + 1 >= grammar.length, [gIndex, grammar.length]);

  // Reset flip whenever index changes
  useEffect(() => { setFlipped(false); }, [gIndex]);

  // Handlers (stable)
  const prev = useCallback(() => {
    useSession.setState(s => ({ grammarIndex: Math.max(0, s.grammarIndex - 1) }));
  }, []);

  const next = useCallback(() => {
    useSession.setState(s => ({ grammarIndex: Math.min(s.grammarToday.length - 1, s.grammarIndex + 1) }));
  }, []);

  const handleFlip = useCallback(() => setFlipped(f => !f), []);
  const handleStartQuiz = useCallback(() => { launchGrammarQuiz(); }, [launchGrammarQuiz]);

  // Keyboard navigation (left/right/space)
  useKeyNav({ onPrev: prev, onNext: next, onFlip: handleFlip });

  if (!grammar.length) {
    return (
      <Screen>
        <TileOverlay />
        <Panel>
          <Header><Title>Grammar Study</Title></Header>
          <Body><Small>No grammar cards found for this lesson.</Small></Body>
        </Panel>
      </Screen>
    );
  }

  return (
    <Screen>
      <TileOverlay />
      <Panel>
        <Header>
          <Btn $variant="secondary" onClick={() => nav(-1)}>Back</Btn>
          <Title>Grammar Study</Title>
        </Header>

        <Body>
          <Stage>
            <Hud>
              <Counter>{gIndex + 1} / {grammar.length}</Counter>
              <BarWrap><BarFill $pct={Math.round(((gIndex + 1) / grammar.length) * 100)} /></BarWrap>
            </Hud>

            <GrammarFlashcard
              point={point}
              flipped={flipped}
              onFlip={handleFlip}
            />

            <Controls>
              <Btn $variant="secondary" onClick={() => { setFlipped(false); prev(); }}><ChevronLeft size={18}/> </Btn>
              <Btn $variant="ghost" onClick={handleFlip}>Flip</Btn>
              {atEnd ? (
                <Btn $variant="primary" onClick={handleStartQuiz}>Quiz</Btn>
              ) : (
                <Btn $variant="primary" onClick={() => { setFlipped(false); next(); }}> <ChevronRight size={18}/></Btn>
              )}
            </Controls>
          </Stage>
        </Body>
      </Panel>
    </Screen>
  );
};
