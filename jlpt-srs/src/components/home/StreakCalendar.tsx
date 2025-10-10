import React from 'react';
import styled from 'styled-components';
import { StudyCalendar, type StudyRecord } from '@/components/home/StudyCalendar';

type Props = {
  streakStats: { current: number; longest: number; daysStudied: number };
  records: StudyRecord[];
  selectedDate: string | null;
  selectedRecord?: StudyRecord;
  onSelect: (dateISO: string, record: StudyRecord | undefined) => void;
};

export const StreakCalendar: React.FC<Props> = ({
  streakStats, records, selectedDate, selectedRecord, onSelect
}) => {
  return (
    <Section>
      <SectionHeader><h2>Streak & Calendar</h2></SectionHeader>

      <CalendarCard>
        <StreakRow>
          <StreakStat>
            <StatLabel>Current streak</StatLabel>
            <StatValue>{streakStats.current} day(s)</StatValue>
          </StreakStat>
          <StreakStat>
            <StatLabel>Days studied</StatLabel>
            <StatValue>{streakStats.daysStudied}</StatValue>
          </StreakStat>
          <StreakStat>
            <StatLabel>Longest streak</StatLabel>
            <StatValue>{streakStats.longest} day(s)</StatValue>
          </StreakStat>
        </StreakRow>

        <CalendarContent>
          <StudyCalendar
            records={records}
            selectedDate={selectedDate}
            onSelect={onSelect}
          />
          <DayDetails>
            {selectedRecord ? (
              <DetailGrid>
                <Detail>
                  <DetailLabel>Vocab attempts</DetailLabel>
                  <DetailValue>{selectedRecord.vocabAttempts}</DetailValue>
                </Detail>
                <Detail>
                  <DetailLabel>Vocab avg</DetailLabel>
                  <DetailValue>{selectedRecord.vocabAverage}%</DetailValue>
                </Detail>
                <Detail>
                  <DetailLabel>Grammar attempts</DetailLabel>
                  <DetailValue>{selectedRecord.grammarAttempts}</DetailValue>
                </Detail>
                <Detail>
                  <DetailLabel>Grammar avg</DetailLabel>
                  <DetailValue>{selectedRecord.grammarAverage}%</DetailValue>
                </Detail>
              </DetailGrid>
            ) : (
              <EmptyMessage>Select a day to view its stats.</EmptyMessage>
            )}
          </DayDetails>
        </CalendarContent>
      </CalendarCard>
    </Section>
  );
};

const Section = styled.section` display: grid; gap: 16px; `;
const SectionHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  h2 { margin: 0; font-size: 0.95rem; letter-spacing: 0.08em; text-transform: uppercase; }
`;
const CalendarCard = styled.div`
  border: 2px solid #000; border-radius: 16px; padding: 14px; background: rgba(255,255,255,0.95); display: grid; gap: 14px;
`;
const StreakRow = styled.div`
  display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  background: rgba(10, 16, 24, 0.92); color: #f8fafc; border-radius: 12px; border: 2px solid #000; padding: 12px;
  box-shadow: 0 2px 0 #000, 0 8px 0 rgba(0,0,0,0.22);
`;
const StreakStat = styled.div` display: grid; gap: 4px; `;
const StatLabel = styled.span` font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.75; `;
const StatValue = styled.span` font-family: ${({ theme }) => theme.fonts.heading}; font-size: 1rem; `;
const CalendarContent = styled.div` display: grid; gap: 12px; `;
const DayDetails = styled.div`
  border: 2px dashed rgba(0,0,0,0.18); border-radius: 12px; padding: 12px; min-height: 72px; display: grid; align-items: center;
`;
const DetailGrid = styled.div` display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); `;
const Detail = styled.div` display: grid; gap: 4px; `;
const DetailLabel = styled.span` font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.65; `;
const DetailValue = styled.span` font-family: ${({ theme }) => theme.fonts.heading}; `;
const EmptyMessage = styled.span` font-size: 0.78rem; opacity: 0.7; `;
