// ============================================================================
// 5) src/components/SrsUnlockCard.tsx - small tile for Home to start SRS
// ============================================================================
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/store/session';
import { jstTodayISO } from '@/lib/cache/lessons';
import { loadBootstrap } from '@/lib/bootstrap';
import styled, { css } from 'styled-components';

import { Icon } from '../home/DailyTasks';

export const SrsUnlockCard: React.FC = () => {
  const stage = useSession(s => s.stage);
  const startSrsFresher = useSession(s => (s as any).startSrsFresher);
  const examDoneForISO = useSession(s => s.examDoneForISO);
  const examTakenISO = useSession(s => (s as any).examTakenISO);
  const srsDoneForISO = useSession(s => (s as any).srsDoneForISO as string | null);
  const bootRevision = useSession(s => s.bootRevision);
  const srsDueToday = useSession(s => (s as any).srsDueToday as number[]);
  const todayISO = jstTodayISO();
  const nav = useNavigate();

  const examReady = useMemo(() => {
    // React immediately to session flags set after finishing the exam
    if (examTakenISO === todayISO) return true;
    if (examDoneForISO === todayISO) return true;
    // Fallback to bootstrap cache; include bootRevision to refresh memo when cache changes
    const boot = loadBootstrap();
    const taken = Array.isArray(boot?.lessonProgress?.examsStats)
      ? boot!.lessonProgress!.examsStats!.some((x: any) => String(x.examDate || '').slice(0, 10) === todayISO)
      : false;
    return taken;
  }, [examTakenISO, examDoneForISO, todayISO, bootRevision]);

  const finished = srsDoneForISO === todayISO || stage === 'srsSummary';
  const dueCount = Array.isArray(srsDueToday) ? srsDueToday.length : 0;
  const noDue = examReady && !finished && dueCount === 0;
  const unlocked = examReady && !finished && dueCount > 0;

  const onClick = async () => {
    if (finished) return;
    // always refresh to ensure latest due
    await useSession.getState().refreshSrsDueToday();
    const latest = (useSession.getState() as any).srsDueToday as number[];
    if (!examReady || !Array.isArray(latest) || latest.length === 0) {
      return; // locked or no reviews → do nothing
    }
    await startSrsFresher();
    try { if (location.pathname !== '/flashcards') nav('/flashcards'); } catch {}
  };

  return (
   <Section>
    
      <SrsCard
        onClick={onClick}
        disabled={finished || !examReady || noDue}
        $finished={finished}
        $unlocked={unlocked}
        $nodue={noDue}
        aria-label="SRS review card"
      >
        <Icon aria-hidden>🧠</Icon>
          <SrsTitle>{finished
              ? 'SRS complete for today.'
              : unlocked
              ? 'Ready — start today’s review.'
              : noDue
              ? 'No review lessons today.'
              : 'Finish today’s exam to unlock'}</SrsTitle>
         
          {/* <SrsDesc>
            {finished
              ? 'SRS complete for today.'
              : unlocked
              ? 'Ready — start today’s SRS review.'
              : noDue
              ? 'No review lessons today.'
              : 'Finish today’s exam to unlock SRS.'}
          </SrsDesc> */}

        <SrsStatus>
          {finished ? 'Done' : unlocked ? 'Start SRS 🧭→' : (noDue ? 'None' : '🗝️')}
        </SrsStatus>

      </SrsCard>
</Section>
  );
};

export const Section = styled.section`
  display: grid;
  gap: 16px;
`;

// 🎨 Gradient theme variants
const srsTheme = {
  locked: css` --c1:#4b5563; --c2:#1f2937; `,
  unlocked: css` --c1:#065f46; --c2:#10b981; `,
  nodue: css` --c1:#374151; --c2:#111827; `,
  finished: css` --c1:#0F172A; --c2:#1E293B; `,
};

export const SrsCard = styled.button<{ $finished?: boolean; $unlocked?: boolean; $nodue?: boolean }>`
  ${({ $finished, $unlocked, $nodue }) =>
    $finished ? srsTheme.finished : $unlocked ? srsTheme.unlocked : ($nodue ? srsTheme.nodue : srsTheme.locked)};
  font-family: inherit;
  position: relative;
  width: 100%;
  border: 1px solid #000;
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #fff;
  text-align: left;
  cursor: ${({ $finished, $unlocked }) =>
    $unlocked && !$finished ? 'pointer' : 'default'};

  background: linear-gradient(135deg, var(--c1), var(--c2));

  /* Pixel overlay */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px),
      linear-gradient(0deg, rgba(255,255,255,.08) 1px, transparent 1px);
    background-size: 10px 10px;
    mix-blend-mode: overlay;
    opacity: .35;
    pointer-events: none;
  }

  box-shadow: 0 2px 0 #000, 0 10px 0 rgba(0,0,0,.25);
  transition: transform .06s ease, box-shadow .06s ease, opacity .15s ease;

  &:active {
    transform: translate(3px,3px);
    box-shadow: 0 1px 0 #000, 0 6px 0 rgba(0,0,0,.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  @media (max-width: 640px){
    padding: 14px;
  }
`;

export const SrsTitle = styled.div`
  // font-weight: 700;
  font-size: .7rem;
  @media (max-width: 480px) { font-size: 0.6rem; }
`;

export const SrsDesc = styled.div`
  opacity: 0.85;
  font-size: 0.85rem;
  line-height: 1.5;
`;

export const SrsStatus = styled.div`
  font-size: .8rem;
  text-transform: uppercase;
  letter-spacing: .08em;
  justify-self: start;
  color: rgba(255,255,255,0.85);
  border: 2px solid rgba(255,255,255,0.15);
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(0,0,0,0.35);
`;
