import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { loadBootstrap } from '@/lib/bootstrap';
import { jstTodayISO } from '@/helpers/dateV1';
import { hasExamForDate } from '@/helpers/todayV1';
import { useSession } from '@/store/session';
import { Btn } from '@/styles/Pages/FlashCardPage.styles';

type Props = {
  streakStats: { current: number; longest: number; daysStudied: number };
  selectedDate: string | null;
  onSelect: (dateISO: string) => void;
  onOpenModal?: (args: { title: string; msg: string }) => void;
};
// put this near the top of StreakCalendar.tsx
function localISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export const StreakCalendar: React.FC<Props> = ({ streakStats, selectedDate, onSelect, onOpenModal }) => {
  const navigate = useNavigate();
  const bootRevision = useSession(s => s.bootRevision);
  // buy modal handled by parent; local state removed

  // Load lesson progress from bootstrap
  const { completed, failed, current, todayISO, rawProgress } = useMemo(() => {
    const boot = loadBootstrap();
    const prog = boot?.lessonProgress ?? { completed: [], failed: [], current: [] };
    const today = jstTodayISO();

    const completedArr = Array.isArray(prog.completed)
      ? prog.completed.map((e: any) => ({
          lessonNo: Number(e.lessonNo),
          completedAt: String(e.completedAt ?? `${today}T00:00:00.000Z`),
        }))
      : [];

    const failedArr = Array.isArray(prog.failed)
      ? prog.failed.map((e: any) => ({
          lessonNo: Number(e.lessonNo),
          attemptedAt: String(e.attemptedAt ?? `${today}T00:00:00.000Z`),
        }))
      : [];

    const currentArr = Array.isArray(prog.current)
      ? prog.current.map((e: any) => ({
          lessonNo: Number(e.lessonNo ?? e),
          LessonDate: String(e.LessonDate ?? today),
        }))
      : [];

    return { completed: completedArr, failed: failedArr, current: currentArr, todayISO: today, rawProgress: prog };
  }, [bootRevision]);

  // Get chips for selected date
  const dayData = useMemo(() => {
    const day = (s?: string) => (s ? s.slice(0, 10) : '');
    const iso = selectedDate ?? '';
    
    const compNos = completed.filter(c => day(c.completedAt) === iso).map(c => c.lessonNo);
    const failNos = failed.filter(f => day(f.attemptedAt) === iso).map(f => f.lessonNo);
    const currNos = current.filter(c => day(c.LessonDate) === iso).map(c => c.lessonNo);
    
    return { compNos, failNos, currNos };
  }, [completed, failed, current, selectedDate]);

  // Navigate to review page
  const handleReviewLesson = (lessonNo: number) => {
    navigate(`/review-lesson/${lessonNo}`);
  };

  // Derive earliest and latest lesson dates for navigation constraints
  const { startISO, endISO } = useMemo(() => {
    const isos: string[] = [];
    for (const c of completed) isos.push(c.completedAt.slice(0,10));
    for (const f of failed)    isos.push(f.attemptedAt.slice(0,10));
    for (const cur of current) isos.push(cur.LessonDate.slice(0,10));
    if (!isos.length) return { startISO: todayISO, endISO: todayISO };
    const sorted = isos.sort();
    return { startISO: sorted[0], endISO: sorted[sorted.length - 1] };
  }, [completed, failed, current, todayISO]);

  // open buy prompt 
    const openBuy    = useCallback(() => onOpenModal?.({ title: 'Missed lessons', msg: `You have missed ${dayData.failNos.length}${selectedDate ? ` lesson(s) on ${selectedDate}` : ' lesson(s)'}.` }), [onOpenModal, dayData.failNos.length, selectedDate]);
  
  // Gate: require today's exam finished to allow missed purchases
  const examDoneToday = useMemo(() => {
    try { return hasExamForDate(rawProgress as any, todayISO) || (useSession.getState() as any)?.examTakenISO === todayISO; } catch { return false; }
  }, [rawProgress, todayISO]);

  return (
    // <Section>
      <Card>
        {/* Streak Stats */}
        <StreakRow>
        <ScrollCard $unlocked={streakStats.current > 0}>
          <Ribbon>Current streak</Ribbon>   
          <Description>
            <img src="/Icons/sword.svg" alt="Current Streak" width={50} height={50} />
          </Description>
          <Title>{streakStats.current} Days</Title>
        </ScrollCard>

        {/* Days studied */}
        <ScrollCard $unlocked={streakStats.daysStudied > 0}>
          <Ribbon>Days studied</Ribbon>  
          <Description>
            <img src="/Icons/bonsai.svg" alt="Days Studied" width={50} height={50} />
          </Description>
          <Title>{streakStats.daysStudied} Days</Title>
        </ScrollCard>

        {/* Longest streak */}
        <ScrollCard $unlocked={streakStats.longest > 0}>
          <Ribbon>Longest streak</Ribbon>  
          <Description>
            <img src="/Icons/scroll.svg" alt="Longest Streak" width={50} height={50} />
          </Description>
          <Title>{streakStats.longest} Days</Title>
        </ScrollCard>
      </StreakRow>

        {/* Calendar with navigation */}
        <CalendarSection>
          <MonthGrid 
            selectedDate={selectedDate} 
            onSelect={onSelect} 
            todayISO={todayISO} 
            startISO={startISO}
            endISO={endISO}
            completed={completed} 
            failed={failed} 
            current={current} 
          />
        </CalendarSection>

        {/* Day Details */}
        <DayDetails>
          {selectedDate ? (
            <ChipWrap>
              {/* Completed (green) */}
              {dayData.compNos.map(n => (
                <Chip key={`c-${n}`} $kind="completed" onClick={() => handleReviewLesson(n)} title={`Review ${n}`}>{n}</Chip>
              ))}

              {/* Current (orange) */}
              {dayData.currNos.map(n => (
                <Chip key={`u-${n}`} $kind="current" disabled title={`Current ${n}`}>{n}</Chip>
              ))}

              {/* Missed purchase CTA only (no red chips) */}
              {dayData.failNos.length > 0 && (
                examDoneToday ? (
                  <CtaButton
                    $variant="primary"
                    onClick={() => {
                      const pair = dayData.failNos.slice(0,2);
                      try {
                        window.dispatchEvent(new CustomEvent('koza:buy-missed', { detail: { lessonNos: pair } }));
                      } catch {
                        // fallback: navigate if event fails
                        navigate(`/wallet?source=missed&lessonNos=${pair.join(',')}`);
                      }
                    }}
                  >
                    Buy missed lessons ({dayData.failNos.slice(0,2).join(',')}) →
                  </CtaButton>
                ) : (
                  <Note>Finish today’s exam to purchase missed lessons.</Note>
                )
              )}

              {dayData.compNos.length + dayData.currNos.length + (dayData.failNos.length ? 1 : 0) === 0 && (
                <EmptyMsg>No lessons on this day.</EmptyMsg>
              )}
            </ChipWrap>
          ) : (
            <EmptyMsg>Select a day to view its lessons.</EmptyMsg>
          )}
        </DayDetails>
      </Card>
      // {/* buy prompt handled by parent via onOpenModal */}
    // </Section>
  );
};

