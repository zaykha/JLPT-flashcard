// TODO: Topic card with progress bar & icon
import React from 'react';
import styled from 'styled-components';
import { Card } from '@/components/ui/Card';
import { TopicIcon } from '@/components/ui/TopicIcon';
import type { ProgressSegment } from '@/components/ui/ProgressBar';
import { useTopics } from '@/store/topics';
import type { ProgressBuckets } from '@/types/vocab';
import { ProgressBar } from '../ui/ProgressBar';

const Wrap = styled(Card)<{selected:boolean}>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: .75rem 1rem;
  align-items: center;
  padding: .9rem 1rem;
  border: 1.5px solid ${({selected}) => selected ? 'var(--accent)' : 'var(--border)'};
  background: ${({selected}) => selected ? 'rgba(16,185,129,.08)' : 'var(--panel)'};
  transition: border-color .15s ease, background .15s ease;
  cursor: pointer;
`;

const Title = styled.div`
  display:flex; align-items:center; gap:.5rem;
  font-weight: 700;
`;

const Count = styled.div`
  font-size: .8rem;
  color: var(--muted);
  text-align: right;
`;

type Props = {
  keyName: string;          // topic key
  title: string;
  icon?: string;            // TopicIcon name
  buckets: ProgressBuckets;
  onClick?: () => void;
};

export const TopicCard: React.FC<Props> = ({ keyName, title, icon='bookmark', buckets, onClick }) => {
  // Selected state not implemented in store; render unselected styling.
  const selected = false;

  const segments: ProgressSegment[] = [
    { key:'new', label:'New', count: buckets.newCount },
    { key:'due', label:'Due', count: buckets.dueCount },
    { key:'s0',  label:'1–3d', count: buckets.byStep[0] ?? 0 },
    { key:'s1',  label:'7d',   count: buckets.byStep[1] ?? 0 },
    { key:'s2',  label:'14d',  count: buckets.byStep[2] ?? 0 },
    { key:'s3',  label:'30d',  count: buckets.byStep[3] ?? 0 },
    { key:'future', label:'Future', count: buckets.futureCount },
  ];

  const total = segments.reduce((a,s)=>a+s.count,0);

  return (
    <Wrap onClick={onClick} selected={selected} role="button" aria-pressed={selected}>
      <TopicIcon name={icon} size={20} />
      <div>
        <Title>{title}</Title>
        <div style={{marginTop:'.5rem'}}>
          <ProgressBar segments={segments} total={total} compact />
        </div>
      </div>
      <Count>{total} words</Count>
    </Wrap>
  );
};
