import React, { useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { useSession } from '@/store/session';
import type { SessionState, Stage } from '@/types/session';
import { useShallow } from 'zustand/react/shallow';
import { jstTodayISO } from '@/helpers/dateV1';
import { useIsMobile } from '@/hooks/useIsMobile';

// type StageKey = 'studying' | 'quiz' | 'summary' | 'grammar' | 'grammarQuiz' | 'grammarSummary' | 'homePage' | 'settings';

type Props = {
  onStart: () => void;
  lessonNo?: number;
};

// Only list the real stages you support. No 'homePage'.
const ALLOWED_STAGES = [
  'studying', 'quiz', 'summary',
  'grammar', 'grammarQuiz', 'grammarSummary',
  'examFresher', 'examSummary',
  'srsFresher', 'srsExam', 'srsSummary',
  'settings', 'buy',
] as const;
function getCtas(
  stageKey: (typeof ALLOWED_STAGES)[number],
  quizMode: string,
  finishedToday: boolean
): { primary: string; hint: string } {
  // Finished day → prefer Buy (unless we're explicitly in exam/srs routes)
  if (
    finishedToday &&
    !['examFresher', 'examSummary', 'buy'].includes(stageKey)
  ) {
    return { primary: 'Buy', hint: 'Or wait for Free Lessons tomorrow' };
  }

  switch (stageKey) {
    // --- Exam flow
    case 'examFresher':
      return { primary: 'Review', hint: 'Two lessons done — take today’s exam' };
    case 'examSummary':
      return { primary: 'View Summary', hint: 'Review your exam performance' };

    // --- SRS flow handled by SrsUnlockCard, not here
    case 'srsFresher':
    case 'srsExam':
    case 'srsSummary':
      return { primary: finishedToday ? 'Buy' : 'Study', hint: finishedToday ? 'Or wait for Free Lessons tomorrow' : 'Click to begin or continue' };

    // --- Grammar
    case 'grammar':
      return { primary: 'Study Grammar', hint: 'Learn the grammar points' };
    case 'grammarQuiz':
      return { primary: 'Resume Grammar Quiz', hint: 'Continue the grammar quiz' };
    case 'grammarSummary':
      return { primary: 'Grammar Summary', hint: 'Review your grammar results' };

    // --- Quiz (exam vs normal)
    case 'quiz':
      if (quizMode === 'exam')  return { primary: 'Resume Exam', hint: 'Continue today’s exam' };
      if (quizMode === 'srs')   return { primary: 'Resume SRS',  hint: 'Continue your SRS review' };
      return { primary: 'Resume Quiz', hint: 'Continue your quiz' };

    // --- Buy gate
    case 'buy':
      return { primary: 'Buy', hint: 'Or wait for Free Lessons tomorrow' };

    // --- Defaults
    case 'studying':
    case 'summary':
    case 'settings':
    default:
      return { primary: 'Study', hint: 'Click to begin or continue' };
  }
}

const LABEL_MAP: Record<(typeof ALLOWED_STAGES)[number], string> = {
  studying:       'Start Studying',
  quiz:           'Vocab quiz',
  summary:        'Start grammar',
  grammar:        'Study grammar',
  grammarQuiz:    'Grammar quiz',
  grammarSummary: 'Lesson 2 of 2',
  examFresher:    'Exam preparation',
  examSummary:    'Exam summary',
  srsFresher:     'Completed',
  srsExam:        'Completed',
  srsSummary:     'Completed',
  settings:       'Start vocabulary',
  buy:            'Buy more lessons',
};

// Map for the left title line
export function leftTitleFor(stage: Stage | string, lessonNo?: number | null): string {
  switch (stage) {
    case 'studying':       return `Lesson ${lessonNo ?? '—'}`;
    case 'quiz':           return `Lesson ${lessonNo ?? '—'}`;
    case 'summary':        return `Lesson ${lessonNo ?? '—'}`;
    case 'grammar':        return `Lesson ${lessonNo ?? '—'}`;
    case 'grammarQuiz':    return `Lesson ${lessonNo ?? '—'}`;
    case 'grammarSummary': return `Lesson ${lessonNo ?? '—'}`;

    case 'examFresher':    return 'Refresh';
    case 'examSummary':    return 'Exam Complete';

    case 'srsFresher':     return 'SRS Review';
    case 'srsExam':        return 'SRS Review';
    case 'srsSummary':     return 'SRS Complete';

    case 'settings':       return `Lesson ${lessonNo ?? '—'}`;
    case 'buy':            return 'Completed';
    case 'homePage':       return `Lesson ${lessonNo ?? '—'}`;

    default:               return `Lesson ${lessonNo ?? '—'}`;
  }
}
function getPillText(stageKey: (typeof ALLOWED_STAGES)[number], quizMode: 'srs' | 'exam' | 'normal' | string, finishedToday: boolean): string {
  // highest priority: resume/summary states, then finished flag, then default label
  if (finishedToday) return 'Finished today';
  if (stageKey === 'quiz' && quizMode === 'exam') return 'Resume exam';
  if (stageKey === 'summary' && quizMode === 'exam') return 'Exam summary';

  // exhaustive per-stage mapping (fallback to LABEL_MAP)
  switch (stageKey) {
    case 'studying':       return 'Start Studying';
    case 'quiz':           return 'Vocab quiz';
    case 'summary':        return 'Start grammar';
    case 'grammar':        return 'Study grammar';
    case 'grammarQuiz':    return 'Grammar quiz';
    case 'grammarSummary': return 'Lesson 2 of 2';

    case 'examFresher':    return 'Exam preparation';
    case 'examSummary':    return 'Exam summary';

    case 'srsFresher':     return 'Done today';
    case 'srsExam':        return 'Done today';
    // srsSummary handled above

    case 'settings':       return 'Start vocabulary';
    case 'buy':            return 'Buy more lessons';

    default:               return LABEL_MAP[stageKey] ?? 'Continue';
  }
}
// Coerce any unknown stage to a safe one
function coerceStage(s: unknown): (typeof ALLOWED_STAGES)[number] {
  const x = String(s) as Stage | string;
  return (ALLOWED_STAGES as readonly string[]).includes(x) ? (x as any) : 'studying';
}

export const StudySection: React.FC<Props> = React.memo(({ onStart, lessonNo }) => {
   const {
      stage, quizMode, stageReady, bootRevision, isBuildingToday,
    } = useSession(
      useShallow((s: SessionState) => ({
        stage: s.stage,
        quizMode: s.quizMode,
        stageReady: s.stageReady,
        bootRevision: s.bootRevision,
        isBuildingToday: (s as any).isBuildingToday ?? false,
      }))
    );

  const stageKey = coerceStage(stage);
  const isMobile = useIsMobile(520); // or 640 to match your media query
  const [finishedToday, setFinishedToday] = useState(false);
  const [calcReady, setCalcReady] = useState(false);

  const { primaryCta, secondaryHint } = useMemo(() => {
    const { primary, hint } = getCtas(stageKey, String(quizMode), finishedToday);
    return { primaryCta: primary, secondaryHint: hint };
  }, [stageKey, quizMode, finishedToday]);

  // Compute "finished today" (JST) from bootstrap without causing loops.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [{ loadBootstrap }] = await Promise.all([import('@/lib/bootstrap')]);
        const boot = loadBootstrap?.();
        const prog = boot?.lessonProgress ?? { completed: [], failed: [], current: [], examsStats: [] };

        const todayISO = jstTodayISO();
        const completedToday = (prog.completed ?? []).filter(
          (e: any) => String(e.completedAt ?? e.LessonDate ?? '').slice(0, 10) === todayISO
        ).length;
        const failedToday = (prog.failed ?? []).filter(
          (e: any) => String(e.attemptedAt ?? e.LessonDate ?? '').slice(0, 10) === todayISO
        ).length;
        const quotaMet = (completedToday + failedToday) >= 2;

        const currentLen = Array.isArray(prog.current) ? prog.current.length : 0;
        const examDoneToday = Array.isArray(prog.examsStats)
          ? prog.examsStats.some((x: any) => String(x.examDate ?? '').slice(0, 10) === todayISO)
          : false;

        // Finished if daily quota met and either exam done, or nothing left to study, or we are already at summaries
        const isFinished =
          quotaMet && (examDoneToday || currentLen === 0 || stageKey === 'examSummary' || stageKey === 'srsSummary');

        if (!alive) return;
        setFinishedToday(isFinished);
        setCalcReady(true);
      } catch {
        if (!alive) return;
        setFinishedToday(false);
        setCalcReady(true);
      }
    })();
    // Re-run when stage or bootstrap cache changes
    return () => { alive = false; };
  }, [stageKey, bootRevision]);

  // After purchases or plan updates, if current queue exists and we are on a non-study stage (e.g., 'buy'),
  // nudge stage back to 'studying' once to reflect the fresh plan. Avoid loops by checking stageKey and bootRevision.
  useEffect(() => {
    (async () => {
      if (!['buy'].includes(stageKey)) return;
      try {
        const { loadBootstrap } = await import('@/lib/bootstrap');
        const boot = loadBootstrap();
        const currLen = Array.isArray(boot?.lessonProgress?.current) ? (boot!.lessonProgress!.current as any[]).length : 0;
        if (currLen > 0) {
          // Use imperative setter to avoid hook deps churn
          try { useSession.getState().setStage?.('studying'); } catch {}
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootRevision, stageKey]);

  const pillText = useMemo(() => getPillText(stageKey, quizMode, finishedToday), [stageKey, quizMode, finishedToday]);
  // Compute left title consistently on every render (avoid conditional hook order)
  const leftTitle = useMemo(() => (
    finishedToday
      ? (stageKey === 'examSummary' ? 'Exam Complete' : stageKey === 'srsSummary' ? 'SRS Complete' : 'Done for today')
      : leftTitleFor(stageKey, lessonNo)
  ), [finishedToday, stageKey, lessonNo]);

  // Show a lightweight loader when plan is being (re)built or while computing today's state.
  if (!stageReady || !calcReady || isBuildingToday) {
    return (
      <Section>
        <StudyCardLoading type="button" aria-busy="true" aria-label="Loading today's plan">
          <LeftBlock>
            <LessonNo>Loading…</LessonNo>
            <StatusPill data-stage="settings">Preparing…</StatusPill>
          </LeftBlock>
          <RightBlock>
            <StudyWord>Study</StudyWord>
            <Hint>Fetching today’s plan</Hint>
          </RightBlock>
        </StudyCardLoading>
      </Section>
    );
  }



  return (
    <Section>
      <StudyCard
        type="button"
        onClick={onStart}
        $stage={stageKey}
        $mobile={isMobile}
        aria-label="Start or continue today's lesson"
      >
        <LeftBlock $mobile={isMobile}>
          <LessonNo>{leftTitle}</LessonNo>
          <StatusPill data-stage={stageKey} $mobile={isMobile}>{pillText}</StatusPill>
        </LeftBlock>

        <RightBlock $mobile={isMobile}>
          <StudyWord>{primaryCta}</StudyWord>
          <Hint>{secondaryHint}</Hint>
        </RightBlock>
      </StudyCard>
    </Section>
  );

});

/* ---------- styles ---------- */

const Section = styled.section`display:grid;gap:16px;width:95%;margin:auto;`;

// Pixel-gradient theming per stage
const stageTheme: Record<Stage, ReturnType<typeof css>> = {
  studying: css` --c1:#6F7E4F; --c2:#8B6B3F; --pill-bg: rgba(0,0,0,.85); --pill-fg:#fff; `,
  quiz: css` --c1:#1f4b99; --c2:#35a3ff; --pill-bg: rgba(0,0,0,.85); --pill-fg:#fff; `,
  summary: css` --c1:#8B6B3F; --c2:#C8A646; --pill-bg: rgba(0,0,0,.85); --pill-fg:#fff; `,
  grammar: css` --c1:#0F766E; --c2:#0891B2; --pill-bg: rgba(0,0,0,.85); --pill-fg:#fff; `,
  grammarQuiz: css` --c1:#7C3AED; --c2:#9333EA; --pill-bg: rgba(0,0,0,.85); --pill-fg:#fff; `,
  grammarSummary: css` --c1:#1a7f49; --c2:#8ad17d; --pill-bg: rgba(0,0,0,.85); --pill-fg:#fff; `,
  homePage: css` --c1:#1a7f49; --c2:#8ad17d; --pill-bg: rgba(0,0,0,.85); --pill-fg:#fff; `,
  settings: css` --c1:#6F7E4F; --c2:#8B6B3F; --pill-bg: rgba(0,0,0,.85); --pill-fg:#fff; `,

  // --- filled using your theme palette ---
  // Exam wrap-up: serious + celebratory (indigo + gold)
  examFresher: css` --c1:#10b981; --c2:#06b6d4; --pill-bg: rgba(0,0,0,.85); --pill-fg:#fff; `, // optional: align to emerald→cyan
  examSummary: css` --c1:#1A2A4A; --c2:#D4BA5B; --pill-bg: rgba(0,0,0,.85); --pill-fg:#fff; `,   // indigo + gold

  // Store/monetization: reuse your “Shopping & Money” vibe (teal → green)
  buy: css` --c1:#0F766E; --c2:#22C55E; --pill-bg: rgba(0,0,0,.85); --pill-fg:#fff; `,

  // SRS phases:
  // Fresher: lively/renewal (emerald → cyan)
  srsFresher: css` --c1:#10b981; --c2:#06b6d4; --pill-bg: rgba(0,0,0,.85); --pill-fg:#fff; `,
  // Exam: focused/night mode (indigoNight family)
  srsExam: css` --c1:#0F172A; --c2:#1A2A4A; --pill-bg: rgba(0,0,0,.85); --pill-fg:#fff; `,
  // Summary: warm closure (gold → sakura)
  srsSummary: css` --c1:#C8A646; --c2:#F2B6C1; --pill-bg: rgba(0,0,0,.85); --pill-fg:#fff; `,
};

const StudyCard = styled.button<{ $stage: Stage; $mobile?: boolean }>`
  ${({ $stage }) => stageTheme[$stage]}
  position: relative;
  width: 100%;
  border: 2px solid #000;
  border-radius: 18px;
  padding: 18px;
  display: grid;
  grid-template-columns: ${({ $mobile }) => ($mobile ? '1fr' : '1.1fr .9fr')};
  align-items: center;
  justify-items: ${({ $mobile }) => ($mobile ? 'center' : 'stretch')};
  gap: ${({ $mobile }) => ($mobile ? '12px' : '16px')};
  color: #fff;
  text-align: ${({ $mobile }) => ($mobile ? 'center' : 'left')};
  cursor: pointer;
  background: linear-gradient(135deg, var(--c1), var(--c2));

  &::after{ /* pixel overlay */ ... }

  box-shadow: 0 2px 0 #000, 0 10px 0 rgba(0,0,0,.25);
  transition: transform .06s ease, box-shadow .06s ease;
  &:active { transform: translate(3px,3px); box-shadow: 0 1px 0 #000, 0 6px 0 rgba(0,0,0,.2); }

  /* keep your media rule as a fallback for SSR / no-JS */
  @media (max-width: 640px){
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    font-size: 0.8rem;
    padding: 18px 5px;
  }
`;
const StudyCardLoading = styled.button`
  position: relative;
  width: 100%;
  border: 2px solid #000;
  border-radius: 18px;
  padding: 18px;
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  align-items: center;
  gap: 16px;
  color: #fff;
  text-align: left;
  cursor: pointer;

  background:
    linear-gradient(135deg, var(--c1), var(--c2));

  /* pixelated overlay */
  &::after{
    content:"";
    position:absolute; inset:0;
    background-image:
      linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px),
      linear-gradient(0deg, rgba(255,255,255,.08) 1px, transparent 1px);
    background-size: 10px 10px, 10px 10px;
    mix-blend-mode: overlay;
    opacity:.35;
    pointer-events:none;
  }

  box-shadow: 0 2px 0 #000, 0 10px 0 rgba(0,0,0,.25);
  transition: transform .06s ease, box-shadow .06s ease;
  &:active { transform: translate(3px,3px); box-shadow: 0 1px 0 #000, 0 6px 0 rgba(0,0,0,.2); }

  @media (max-width: 640px){
    grid-template-columns: 1fr; gap: 12px;
  }
`;

const LessonNo = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(1rem, 2.2vw, 1rem);
  letter-spacing:.01em;

  @media (max-width: 480px) {
   font-size: 0.6rem;
  }
`;

export const LeftBlock = styled.div<{ $mobile?: boolean }>`
  display: grid;
  gap: 8px;
  align-content: center;
  justify-items: ${({ $mobile }) => ($mobile ? 'start' : 'start')};
  text-align: left;
`;

export const RightBlock = styled.div<{ $mobile?: boolean }>`
  display: grid;
  gap: 6px;
  justify-items: ${({ $mobile }) => ($mobile ? 'center' : 'end')};
  text-align: ${({ $mobile }) => ($mobile ? 'center' : 'right')};
`;

const Hint = styled.div`
  font-size:.78rem; opacity:.85;
  @media (max-width: 480px) {
   font-size: 0.6rem;
  }
`;
const StatusPill = styled.span<{ $mobile?: boolean }>`
  justify-self: ${({ $mobile }) => ($mobile ? 'start' : 'start')};
  font-size:.76rem; letter-spacing:.08em; text-transform:uppercase;
  padding:6px 10px; border-radius:999px;
  color: ${({ theme }) => theme?.colors?.text ?? '#e5e7eb'};
  border:2px solid #9a9a9a33;
  background: ${({ theme }) => theme?.colors?.panel ?? '#111827'};

  @media (max-width: 480px) { font-size: 0.6rem; }
`;

const StudyWord = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.6rem, 3.2vw, 2rem);
  text-transform: uppercase; letter-spacing:.08em;
  filter: drop-shadow(0 2px 0 rgba(0,0,0,.35));
  /* no change needed; centering comes from parent on mobile */
`;