// Simple month grid component
const MonthGrid: React.FC<{
  selectedDate: string | null;
  onSelect: (dateISO: string) => void;
  todayISO: string;
  startISO: string;
  endISO: string;
  completed: any[];
  failed: any[];
  current: any[];
}> = ({ selectedDate, onSelect, todayISO, startISO, endISO, completed, failed, current }) => {
  // View date state for navigation
  const [viewDate, setViewDate] = useState(() => new Date(todayISO));

  // Month label for display
  const monthLabel = useMemo(() => {
    return viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }, [viewDate]);

  // Navigation helpers
  const firstDayOfMonth = useCallback((d: Date) => new Date(d.getFullYear(), d.getMonth(), 1), []);
  const toDate = useCallback((isoStr: string) => {
    const [Y, M, D] = isoStr.split('-').map(Number);
    return new Date(Y, M-1, D);
  }, []);
  const shiftMonth = useCallback((date: Date, delta: number) => {
    return new Date(date.getFullYear(), date.getMonth() + delta, 1);
  }, []);

  const startDate = useMemo(() => toDate(startISO), [startISO, toDate]);
  const endDate = useMemo(() => toDate(endISO), [endISO, toDate]);
  const endDatePlusOneMonth = useMemo(() => shiftMonth(endDate, 1), [endDate, shiftMonth]);

  const canPrev = firstDayOfMonth(viewDate) > firstDayOfMonth(startDate);
  const canNext = firstDayOfMonth(viewDate) < firstDayOfMonth(endDatePlusOneMonth);

  const goPrev = useCallback(() => {
    if (canPrev) setViewDate(prev => shiftMonth(prev, -1));
  }, [canPrev, shiftMonth]);
  
  const goNext = useCallback(() => {
    if (canNext) setViewDate(prev => shiftMonth(prev, 1));
  }, [canNext, shiftMonth]);
  const month = useMemo(() => {
    const year = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const d1 = new Date(year, m, 1);
    const startIdx = d1.getDay(); // 0=Sun
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    
    const cells: Array<{ iso: string | null; day: number | null }> = [];
    for (let i = 0; i < startIdx; i++) cells.push({ iso: null, day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      // const iso = new Date(year, m, d).toISOString().slice(0, 10);
      const iso = localISO(new Date(year, m, d));
      cells.push({ iso, day: d });
    }
    while (cells.length % 7) cells.push({ iso: null, day: null });
    
    return { cells };
  }, [viewDate]);

  return (
    <Section>
      {/* Month navigation */}
      <CalendarHeader>
        <NavBtn disabled={!canPrev} onClick={goPrev}>◀</NavBtn>
        <MonthTitle>{monthLabel}</MonthTitle>
        <NavBtn disabled={!canNext} onClick={goNext}>▶</NavBtn>
      </CalendarHeader>

      <Grid>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(h => (
          <Head key={h}>{h}</Head>
        ))}
        {month.cells.map((c, i) => {
          const isBeforeStart = c.iso && c.iso < startISO;
          const isDisabled = !c.iso || isBeforeStart;
          const hasCompleted = c.iso && !isBeforeStart && completed.some(x => x.completedAt.slice(0, 10) === c.iso);
          const hasFailed = c.iso && !isBeforeStart && failed.some(x => x.attemptedAt.slice(0, 10) === c.iso);
          const hasCurrent = c.iso && !isBeforeStart && current.some(x => x.LessonDate.slice(0, 10) === c.iso);
          
          return (
            <Cell
              key={i}
              // $inactive={isDisabled}
              $selected={c.iso === selectedDate}
              $hasData={!!(hasCompleted || hasFailed || hasCurrent)}
              onClick={() => !isDisabled && c.iso && onSelect(c.iso)}
            >
              {c.day}
              {c.iso && !isBeforeStart && (
                <Dots>
                  {hasCompleted && <Dot $kind="completed" />}
                  {hasFailed && <Dot $kind="failed" />}
                  {hasCurrent && <Dot $kind="current" />}
                </Dots>
              )}
            </Cell>
          );
        })}
      </Grid>
    </Section>
  );
};

