// src/pages/ExamFresherPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useSession } from '@/store/session';
import type { Word } from '@/types/vocab';
import type { GrammarPoint } from '@/types/grammar';
import { Btn, Screen } from '@/styles/Pages/FlashCardPage.styles';
import { PixelFrame } from '@/styles/Pages/QuizSummaryPage.styles';

/**
 * Types
 */
type FresherData = Record<number, { words: Word[]; grammar: GrammarPoint[] }>;

export const ExamFresherPage: React.FC = () => {
  const nav = useNavigate();

  // Store selectors (kept small to avoid unnecessary re-renders)
  const stage          = useSession(s => s.stage);
  const lastExamPair   = useSession(s => s.lastExamPair);
  const setLastExamPair = useSession(s => s.setLastExamPair);
  const srsDueToday    = useSession(s => (s as any).srsDueToday as number[]);
  const beginSrsExam   = useSession(s => (s as any).beginSrsExam as () => Promise<void>);
  // const buildExamFor   = useSession(s => s.buildExamFor); // may be undefined in TS; guarded below

  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState<FresherData>({});
  const [err, setErr]         = useState<string | null>(null);

  const examDoneForISO = useSession(s => s.examDoneForISO);
  const todayISO = new Date().toISOString().slice(0, 10);

  // Show one lesson at a time
  const lessonNos = useMemo(
    () => Object.keys(data).map(Number).sort((a,b)=>a-b),
    [data]
  );
  const [lessonIdx, setLessonIdx] = useState(0);

  // Per-lesson slide index: 0 = vocab, 1 = grammar
  const [slides, setSlides] = useState<Record<number, 0 | 1>>({});
  const currentLessonNo = lessonNos[lessonIdx];

  // Fallback if pair is missing: take last two completed from bootstrap
  const computePairFromBootstrap = useCallback(async (): Promise<{ a:number; b:number } | null> => {
    const { loadBootstrap } = await import('@/lib/bootstrap');
    const boot = loadBootstrap();
    const completed = (boot?.lessonProgress?.completed ?? []) as Array<{ lessonNo:number; completedAt?:string }>;
    if (!Array.isArray(completed) || completed.length < 2) return null;
    const a = completed[completed.length - 2].lessonNo;
    const b = completed[completed.length - 1].lessonNo;
    return { a, b };
  }, []);

  // Load words/grammar for exam pair OR SRS due list
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const isSrs = stage === 'srsFresher';

        let lessonsToShow: number[] = [];
        let pair = lastExamPair;
        if (isSrs) {
          lessonsToShow = Array.isArray(srsDueToday) ? srsDueToday.slice() : [];
          if (!lessonsToShow.length) {
            setErr('No SRS reviews due right now.');
            setLoading(false);
            return;
          }
        } else {
          pair = pair ?? (await computePairFromBootstrap());
          if (!pair) {
            setErr('Not enough completed lessons to build today’s exam.');
            setLoading(false);
            return;
          }
          lessonsToShow = [pair.a, pair.b];
        }

        const [
          { loadBootstrap, loadBootCatalog },
          { getVocabByIds, getGrammarByIds },
          { mapVocabDocToWord },
        ] = await Promise.all([
          import('@/lib/bootstrap'),
          import('@/lib/firestore/content'),
          import('@/types/vocab'),
        ]);

        const boot = loadBootstrap();
        const level = boot?.catalogLevel;
        if (!level) {
          setErr('Missing catalog level.');
          setLoading(false);
          return;
        }

        const cat = await loadBootCatalog(level);
        const lessons = (cat as any)?.lessons as Array<{ lessonNo:number; vocabIds?:string[]; grammarIds?:string[] }>;
        if (!Array.isArray(lessons)) {
          setErr('Catalog lessons not loaded.');
          setLoading(false);
          return;
        }

        const pick = (no:number) => lessons.find(l => l.lessonNo === no) ?? { lessonNo:no, vocabIds:[], grammarIds:[] };
        const packs = lessonsToShow.map(n => pick(n));

        // Fetch vocab/grammar for each lesson, in parallel batches
        const vocabPromises = packs.map(p => getVocabByIds(p.vocabIds || []));
        const grammarPromises = packs.map(p => getGrammarByIds(p.grammarIds || []));
        const vocabDocs = await Promise.all(vocabPromises);
        const grammarDocs = await Promise.all(grammarPromises);

        const nextData: any = {};
        packs.forEach((p, idx) => {
          const w = (vocabDocs[idx] || []).map((doc:any) => mapVocabDocToWord(doc));
          const g = (grammarDocs[idx] || []) as GrammarPoint[];
          nextData[p.lessonNo] = { words: w, grammar: g };
        });
        setData(nextData);
        // Set default slides to vocab for all
        const slideInit: Record<number, 0|1> = {};
        packs.forEach(p => { slideInit[p.lessonNo] = 0; });
        setSlides(slideInit);

        // Persist pair to session for exam builder (exam mode only)
        if (!isSrs && !lastExamPair && pair) {
          useSession.getState().setLastExamPair(pair);
        }
      } catch (e:any) {
        console.warn('[ExamFresher] load failed', e);
        setErr('Failed to load exam overview.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    let w = 0, g = 0;
    for (const no of lessonNos) {
      w += data[no]?.words?.length ?? 0;
      g += data[no]?.grammar?.length ?? 0;
    }
    return { words: w, grammar: g };
  }, [data, lessonNos]);

  const pair = useMemo(() => useSession.getState().lastExamPair, [lessonNos.length]); // stable read

  const goLesson = (delta: number) => {
    if (!lessonNos.length) return;
    setLessonIdx(i => {
      const next = Math.min(Math.max(0, i + delta), lessonNos.length - 1);
      return next;
    });
  };

  const toggleSlide = (forLessonNo: number, dir: 'prev'|'next') => {
    setSlides(prev => {
      const cur = prev[forLessonNo] ?? 0;
      const next: 0 | 1 = dir === 'next' ? (cur === 0 ? 1 : 0) : (cur === 0 ? 1 : 0);
      return { ...prev, [forLessonNo]: next };
    });
  };

  const startExam = useCallback(async () => {
    if (stage === 'srsFresher') {
      await beginSrsExam?.();
      nav('/flashcards');
      return;
    }
    if (!pair) return;
    const todayISO = new Date().toISOString().slice(0, 10);
    const done = useSession.getState().examDoneForISO === todayISO;
    if (done) { nav('/'); return; }
    await useSession.getState().buildExamFor(pair.a, pair.b);
    nav('/flashcards');
  }, [stage, beginSrsExam, pair, nav]);

  // --- Render states ---
  if (loading) {
    return (
      <Screen>
        <PixelFrame>
          <Title>{stage === 'srsFresher' ? 'SRS Review Overview' : 'Today’s Exam Overview'}</Title>
          <Small>Loading…</Small>
        </PixelFrame>
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen>
        <PixelFrame>
          <Title>Today’s Exam Overview</Title>
          <ErrorText>{err}</ErrorText>
          <StickyBar>
            <Secondary onClick={() => { setLastExamPair(null); nav('/'); }}>← Back</Secondary>
          </StickyBar>
        </PixelFrame>
      </Screen>
    );
  }

  if (!lessonNos.length) {
    return (
      <Screen>
        <PixelFrame>
          <Title>Today’s Exam Overview</Title>
          <Small>Nothing to show.</Small>
          <StickyBar>
            <Secondary onClick={() => { setLastExamPair(null); nav('/'); }}>← Back</Secondary>
          </StickyBar>
        </PixelFrame>
      </Screen>
    );
  }

  const bundle = data[currentLessonNo] ?? { words: [], grammar: [] };
  const slide = slides[currentLessonNo] ?? 0;

  return (
    <Screen>
      <PixelFrame>
        <HeaderRow>
          <Title>Today’s Exam Overview</Title>
          <Small>
            {stage === 'srsFresher'
              ? `${lessonNos.length} lesson(s)`
              : (pair ? `Lessons ${pair.a} & ${pair.b}` : null)
            } · {totals.words} words · {totals.grammar} grammar points
          </Small>
        </HeaderRow>

        {/* Lesson pager */}
        <LessonNav>
          <NavBtn onClick={() => goLesson(-1)} disabled={lessonIdx === 0}>◀</NavBtn>
          <h3>Lesson {currentLessonNo}</h3>
          <NavBtn onClick={() => goLesson(+1)} disabled={lessonIdx >= lessonNos.length - 1}>▶</NavBtn>
        </LessonNav>

        {/* Vocabulary / Grammar carousel */}
        <CarouselShell>
          <Arrow left onClick={() => toggleSlide(currentLessonNo, 'prev')}>‹</Arrow>

          <Track $index={slide}>
            {/* Slide 0: Vocabulary */}
            <Slide>
              <SlideTitle>Vocabulary ({bundle.words.length})</SlideTitle>
              <Items>
                {bundle.words.map(w => {
                  const head = w.kanji || w.hiragana || w.romaji || w.english;
                  const sub = w.kanji && w.hiragana ? ` ・ ${w.hiragana}` : '';
                  return (
                    <Item key={w.id}>
                      <ItemHead>{head}{sub}</ItemHead>
                      <ItemSub>{w.english}</ItemSub>
                    </Item>
                  );
                })}
                {!bundle.words.length && <Empty>— No vocabulary —</Empty>}
              </Items>
            </Slide>

            {/* Slide 1: Grammar */}
            <Slide>
              <SlideTitle>Grammar ({bundle.grammar.length})</SlideTitle>
              <Items>
                {bundle.grammar.map((g: any) => {
                  const jp = g?.title_jp ?? g?.title ?? '-';
                  const en = g?.title_en ?? g?.shortExplanation ?? '';
                  const key = g?.id || g?.key || jp;
                  return (
                    <Item key={key}>
                      <ItemHead>{jp}</ItemHead>
                      <ItemSub>{en}</ItemSub>
                    </Item>
                  );
                })}
                {!bundle.grammar.length && <Empty>— No grammar points —</Empty>}
              </Items>
            </Slide>
          </Track>

          <Arrow onClick={() => toggleSlide(currentLessonNo, 'next')}>›</Arrow>
        </CarouselShell>

        {/* Sticky CTA bar */}
        <StickyBar>
          <Btn
            $variant="secondary"
            onClick={() => { setLastExamPair(null); nav('/'); }}
          >
            ← Back
          </Btn>

          <Btn
            $variant="primary"
            onClick={startExam}
            disabled={stage !== 'srsFresher' && examDoneForISO === todayISO}
            title={stage !== 'srsFresher' && examDoneForISO === todayISO ? 'You already took today’s exam' : undefined}
          >
            {stage === 'srsFresher' ? 'Start SRS →' : 'Start Exam →'}
          </Btn>
        </StickyBar>
      </PixelFrame>
    </Screen>
  );
};

