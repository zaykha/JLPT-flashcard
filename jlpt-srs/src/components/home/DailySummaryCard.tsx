import React from 'react';
import styled from 'styled-components';

type Props = {
  lessonId: string | null;
  quizAttempt: number;
  completed: boolean;
  missedDays: number;
  onResume: () => void;
  onStart: () => void;
};

export const DailySummaryCard: React.FC<Props> = ({
  lessonId,
  quizAttempt,
  completed,
  missedDays,
  onResume,
  onStart,
}) => {
  return (
    <Wrap>
      <Heading>Today&apos;s Lesson</Heading>
      <MetaRow>
        <MetaItem>
          <Label>Lesson ID</Label>
          <Value>{lessonId ?? '—'}</Value>
        </MetaItem>
        <MetaItem>
          <Label>Quiz Attempts</Label>
          <Value>{quizAttempt}</Value>
        </MetaItem>
        <MetaItem>
          <Label>Status</Label>
          <Value>{completed ? 'Completed' : 'In Progress'}</Value>
        </MetaItem>
      </MetaRow>

      {missedDays > 0 && (
        <Nudge>You haven&apos;t reviewed for {missedDays} day{missedDays > 1 ? 's' : ''}. Continue your streak?</Nudge>
      )}

      <Actions>
        <MainButton onClick={onResume}>Resume Study</MainButton>
        <GhostButton onClick={onStart}>Start Next Lesson</GhostButton>
      </Actions>
    </Wrap>
  );
};

const Wrap = styled.section`
  border: 2px solid #000;
  border-radius: 18px;
  padding: 18px;
  background: rgba(255,255,255,0.86);
  display: grid;
  gap: 14px;
`;

const Heading = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 15px;
  letter-spacing: .08em;
  text-transform: uppercase;
`;

const MetaRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
`;

const MetaItem = styled.div`
  display: grid;
  gap: 4px;
`;

const Label = styled.span`
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Value = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1rem;
`;

const Nudge = styled.div`
  padding: 10px 12px;
  border-radius: 12px;
  border: 2px dashed rgba(15,23,42,0.25);
  font-size: 0.78rem;
  background: rgba(249,115,22,0.12);
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const MainButton = styled.button`
  padding: 12px 18px;
  border-radius: 12px;
  border: 2px solid #000;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-family: ${({ theme }) => theme.fonts.heading};
  letter-spacing: .06em;
  text-transform: uppercase;
  cursor: pointer;
`;

const GhostButton = styled(MainButton)`
  background: ${({ theme }) => theme.colors.secondary};
`;