/* =================== Styles =================== */

const Section = styled.section`
  display: grid;
  gap: 16px;
  width: 100%;
  overflow-x: hidden;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const NavBtn = styled.button<{disabled?: boolean}>`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 2px solid ${({theme})=>theme.colors.pixelBorder};
  background: ${({theme})=>theme.colors.panel};
  color: ${({theme})=>theme.colors.text};
  font-size: 16px;
  cursor: ${({disabled}) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({disabled}) => disabled ? 0.4 : 1};
`;

const MonthTitle = styled.div`
  font-family: ${({theme})=>theme.fonts.heading};
  letter-spacing: .06em;
  text-transform: uppercase;
  font-size: 12px;
`;

const Card = styled.div`
  ${({ theme }) => `
    border-radius: 16px;
    padding: 14px;
    color: ${theme.colors.text};
    display: grid;
    gap: 14px;
  `}
  width: 100%;
  box-sizing: border-box;
  overflow: hidden; /* clip any internal hover scaling */
`;
const Description = styled.div`
  margin: 15px 0 15px;
`;
const StreakRow = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
`;
const Title = styled.div` margin-top:6px; font-family:${({theme})=>theme.fonts.heading}; font-size:13px; `;

const StatCard = styled.div`
  position: relative;
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  border-radius: 14px;
  padding: 24px 14px 16px;
  text-align: center;
  background: ${({ theme }) => theme.colors.panel};
`;

