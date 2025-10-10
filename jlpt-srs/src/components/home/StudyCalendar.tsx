import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

type StudyRecord = {
  dateISO: string;
  vocabAttempts: number;
  vocabAverage: number;
  grammarAttempts: number;
  grammarAverage: number;
  completed: boolean;
};

type Props = {
  records: StudyRecord[];
  selectedDate: string | null;
  onSelect: (dateISO: string, record: StudyRecord | undefined) => void;
};

export const StudyCalendar: React.FC<Props> = ({ records, selectedDate, onSelect }) => {
  const [viewDate, setViewDate] = useState(() => new Date());

  const recordMap = useMemo(() => {
    const map = new Map<string, StudyRecord>();
    for (const rec of records) {
      map.set(rec.dateISO, rec);
    }
    return map;
  }, [records]);

  const grid = useMemo(() => buildCalendarGrid(viewDate), [viewDate]);
  const monthLabel = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <Wrap>
      <CalendarHeader>
        <NavBtn onClick={() => setViewDate(prev => shiftMonth(prev, -1))}>◀</NavBtn>
        <MonthTitle>{monthLabel}</MonthTitle>
        <NavBtn onClick={() => setViewDate(prev => shiftMonth(prev, 1))}>▶</NavBtn>
      </CalendarHeader>

      <Grid>
        {WEEK_LABELS.map(label => (
          <Weekday key={label}>{label}</Weekday>
        ))}

        {grid.map(day => {
          const rec = recordMap.get(day.dateISO);
          const state = deriveState(rec, day.isCurrentMonth, day.dateISO);
          const isSelected = selectedDate === day.dateISO;

          return (
            <Cell
              key={day.dateISO}
              $state={state}
              $selected={isSelected}
              onClick={() => {
                if (state === 'disabled') return;
                onSelect(day.dateISO, rec);
              }}
            >
              <span>{day.day}</span>
            </Cell>
          );
        })}
      </Grid>

      <Legend>
        <LegendItem $color="var(--calendar-complete)">Completed</LegendItem>
        <LegendItem $color="var(--calendar-partial)">In progress</LegendItem>
        <LegendItem $color="var(--calendar-missed)">Missed</LegendItem>
        <LegendItem $color="var(--calendar-future)">Upcoming</LegendItem>
      </Legend>
    </Wrap>
  );
};

const WEEK_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const Wrap = styled.div`
  --calendar-complete: linear-gradient(135deg, #22c55e, #0ea5e9);
  --calendar-partial: linear-gradient(135deg, #f59e0b, #f97316);
  --calendar-missed: linear-gradient(135deg, #f87171, #b91c1c);
  --calendar-future: linear-gradient(135deg, rgba(148,163,184,0.45), rgba(71,85,105,0.3));
  background: rgba(255,255,255,0.8);
  border: 2px solid #000;
  border-radius: 16px;
  padding: 14px;
  display: grid;
  gap: 10px;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NavBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 2px solid #000;
  background: #fff;
  font-size: 16px;
  cursor: pointer;
`;

const MonthTitle = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  letter-spacing: .06em;
  text-transform: uppercase;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
`;

const Weekday = styled.div`
  text-align: center;
  font-size: 0.62rem;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Cell = styled.button<{ $state: CellState; $selected: boolean }>`
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  border: 2px solid #000;
  background: ${({ $state }) =>
    $state === 'complete' ? 'var(--calendar-complete)' :
    $state === 'partial' ? 'var(--calendar-partial)' :
    $state === 'missed' ? 'var(--calendar-missed)' :
    $state === 'future' ? 'var(--calendar-future)' : 'transparent'};
  color: ${({ $state }) => ($state === 'disabled' ? 'rgba(0,0,0,0.2)' : '#fff')};
  display: grid;
  place-items: center;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.6rem;
  cursor: ${({ $state }) => ($state === 'disabled' ? 'default' : 'pointer')};
  opacity: ${({ $state }) => ($state === 'disabled' ? 0.4 : 1)};
  box-shadow: ${({ $selected }) => ($selected ? '0 0 0 3px rgba(255,255,255,0.85)' : 'none')};
`;

const Legend = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.62rem;
  color: ${({ theme }) => theme.colors.text};
`;

const LegendItem = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  &::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 3px;
    border: 1px solid #000;
    background: ${({ $color }) => $color};
  }
`;

type CellState = 'complete' | 'partial' | 'missed' | 'future' | 'disabled';

type GridDay = {
  dateISO: string;
  day: number;
  isCurrentMonth: boolean;
};

function buildCalendarGrid(viewDate: Date): GridDay[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  const grid: GridDay[] = [];

  for (let i = 0; i < totalCells; i += 1) {
    const dayOffset = i - startWeekday + 1;
    const date = new Date(year, month, dayOffset);
    grid.push({
      dateISO: date.toISOString().slice(0, 10),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
    });
  }

  return grid;
}

function shiftMonth(date: Date, delta: number): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + delta, 1);
}

function deriveState(record: StudyRecord | undefined, isCurrentMonth: boolean, dateISO: string): CellState {
  if (!isCurrentMonth) return 'disabled';
  if (!record) {
    const todayISO = new Date().toISOString().slice(0, 10);
    if (dateISO > todayISO) return 'future';
    return 'missed';
  }
  if (record.completed) return 'complete';
  return record.vocabAttempts > 0 || record.grammarAttempts > 0 ? 'partial' : 'missed';
}

export type { StudyRecord };
