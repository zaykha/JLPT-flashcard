import React, { useMemo } from 'react';
import styled from 'styled-components';
import type { LessonProgress } from '@/types/lessonV1';

type Props = {
  open: boolean;
  onClose: () => void;
  lessonProgress: LessonProgress | null | undefined;
};

export const ProgressModal: React.FC<Props> = ({ open, onClose, lessonProgress }) => {
  if (!open) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) onClose();
  };

  const data = lessonProgress ?? { completed: [], failed: [], current: [], examsStats: [] };
  const counts = {
    completed: data.completed?.length ?? 0,
    failed: data.failed?.length ?? 0,
    current: data.current?.length ?? 0,
    exams: data.examsStats?.length ?? 0,
  };

  const recentCompleted = useMemo(() => (data.completed ?? []).slice(-10).reverse(), [data.completed]);
  const recentFailed = useMemo(() => (data.failed ?? []).slice(-10).reverse(), [data.failed]);
  const today = useMemo(() => (data.current ?? []).slice(), [data.current]);

  return (
    <Backdrop onMouseDown={handleBackdrop}>
      <Modal role="dialog" aria-modal="true" aria-label="Progress overview">
        <Close onClick={onClose} aria-label="Close">✖</Close>
        <ModalHeader>
          <h3>Study Progress</h3>
        </ModalHeader>

        <Body>
          <Cards>
            <StatCard><StatNum>{counts.completed}</StatNum><StatLabel>Completed</StatLabel></StatCard>
            <StatCard><StatNum>{counts.failed}</StatNum><StatLabel>Missed</StatLabel></StatCard>
            <StatCard><StatNum>{counts.current}</StatNum><StatLabel>Today</StatLabel></StatCard>
            <StatCard><StatNum>{counts.exams}</StatNum><StatLabel>Exams</StatLabel></StatCard>
          </Cards>

          <Section>
            <SectionTitle>Today&apos;s Queue</SectionTitle>
            <List role="list">
              {today?.length ? today.map((c, i) => (
                <Row key={`t-${i}`}>
                  <b>Lesson {c.lessonNo}</b>
                  <small> · {c.LessonDate}</small>
                </Row>
              )) : <EmptyState>Nothing in today&apos;s queue.</EmptyState>}
            </List>
          </Section>

          <GridTwo>
            <Section>
              <SectionTitle>Recent Completed</SectionTitle>
              <List role="list">
                {recentCompleted.length ? recentCompleted.map((e, i) => (
                  <Row key={`c-${i}`}>
                    <b>Lesson {e.lessonNo ?? '—'}</b>
                    <small> · {String(e.completedAt ?? e.lessonId ?? '').slice(0,10)}</small>
                    {e.quiz?.durationSec != null && <small> · Vocab: {e.quiz.durationSec}s</small>}
                    {e.grammarQuiz?.durationSec != null && <small> · Grammar: {e.grammarQuiz.durationSec}s</small>}
                    {e.attempts != null && <small> · Attempts: {e.attempts}</small>}
                  </Row>
                )) : <EmptyState>No completed lessons yet.</EmptyState>}
              </List>
            </Section>
            <Section>
              <SectionTitle>Recent Missed</SectionTitle>
              <List role="list">
                {recentFailed.length ? recentFailed.map((e, i) => (
                  <Row key={`f-${i}`}>
                    <b>Lesson {e.lessonNo ?? '—'}</b>
                    <small> · {String(e.attemptedAt ?? e.LessonDate ?? '').slice(0,10)}</small>
                  </Row>
                )) : <EmptyState>No missed lessons.</EmptyState>}
              </List>
            </Section>
          </GridTwo>
        </Body>
      </Modal>
    </Backdrop>
  );
};

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.72);
  display: grid;
  place-items: center;
  padding: 24px;
  z-index: 60;
`;

const Modal = styled.div`
  position: relative;
  width: min(720px, 92vw);
  max-height: min(90vh, 720px);
  background: ${({ theme }) => theme.colors.sheetBg};
  border-radius: 20px;
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  box-shadow: 0 18px 48px rgba(0,0,0,0.45);
  display: grid;
  grid-template-rows: auto 1fr;
`;

const Close = styled.button`
  position: absolute;
  left: 12px;
  top: 12px;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 14px;
  cursor: pointer;
  &:hover { filter: brightness(0.95); }
  &:focus-visible { outline: 3px solid #ffffff88; outline-offset: 2px; }
`;

const ModalHeader = styled.div`
  padding: 28px 48px 12px;
  text-align: center;
  h3 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 18px;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Body = styled.div`
  padding: 0 24px 28px;
  overflow: hidden auto;
  display: grid;
  gap: 18px;
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  @media (max-width: 520px) { grid-template-columns: repeat(2, 1fr); }
`;
const StatCard = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  border-radius: 14px;
  padding: 12px;
  text-align: center;
  background: ${({ theme }) => theme.colors.panel};
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
`;
const StatNum = styled.div`
  font-size: 1.2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
`;
const StatLabel = styled.div` font-size: 0.75rem; opacity: 0.8; `;

const LevelHeading = styled.div`
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const LevelBarWrap = styled.div`
  margin: 10px 0 8px;
  width: 100%;
  height: 12px;
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.sheetBg};
  overflow: hidden;
`;

const LevelBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  transition: width 0.6s ease;
`;

const LevelMeta = styled.div`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Section = styled.section` display: grid; gap: 8px; `;
const SectionTitle = styled.h4` margin: 0; font-size: .9rem; `;
const List = styled.div` display: grid; gap: 8px; `;
const GridTwo = styled.div` display: grid; gap: 14px; grid-template-columns: 1fr 1fr; @media (max-width: 520px) { grid-template-columns: 1fr; }`;

const Row = styled.div`
  padding: 10px 12px;
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.sheetBg};
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
`;
const EmptyState = styled.div` opacity: 0.7; font-size: 0.85rem; `;
