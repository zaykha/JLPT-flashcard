import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ensurePacks, type Pack } from '@/services/lesson-Packs';
import { Screen, PixelFrame } from '@/styles/Pages/QuizSummaryPage.styles';
import { Btn } from '@/styles/Pages/FlashCardPage.styles';

export const ReviewLessonPage: React.FC = () => {
  const { lessonNos } = useParams<{ lessonNos: string }>();
  const navigate = useNavigate();
  
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonIdx, setLessonIdx] = useState(0);
  const [slides, setSlides] = useState<Record<number, 0 | 1>>({}); // 0=vocab, 1=grammar

  useEffect(() => {
    const loadData = async () => {
      if (!lessonNos) {
        setError('No lessons specified');
        setLoading(false);
        return;
      }

      try {
        const nums = lessonNos.split(',').map(n => parseInt(n, 10)).filter(n => !isNaN(n));
        if (nums.length === 0) throw new Error('Invalid lesson numbers');
        
        const data = await ensurePacks(nums);
        setPacks(data);
        
        // Initialize slides to vocab (0) for all lessons
        const slideInit: Record<number, 0 | 1> = {};
        data.forEach(p => { slideInit[p.lessonNo] = 0; });
        setSlides(slideInit);
        
        setError(null);
      } catch (e: any) {
        setError(e?.message || 'Failed to load lessons');
        setPacks([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lessonNos]);

  const cur = packs[lessonIdx];
  const currentLessonNo = cur?.lessonNo;
  const slide = slides[currentLessonNo] ?? 0;

  const totals = useMemo(() => {
    let w = 0, g = 0;
    for (const p of packs) {
      w += p.words?.length ?? 0;
      g += p.grammar?.length ?? 0;
    }
    return { words: w, grammar: g };
  }, [packs]);

  const goLesson = useCallback((delta: number) => {
    if (!packs.length) return;
    setLessonIdx(i => {
      const next = Math.min(Math.max(0, i + delta), packs.length - 1);
      return next;
    });
  }, [packs.length]);

  const toggleSlide = useCallback((forLessonNo: number, dir: 'prev' | 'next') => {
    setSlides(prev => {
      const cur = prev[forLessonNo] ?? 0;
      const next: 0 | 1 = dir === 'next' ? (cur === 0 ? 1 : 0) : (cur === 0 ? 1 : 0);
      return { ...prev, [forLessonNo]: next };
    });
  }, []);

  if (loading) {
    return (
      <Screen>
        <PixelFrame>
          <Title>Review Lessons</Title>
          <Small>Loading…</Small>
        </PixelFrame>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <PixelFrame>
          <Title>Review Lessons</Title>
          <ErrorText>{error}</ErrorText>
          <StickyBar>
            <Btn $variant="secondary" onClick={() => navigate('/')}>← Back</Btn>
          </StickyBar>
        </PixelFrame>
      </Screen>
    );
  }

  if (!packs.length || !cur) {
    return (
      <Screen>
        <PixelFrame>
          <Title>Review Lessons</Title>
          <Small>No lesson data found.</Small>
          <StickyBar>
            <Btn $variant="secondary" onClick={() => navigate('/')}>← Back</Btn>
          </StickyBar>
        </PixelFrame>
      </Screen>
    );
  }

  return (
    <Screen>
      <PixelFrame>
        <HeaderRow>
          <Title>Review Lessons</Title>
          <Small>
            {packs.length} lesson(s) · {totals.words} words · {totals.grammar} grammar points
          </Small>
        </HeaderRow>

        {/* Lesson pager */}
        <LessonNav>
          <NavBtn onClick={() => goLesson(-1)} disabled={lessonIdx === 0}>◀</NavBtn>
          <h3>Lesson {currentLessonNo}</h3>
          <NavBtn onClick={() => goLesson(+1)} disabled={lessonIdx >= packs.length - 1}>▶</NavBtn>
        </LessonNav>

        {/* Vocabulary / Grammar carousel */}
        <CarouselShell>
          <Arrow left onClick={() => toggleSlide(currentLessonNo, 'prev')}>‹</Arrow>

          <Track $index={slide}>
            {/* Slide 0: Vocabulary */}
            <Slide>
              <SlideTitle>Vocabulary ({cur.words.length})</SlideTitle>
              <Items>
                {cur.words.map(w => {
                  const head = w.kanji || w.hiragana || w.romaji || w.english;
                  const sub = w.kanji && w.hiragana ? ` ・ ${w.hiragana}` : '';
                  return (
                    <Item key={w.id}>
                      <ItemHead>{head}{sub}</ItemHead>
                      <ItemSub>{w.english}</ItemSub>
                    </Item>
                  );
                })}
                {!cur.words.length && <Empty>— No vocabulary —</Empty>}
              </Items>
            </Slide>

            {/* Slide 1: Grammar */}
            <Slide>
              <SlideTitle>Grammar ({cur.grammar.length})</SlideTitle>
              <Items>
                {cur.grammar.map((g: any) => {
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
                {!cur.grammar.length && <Empty>— No grammar points —</Empty>}
              </Items>
            </Slide>
          </Track>

          <Arrow onClick={() => toggleSlide(currentLessonNo, 'next')}>›</Arrow>
        </CarouselShell>

        {/* Sticky CTA bar */}
        <BottomSpacer />
        <StickyBar>
          <Btn
            $variant="secondary"
            onClick={() => navigate('/')}
          >
            ← Back
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

const CarouselShell = styled.div`
  position: relative;
  /* Make this the scroll container for the main content area (fits PixelFrame's 3rd row) */
  min-height: 0; /* required for grid child to allow internal scroll */
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(111, 111, 111, 0.13);

  /* Keep content accessible above the fixed bottom bar on mobile */
  @media (max-width: 520px) {
    padding-bottom: 88px; /* matches StickyBar height + spacing */
  }
`;

const Arrow = styled.button<{left?: boolean}>`
  /* Default (desktop/tablet): positioned relative to carousel */
  position: absolute;
  top: 50%;
  ${({left}) => left ? 'left: 8px;' : 'right: 8px;'}
  transform: translateY(-50%);
  z-index: 9;
  height: 40px;
  width: 40px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(0,0,0,0.35);
  color: #fff;
  font-size: 20px;
  cursor: pointer;

  /* Mobile: fix to viewport so arrows remain visible while scrolling */
  @media (max-width: 520px) {
    position: fixed;
    top: 50%;
    ${({left}) => left ? 'left: 10px;' : 'right: 10px;'}
    transform: translateY(-50%);
    z-index: 10000;
  }
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

  /* Mobile: remove internal scroll, let page scroll naturally */
  @media (max-width: 520px) {
    max-height: none;
    overflow: visible;
    padding-right: 0;
  }
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
  bottom: -1px;
  margin-top: 16px;
  padding: 12px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  z-index: 9999;

  /* Mobile: fix to the bottom of the screen */
  @media (max-width: 520px) {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    margin-top: 0;
    padding: 12px 16px;
    background: ${({ theme }) => theme.colors.panel};
    border-top: 2px solid ${({ theme }) => theme.colors.pixelBorder};
    box-shadow: 0 -6px 18px rgba(0,0,0,0.25);
  }
`;

/* Spacer to prevent last content from being hidden behind fixed bar on mobile */
const BottomSpacer = styled.div`
  height: 0;
  @media (max-width: 520px) { height: 64px; }
`;

export default ReviewLessonPage;