/* ====== Styles (scoped to this page) ====== */

const Title = styled.h1`
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
`;

const Small = styled.div`
  opacity: 0.75;
  font-size: 13px;
`;

const ErrorText = styled.div`
  color: #ff6b6b;
  margin-top: 6px;
`;

const HeaderRow = styled.div`
  margin-bottom: 12px;
`;

const LessonNav = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  margin: 8px 0 12px;
  h3 {
    text-align: center;
    margin: 0;
    font-weight: 700;
  }
`;

const NavBtn = styled.button<{disabled?:boolean}>`
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.98);
  background: rgba(0, 125, 123, 0.05);
  color: #00a375ff;
  opacity: ${({disabled}) => disabled ? 0.4 : 1};
  cursor: ${({disabled}) => disabled ? 'default' : 'pointer'};
`;

export const CarouselShell = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(111, 111, 111, 0.13);
`;

const Arrow = styled.button<{left?: boolean}>`
  position: absolute;
  top: 50%;
  ${({left}) => left ? 'left: 8px;' : 'right: 8px;'}
  transform: translateY(-50%);
  z-index: 5;
  height: 40px;
  width: 40px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(0,0,0,0.35);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
`;

const Track = styled.div<{ $index: number }>`
  display: flex;
  width: 200%; /* 2 slides */
  transform: translateX(${({ $index }) => $index === 0 ? '0%' : '-50%'});
  transition: transform 260ms ease;
`;

