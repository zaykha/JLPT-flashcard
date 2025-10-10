import React from 'react';
import styled from 'styled-components';
import type { Topic, TopicGroup, ProgressBuckets } from '@/types/vocab';
import { ProgressBar } from '@/components/ui/ProgressBar';

type WordsByLevel = Record<'N1'|'N2'|'N3'|'N4'|'N5', number>;

const LEVEL_TOTALS: WordsByLevel = {
  N1: 3462,
  N2: 1831,
  N3: 1797,
  N4: 632,
  N5: 662,
};

type Props = {
  open: boolean;
  onClose: () => void;
  groups: TopicGroup[];
  progress: Record<Topic, ProgressBuckets>;
  profileLevel: 'N5'|'N4'|'N3'|'N2'|'N1' | null;
  wordsByLevel: WordsByLevel;
};

export const ProgressModal: React.FC<Props> = ({
  open,
  onClose,
  groups,
  progress,
  profileLevel,
  wordsByLevel,
}) => {
  if (!open) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) onClose();
  };

  const level = profileLevel ?? 'N5';
  const levelTotal = LEVEL_TOTALS[level] ?? 0;
  const learned = wordsByLevel[level] ?? 0;
  const pct = levelTotal ? Math.min(100, Math.round((learned / levelTotal) * 100)) : 0;

  const sorted = [...groups].sort((a, b) => b.items.length - a.items.length);

  return (
    <Backdrop onMouseDown={handleBackdrop}>
      <Modal role="dialog" aria-modal="true" aria-label="Progress overview">
        <Close onClick={onClose} aria-label="Close">✖</Close>
        <ModalHeader>
          <h3>Progress Overview</h3>
          <p>Track your topics and JLPT journey.</p>
        </ModalHeader>

        <Body>
          <LevelCard>
            <LevelHeading>Level Progress ({level})</LevelHeading>
            <LevelBarWrap>
              <LevelBar style={{ width: `${pct}%` }} />
            </LevelBarWrap>
            <LevelMeta>
              {learned} / {levelTotal} words · {pct}% complete
            </LevelMeta>
          </LevelCard>

          <TopicList>
            {sorted.map(group => {
              const detail = progress[group.title as Topic];
              const segments = detail ? [
                { key: 'new', label: 'New', count: detail.newCount },
                { key: 'due', label: 'Due', count: detail.dueCount },
                { key: 'future', label: 'Queued', count: detail.futureCount },
              ] : [];

              if (detail) {
                const entries = Object.entries(detail.byStep)
                  .filter(([, count]) => count > 0)
                  .sort((a, b) => Number(a[0]) - Number(b[0]));
                entries.forEach(([step, count]) => {
                  segments.push({ key: `s${step}`, label: `S${step}`, count });
                });
              }

              const total = group.items.length;
              const titleSize = group.title.length > 18 ? '0.8rem' : '0.9rem';

              return (
                <TopicRow key={group.key}>
                  <TopicMeta>
                    <TopicName style={{ fontSize: titleSize }}>{group.title}</TopicName>
                    <TopicCount>{total} words</TopicCount>
                  </TopicMeta>
                  <TopicProgress>
                    {total > 0 ? (
                      <ProgressBar
                        segments={segments}
                        total={total}
                        height={10}
                        rounded
                        compact
                        showLegend={false}
                      />
                    ) : (
                      <EmptyState>No words yet</EmptyState>
                    )}
                  </TopicProgress>
                </TopicRow>
              );
            })}
          </TopicList>
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
  border: 2px solid #000;
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
  border: 2px solid #000;
  background: #fff;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 14px;
  cursor: pointer;
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
  }
  p {
    margin: 6px 0 0;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Body = styled.div`
  padding: 0 24px 28px;
  overflow: hidden auto;
  display: grid;
  gap: 20px;
`;

const LevelCard = styled.div`
  border: 2px solid #000;
  border-radius: 16px;
  padding: 16px;
  background: linear-gradient(145deg, rgba(17,24,39,0.08), rgba(17,24,39,0.14));
`;

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
  border: 2px solid #000;
  border-radius: 999px;
  background: rgba(255,255,255,0.5);
  overflow: hidden;
`;

const LevelBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #f97316, #ec4899);
  transition: width 0.6s ease;
`;

const LevelMeta = styled.div`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.text};
`;

const TopicList = styled.div`
  display: grid;
  gap: 12px;
`;

const TopicRow = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 16px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 14px;
  background: rgba(255,255,255,0.7);
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const TopicMeta = styled.div`
  display: grid;
  gap: 4px;
`;

const TopicName = styled.div`
  font-weight: 700;
  letter-spacing: 0.02em;
`;

const TopicCount = styled.div`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const TopicProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const EmptyState = styled.div`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;
