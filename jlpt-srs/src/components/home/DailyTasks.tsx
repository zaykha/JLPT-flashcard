import React, { useMemo } from 'react';
import styled from 'styled-components';
import { loadBootstrap } from '@/lib/bootstrap';
import { jstTodayISO } from '@/lib/cache/lessons';
import { SrsUnlockCard } from '../srs/srsUnlockCard';
import type { LessonProgress } from '@/types/lessonV1';

// Only what we read here:
type LP = Partial<Pick<LessonProgress, 'current' | 'examsStats'>>;

type TaskRow = { icon: string; label: string; done: boolean; must?: boolean };

export const DailyTasks: React.FC = () => {
  const todayISO = jstTodayISO();
  const boot = loadBootstrap();

  // Narrow to partial so TS recognizes keys, then safely fallback
  const lp: LP = (boot?.lessonProgress ?? {}) as LP;

  const current: any[] = Array.isArray(lp.current) ? lp.current : [];
  const examsStats: any[] = Array.isArray(lp.examsStats)
    ? lp.examsStats
    : Array.isArray((boot?.lessonProgress as any)?.examStats) // legacy key fallback
      ? (boot!.lessonProgress as any).examStats
      : [];

  // ✅ status signals
  const examDone = useMemo(
    () => examsStats.some(x => String(x.examDate || '').slice(0, 10) === todayISO),
    [examsStats, todayISO]
  );
  // If exam is done but current has items, treat them as purchased lessons tasks
  const hasPurchasedCurrent = examDone && current.length > 0;
  const studyDone = hasPurchasedCurrent ? true : current.length === 0;

  const rows: TaskRow[] = [
    { icon: '📜', label: 'Study today’s lessons', done: studyDone, must: true },
    { icon: '⚔️', label: 'Daily exam',            done: examDone,  must: true },
    ...(hasPurchasedCurrent ? [{ icon: '🛒', label: 'Finish purchased lessons', done: false }] as TaskRow[] : []),
  ];

  return (
    <Wrap>
      <Header>
        <Title>Tasks for the day</Title>
        <TodayPill>{todayISO}</TodayPill>
      </Header>

      <List>
        {rows.map((t) => (
          <Row
            key={t.label}
            data-done={t.done ? '1' : '0'}
            aria-label={`${t.label} — ${t.done ? 'Done' : 'Todo'}`}
          >
            <Icon aria-hidden>{t.icon}</Icon>
            <Label>
              {t.label} {t.must && <Must title="Required">*</Must>}
            </Label>
            <Status $done={t.done}>{t.done ? 'Done' : 'To Do...'}</Status>
          </Row>
        ))}

        {/* ✅ Only interactive piece */}
        <SrsBlock>
          <SrsUnlockCard />
        </SrsBlock>
      </List>
    </Wrap>
  );
};

/* ============================== styles ============================== */

const ROW_HEIGHT = 48; // uniform compact height

const Wrap = styled.section`
  display: grid;
  gap: 12px;
  width:95%;
  margin:auto;
`;

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
  @media (max-width: 480px) { font-size: 0.6rem; }
`;

const TodayPill = styled.span`
  font-size: 0.68rem;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.sheetBg};
  color: ${({ theme }) => theme.colors.textMuted};
  @media (max-width: 480px) { font-size: 0.5rem; }
`;

const List = styled.div`
  display: grid; gap: 8px;
`;

const Row = styled.div`
  /* display-only: remove pointer cues */
  cursor: default;
  user-select: none;

  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;

  min-height: ${ROW_HEIGHT}px;
  padding: 8px 12px;

  border: 1px dotted #434343ff;
  border-radius: 12px;

  /* Monotone surfaces: whole-row color flips by status */
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};

  /* subtle “pixel grid” overlay, toned down */
  &::after {
    content: "";
    position: absolute; inset: 0;
    background-image:
      linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px),
      linear-gradient(0deg,  rgba(255,255,255,.05) 1px, transparent 1px);
    background-size: 10px 10px;
    mix-blend-mode: overlay;
    opacity: .18;
    pointer-events: none;
    border-radius: inherit;
  }

  /* DONE → darker monotone block; TODO → lighter block */
  &[data-done='1']{
    background: ${({ theme }) => theme.colors.secondary};
    color: white;
  }

  /* remove hover/press effects: purely informative */
  transition: none;
  // box-shadow: 0 2px 0 #404040ff, 0 6px 0 rgba(0,0,0,.18);
`;

export const Icon = styled.div`
  width: 28px; height: 28px;
  display: grid; place-items: center;
  border: 1px solid #5a5a5aff; border-radius: 8px;
  background: ${({ theme }) => theme.colors.panel};
  font-size: 14px;
`;

const Label = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: .02em;
  @media (max-width: 480px) { font-size: 0.6rem; }
`;

const Must = styled.sup`
  margin-left: 6px;
  color: ${({ theme }) => theme.colors.accent ?? '#f59e0b'};
`;

const Status = styled.span<{ $done:boolean }>`
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: .06em;
  text-transform: uppercase;

  padding: 6px 10px;
  border-radius: 999px;
  // border: 2px solid #000;

  /* keep status pill monotone too */
  @media (max-width: 480px) { font-size: 0.6rem; }
`;

const SrsBlock = styled.div`
  /* spacing to align visually with rows; SRS remains interactive */
`;
