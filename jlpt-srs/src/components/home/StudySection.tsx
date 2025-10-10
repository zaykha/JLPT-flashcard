import React from 'react';
import styled, { css } from 'styled-components';

type StudyStatus = 'not-started' | 'in-progress' | 'completed';

type Props = {
  onStart: () => void;
  lessonNo?: number;
  status: StudyStatus;
};

export const StudySection: React.FC<Props> = ({ onStart, lessonNo, status }) => {
  return (
    <Section>
      <SectionHeader><h2>Today&apos;s Lesson</h2></SectionHeader>

      {/* The whole card is the button */}
      <StudyCard
        type="button"
        onClick={onStart}
        $status={status}
        aria-label="Start or continue today's lesson"
      >
        {/* Left: lesson number + status */}
        <LeftBlock>
          <LessonNo>Lesson {lessonNo ?? '—'}</LessonNo>
          <StatusPill data-status={status}>
            {status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In progress' : 'Not started'}
          </StatusPill>
        </LeftBlock>

        {/* Right: bold STUDY call-to-action */}
        <RightBlock>
          <StudyWord>Study</StudyWord>
          <Hint>Click to begin or continue</Hint>
        </RightBlock>
      </StudyCard>
    </Section>
  );
};

/* ---------- styles ---------- */

const Section = styled.section`display:grid;gap:16px;`;
const SectionHeader = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  h2{margin:0;font-size:.95rem;letter-spacing:.08em;text-transform:uppercase;}
`;

// Pixel-gradient theming per status
const statusTheme = {
  'not-started': css`
    --c1: #6F7E4F; --c2: #8B6B3F;
    --pill-bg: rgba(0,0,0,.85); --pill-fg: #fff;
  `,
  'in-progress': css`
    --c1: #1f4b99; --c2: #35a3ff;
    --pill-bg: rgba(0,0,0,.85); --pill-fg: #fff;
  `,
  'completed': css`
    --c1: #1a7f49; --c2: #8ad17d;
    --pill-bg: rgba(0,0,0,.85); --pill-fg: #fff;
  `,
};

const StudyCard = styled.button<{ $status: StudyStatus }>`
  ${({ $status }) => statusTheme[$status]}
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

const LeftBlock = styled.div`
  display:grid;gap:8px;align-content:center;
`;
const LessonNo = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.1rem, 2.2vw, 1.4rem);
  letter-spacing:.04em;
`;
const StatusPill = styled.span`
  justify-self:start;
  font-size:.76rem; letter-spacing:.08em; text-transform:uppercase;
  padding:6px 10px; border-radius:999px;
  border:2px solid #000;
  background: var(--pill-bg); color: var(--pill-fg);
`;

const RightBlock = styled.div`
  display:grid;gap:6px; justify-items:end; text-align:right;
`;
const StudyWord = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1.6rem, 3.2vw, 2rem);
  text-transform: uppercase; letter-spacing:.08em;
  filter: drop-shadow(0 2px 0 rgba(0,0,0,.35));
`;
const Hint = styled.div`
  font-size:.78rem; opacity:.85;
`;
