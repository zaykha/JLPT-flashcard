// TODO: Words-per-day input (pill)
import React from 'react';
import styled from 'styled-components';
import { Pill } from '@/components/ui/Pill';
import { useTopics } from '@/store/topics';

const Wrap = styled.div`
  display:flex; align-items:center; gap:.5rem; flex-wrap:wrap;
`;

const Input = styled.input`
  width: 4.5rem;
  padding: .35rem .5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,.06);
  color: var(--text);
  font-weight: 700;
  text-align: center;
`;

export const WordsPerDay: React.FC = () => {
  const perDay = useTopics(s => s.perDay);
  const setPerDay = useTopics(s => s.setPerDay);

  return (
    <Wrap>
      <Pill>Words / day</Pill>
      <Input
        type="number"
        min={1}
        max={200}
        value={perDay}
        onChange={(e)=> setPerDay(parseInt(e.target.value || '1', 10))}
        aria-label="Words per day"
      />
    </Wrap>
  );
};