const Ribbon = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  border-radius: 999px;
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.gold}, ${({ theme }) => theme.colors.accent});
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: 10px;
  letter-spacing: .08em;
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const CalendarSection = styled.div`
  background: ${({ theme }) => theme.colors.panel}22;
  border-radius: 12px;
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 520px) {
    padding: 8px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 520px) {
    gap: 4px;
  }
`;

const Head = styled.div`
  opacity: 0.7;
  text-align: center;
  font-size: 12px;
  padding: 4px;
  @media (max-width: 520px) {
    font-size: 11px;
    padding: 2px;
  }
`;

const Cell = styled.button<{ $inactive?: boolean; $selected?: boolean; $hasData?: boolean }>`
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  background: ${({ theme, $selected, $hasData }) => 
    $selected ? theme.colors.primary : 
    $hasData ? theme.colors.panel : 
    theme.colors.sheetBg};
  opacity: ${({ $inactive }) => ($inactive ? 0.3 : 1)};
  color: ${({ theme, $selected }) => ($selected ? theme.colors.onPrimary : theme.colors.text)};
  cursor: ${({ $inactive }) => ($inactive ? 'default' : 'pointer')};
  padding: 4px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s;
  box-sizing: border-box; /* include border/padding inside track width */

  &:hover:not(:disabled) {
    background: ${({ theme, $selected }) => ($selected ? theme.colors.primary : theme.colors.panel)};
  }
  @media (max-width: 520px) {
    padding: 2px;
    font-size: 12px;
    border-width: 1px;
  }
`;
const ScrollCard = styled.div<{ $unlocked: boolean }>`
  position: relative;
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  border-radius: 14px;
  padding: 16px 14px 16px;
  min-height: 100px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
  color: ${({ $unlocked, theme }) => ($unlocked ? theme.colors.text : theme.colors.textMuted)};
  background:
    radial-gradient(circle at top, rgba(255,255,255,0.10), rgba(255,255,255,0.04)),
    ${({ $unlocked, theme }) => ($unlocked ? theme.colors.panel : theme.colors.sheetBg)};
  filter: ${({ $unlocked }) => ($unlocked ? 'none' : 'grayscale(0.6)')};
`;


const Dots = styled.div`
  display: flex;
  gap: 3px;
`;

const Dot = styled.span<{ $kind: 'completed' | 'failed' | 'current' }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${({ $kind, theme }) =>
    $kind === 'completed' ? theme.colors.success :
    $kind === 'failed' ? theme.colors.danger :
    theme.colors.warning};
`;

const DayDetails = styled.div`
  ${({ theme }) => `
    border: 2px dashed ${theme.colors.borderDark};
    border-radius: 12px;
    padding: 12px;
    min-height: 72px;
    display: grid;
    align-items: center;
    background: ${theme.colors.panel}11;
  `}
  width: 100%;
  box-sizing: border-box;
`;

const ChipWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
`;

const Chip = styled.button<{ $kind: 'completed' | 'failed' | 'current' }>`
  min-width: 32px;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  font-weight: 700;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  /* Monotone, theme-aligned backgrounds */
  background: ${({ $kind, theme }) =>
    $kind === 'completed' ? theme.colors.success :
    $kind === 'failed' ? theme.colors.danger :
    theme.colors.primary};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    filter: brightness(0.95);
  }
  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.onPrimary}55;
    outline-offset: 2px;
  }
`;

const EmptyMsg = styled.span`
  font-size: 0.85rem;
  opacity: 0.7;
  text-align: center;
`;

// Keep the CTA within the DayDetails width and allow wrapping to avoid layout expansion
const CtaButton = styled(Btn)`
  max-width: 100%;
  white-space: normal;
  text-align: center;
  align-self: stretch;
  display: inline-block;
`;

const Note = styled.span`
  display: block;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
`;
export default StreakCalendar;
