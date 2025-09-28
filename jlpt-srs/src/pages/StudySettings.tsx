// TODO: Study settings page
import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useSRS } from '@/store/srs';
import { useTopics } from '@/store/topics';
// import { useSession } from '@/store/session';
import { SelectedPills } from '@/components/study/SelectedPills';
import { WordsPerDay } from '@/components/study/WordsPerDay';
// import { TopicCard } from '@/components/study/TopicCard';
import { Button } from '@/components/ui/Button';

const Page = styled.div`
  max-width: 960px; margin: 0 auto; padding: 1rem;
  display: grid; gap: 1rem;
`;

const Header = styled.div`
  display:grid; gap:.75rem;
`;

// const Grid = styled.div`
//   display:grid; gap:.8rem;
// `;

export const StudySettings: React.FC = () => {
  const srsHydrated = useSRS(s => s.hydrated);
  const hydrateSrs = useSRS(s => s.hydrate);
  // const srsMap = useSRS(s => s.map);

  const topicsHydrated = useTopics(s => s.hydrated);
  const hydrateTopics = useTopics(s => s.hydrate);

  const groups = useTopics(s => s.groups);
  // const toggleTopic = useTopics(s => s.toggleTopic);
  // const selected = useTopics(s => s.selected);
  // const perDay = useTopics(s => s.perDay);
  // const allWords = useTopics(s => s.allWords);
  // const progressByTopic = useTopics(s => s.progressByTopic);

  // const setToday = useSession(s => s.setToday);
  // const setStage = useSession(s => s.setStage);
  // const buildToday = useSession(s => s.buildToday);

  // hydrate persisted stores once
  useEffect(() => { if (!srsHydrated) hydrateSrs(); }, [srsHydrated, hydrateSrs]);
  useEffect(() => { if (!topicsHydrated) hydrateTopics(); }, [topicsHydrated, hydrateTopics]);

  // title map for SelectedPills
  const titleByKey = useMemo(() => {
    const m: Record<string,string> = {};
    groups.forEach(g => m[g.key] = g.title);
    return m;
  }, [groups]);

  // derive per-topic progress from SRS map
  // const progress = useMemo(() => progressByTopic(srsMap), [progressByTopic, srsMap]);

  // function startStudy() {
  //   const today = buildToday(allWords, selected, perDay, srsMap);
  //   setToday(today);
  //   setStage('studying'); // you’ll route to /study or similar
  // }

  return (
    <Page>
      <Header>
        <SelectedPills titleByKey={titleByKey} />
        <WordsPerDay />
      </Header>

      {/* <Grid>
        {groups.map(g => (
          <TopicCard
            key={g.key}
            keyName={g.key}
            title={g.title}
            icon={g.key}                  // icon name == topic key (fallback inside TopicIcon)
            buckets={progress[g.key] ?? { newCount: g.items.length, dueCount:0, futureCount:0, byStep:{} }}
            onClick={() => toggleTopic(g.key)}
          />
        ))}
      </Grid> */}

      <div style={{display:'flex', gap:'.75rem', marginTop:'.5rem'}}>
        <Button variant="ghost" onClick={() => {/* maybe Clear selection */}}>
          Reset
        </Button>
        {/* <Button variant="primary" onClick={startStudy}>
          Start study
        </Button> */}
      </div>
    </Page>
  );
};
