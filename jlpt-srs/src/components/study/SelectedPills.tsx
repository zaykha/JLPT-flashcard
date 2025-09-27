// TODO: Selected topic pills row
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Pill } from '@/components/ui/Pill';
import { useTopics } from '@/store/topics';

const Row = styled.div`
  display:flex; flex-wrap: wrap; gap:.5rem;
`;

type Props = {
  // map topic key -> display title (e.g., from your groups)
  titleByKey: Record<string, string>;
};

export const SelectedPills: React.FC<Props> = ({ titleByKey }) => {
  const selected = useTopics(s => s.selected);
  const keys = Array.from(selected);

  // if none selected, treat as "All"
  if (keys.length === 0) {
    return (
      <Row>
        <Pill active>All topics</Pill>
      </Row>
    );
  }

  const { head, moreCount } = useMemo(() => {
    const head = keys.slice(0, 3);
    const moreCount = Math.max(0, keys.length - 3);
    return { head, moreCount };
  }, [keys]);

  return (
    <Row>
      {head.map(k => (
        <Pill key={k} active>
          {titleByKey[k] ?? k}
        </Pill>
      ))}
      {moreCount > 0 && (
        <Pill>+{moreCount} more</Pill>
      )}
    </Row>
  );
};
