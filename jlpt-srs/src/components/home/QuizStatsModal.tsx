import React from 'react';
import styled from 'styled-components';
import type { QuizAttemptStat } from '@/lib/home/types';
import { formatAverageTime, formatScore } from '@/lib/home/insights';

type Props = {
  open: boolean;
  title: string;
  stats: QuizAttemptStat[];
  onClose: () => void;
};

export const QuizStatsModal: React.FC<Props> = ({ open, title, stats, onClose }) => {
  if (!open) return null;

  const handleBackdrop = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <ModalBackdrop onMouseDown={handleBackdrop}>
      <ModalCard>
        <ModalHeader>
          <h3>{title}</h3>
          <CloseModalButton type="button" onClick={onClose} aria-label="Close stats modal">✖</CloseModalButton>
        </ModalHeader>

        {stats.length ? (
          <ModalTable>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Score</th>
                <th>Average time</th>
                <th>Questions</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((attempt, index) => (
                <tr key={attempt.id}>
                  <td>{index + 1}</td>
                  <td>{attempt.dateISO}</td>
                  <td>{formatScore(attempt.score)}</td>
                  <td>{formatAverageTime(attempt.averageTime)}</td>
                  <td>{attempt.questionCount}</td>
                  <td>{attempt.passed ? 'Passed' : 'Retry'}</td>
                </tr>
              ))}
            </tbody>
          </ModalTable>
        ) : (
          <ModalEmpty>No quiz attempts recorded yet.</ModalEmpty>
        )}
      </ModalCard>
    </ModalBackdrop>
  );
};

const ModalBackdrop = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.72); display: grid; place-items: center; padding: 24px; z-index: 120;
`;
const ModalCard = styled.div`
  width: min(600px, 94vw); border: 2px solid #000; border-radius: 20px; background: ${({ theme }) => theme.colors.sheetBg};
  box-shadow: 0 28px 52px rgba(0,0,0,0.4); display: grid; gap: 18px; padding: 24px;
`;
const ModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  h3 { margin: 0; font-family: ${({ theme }) => theme.fonts.heading}; letter-spacing: 0.08em; text-transform: uppercase; }
`;
const CloseModalButton = styled.button`
  width: 36px; height: 36px; border-radius: 12px; border: 2px solid #000; background: rgba(255,255,255,0.9);
  font-size: 18px; display: grid; place-items: center; cursor: pointer;
`;
const ModalTable = styled.table`
  width: 100%; border-collapse: collapse; font-size: 0.82rem;
  th, td { border: 1px solid rgba(0,0,0,0.15); padding: 8px 10px; text-align: left; }
  th { text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.06em; background: rgba(0,0,0,0.04); }
`;
const ModalEmpty = styled.div` font-size: 0.85rem; opacity: 0.75; `;
