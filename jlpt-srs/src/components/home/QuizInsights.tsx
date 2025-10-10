import React from 'react';
import styled from 'styled-components';
import type { QuizAttemptStat } from '@/lib/home/types';

type Props = {
  vocabSummary: Pick<QuizAttemptStat, 'score' | 'averageTime'> | null;
  grammarSummary: Pick<QuizAttemptStat, 'score' | 'averageTime'> | null;
  vocabAttempts: number;
  grammarAttempts: number;
  onOpenStats: (type: 'vocab' | 'grammar') => void;
  formatScore: (v?: number | null | undefined) => string;
  formatAverageTime: (v?: number | null | undefined) => string;
};

export const QuizInsights: React.FC<Props> = ({
  vocabSummary,
  grammarSummary,
  vocabAttempts,
  grammarAttempts,
  onOpenStats,
  formatScore,
  formatAverageTime,
}) => {
  return (
    <Section>
      <SectionHeader><h2>Quiz Insights</h2></SectionHeader>
      <QuizGrid>
        <QuizCard type="button" onClick={() => onOpenStats('vocab')}>
          <QuizBadge>Vocabulary</QuizBadge>
          <QuizValue>{formatScore(vocabSummary?.score)}</QuizValue>
          <QuizMeta>
            <span>{vocabAttempts} attempt(s)</span>
            <span>Avg time {formatAverageTime(vocabSummary?.averageTime)}</span>
          </QuizMeta>
        </QuizCard>

        <QuizCard
          type="button"
          onClick={() => onOpenStats('grammar')}
          disabled={grammarAttempts === 0}
        >
          <QuizBadge>Grammar</QuizBadge>
          <QuizValue>{formatScore(grammarSummary?.score)}</QuizValue>
          <QuizMeta>
            <span>{grammarAttempts} attempt(s)</span>
            <span>
              {grammarAttempts ? `Avg time ${formatAverageTime(grammarSummary?.averageTime)}` : 'No attempts yet'}
            </span>
          </QuizMeta>
        </QuizCard>
      </QuizGrid>
    </Section>
  );
};

const Section = styled.section` display: grid; gap: 16px; `;
const SectionHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  h2 { margin: 0; font-size: 0.95rem; letter-spacing: 0.08em; text-transform: uppercase; }
`;
const QuizGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;
`;
const QuizCard = styled.button`
  border: 2px solid #000; border-radius: 16px; padding: 16px; background: rgba(12, 21, 33, 0.92); color: #fff;
  display: grid; gap: 10px; align-content: start; text-align: left; cursor: pointer; transition: transform 0.1s ease;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &:active:not(:disabled) { transform: translate(3px, 3px); }
`;
const QuizBadge = styled.span` font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.75; `;
const QuizValue = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading}; font-size: clamp(1.6rem, 3vw, 1.9rem);
`;
const QuizMeta = styled.div` font-size: 0.75rem; display: grid; gap: 4px; opacity: 0.85; `;