const Slide = styled.div`
  width: 50%;
  min-height: 260px;
  padding: 16px;
`;

const SlideTitle = styled.h4`
  margin: 4px 0 10px;
  font-weight: 700;
`;

const Items = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  max-height: 48vh;
  overflow: auto;
  padding-right: 4px;
`;

const Item = styled.div`
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
`;

const ItemHead = styled.div`
  font-weight: 700;
`;

const ItemSub = styled.div`
  font-size: 13px;
  opacity: 0.75;
`;

const Empty = styled.div`
  opacity: 0.6;
  font-size: 13px;
`;

const StickyBar = styled.div`
  position: sticky;
  bottom: -1px; /* to fight subpixel gaps on some browsers */
  margin-top: 16px;
  padding: 12px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  z-index: 9999;

  /* Overlay look so it stays visible */
  // background: linear-gradient(180deg, rgba(11,13,18,0) 0%, rgba(11,13,18,0.85) 25%, rgba(11,13,18,1) 100%);
  // backdrop-filter: blur(6px);
  // border-top: 1px solid rgba(255,255,255,0.08);
`;

const BaseBtn = styled.button`
  height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
`;

const Secondary = styled(BaseBtn)`
  background: rgba(255,255,255,0.06);
  color: #fff;
  border-color: rgba(255,255,255,0.12);
`;
