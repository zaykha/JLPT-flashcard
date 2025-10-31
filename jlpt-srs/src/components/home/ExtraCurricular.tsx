import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Btn } from '@/styles/Pages/FlashCardPage.styles';
import { SrsTitle } from '../srs/srsUnlockCard';

type Props = {
  onOpenSuru?: () => void;
  onOpenAdjectives?: () => void;
  onOpenModal?: (args: { title: string; msg: string }) => void;
};

export const ExtraCurricular: React.FC<Props> = ({ onOpenSuru, onOpenAdjectives, onOpenModal }) => {

  // Flip to false when the features are ready
  const wip = true;

  const openPopup = (title: string, msg: string) => {
    if (onOpenModal) onOpenModal({ title, msg });
  };

  const handleSuru = () => {
    if (wip) return openPopup('Suru Verbs', '🚧 This practice pack is under construction. Coming soon!');
    if (onOpenSuru) return onOpenSuru();
    openPopup('Suru Verbs', 'No handler connected yet. You can pass onOpenSuru to open your screen.');
  };

  const handleAdj = () => {
    if (wip) return openPopup('Adjectives', '🏗️ This practice pack is under construction. Coming soon!');
    if (onOpenAdjectives) return onOpenAdjectives();
    openPopup('Adjectives', 'No handler connected yet. You can pass onOpenAdjectives to open your screen.');
  };

  return (
    <Section>
      <Header>
        <SrsTitle>Extra Curriculum</SrsTitle>
        {/* <Badge title="Work in progress">🚧 Under Construction</Badge> */}
      </Header>

      <Grid>
        <Square onClick={handleSuru} $wip={wip} aria-disabled={wip}>
          <Inner>
            <TopRow>
              <Title>600</Title>
              <TinyPill>SR-only</TinyPill>
            </TopRow>
            <h4>Suru Verbs</h4>
            <HintRow>
              <Hint>Practice pack</Hint>
              {wip && <Hint>🔨 Forging content…</Hint>}
            </HintRow>
            {wip && (
              <>
                <Progress aria-label="Progress"><Bar style={{ width: '42%' }} /></Progress>
                <Underlay><UnderIcon>🛠️</UnderIcon><UnderText>Coming Soon</UnderText></Underlay>
              </>
            )}
          </Inner>
        </Square>

        <Square onClick={handleAdj} $wip={wip} aria-disabled={wip}>
          <Inner>
            <TopRow>
              <Title>600</Title>
              <TinyPill>SR-only</TinyPill>
            </TopRow>
            <h4>Adjectives</h4>
            <HintRow>
              <Hint>Practice pack</Hint>
              {wip && <Hint>⛏️ Enchanting adjectives…</Hint>}
            </HintRow>
            {wip && (
              <>
                <Progress aria-label="Progress"><Bar style={{ width: '35%' }} /></Progress>
                <Underlay><UnderIcon>🏗️</UnderIcon><UnderText>Coming Soon</UnderText></Underlay>
              </>
            )}
          </Inner>
        </Square>

        <Square onClick={handleAdj} $wip={wip} aria-disabled={wip}>
          <Inner>
            <TopRow>
              {/* <Title>600</Title> */}
              {/* <TinyPill>SR-only</TinyPill> */}
            </TopRow>
            <h4>Readings</h4>
            <HintRow>
              <Hint>Practice pack</Hint>
              {wip && <Hint>⛏️ Enchanting adjectives…</Hint>}
            </HintRow>
            {wip && (
              <>
                <Progress aria-label="Progress"><Bar style={{ width: '35%' }} /></Progress>
                <Underlay><UnderIcon>🚧 </UnderIcon><UnderText>Coming Soon</UnderText></Underlay>
              </>
            )}
          </Inner>
        </Square>
      </Grid>

      {/* popup handled by parent HomePage via onOpenModal */}
    </Section>
  );
};

/* ===== styles (same vibe as before) ===== */

const Section = styled.section`display:grid;gap:14px;width:95%;margin:auto;`;
const Header = styled.div`
  display:flex;align-items:center;justify-content:space-between;
  h2{margin:0;font-size:.95rem;letter-spacing:.08em;text-transform:uppercase;}
`;
const Badge = styled.span`
  font-size:.7rem; letter-spacing:.06em; text-transform:uppercase;
  padding:6px 10px; border-radius:999px; border:2px solid #000;
  background:${({theme})=>theme.colors.panel};
  color:${({theme})=>theme.colors.text};
  box-shadow:0 2px 0 #000;
  @media(max-width:600px){font-size:.6rem; }
  
`;
const Grid = styled.div`
  display:grid;gap:16px;grid-template-columns:1fr 1fr;
  @media(max-width:600px){grid-template-columns:1fr;}
`;
const stripes = keyframes`
  0%{background-position:0 0,0 0;}100%{background-position:24px 0,0 0;}
`;
const Square = styled.button<{ $wip?: boolean }>`
  aspect-ratio:1/0.5;width:100%;
  border-radius:16px;border:2px solid #000;color:${({theme})=>theme.colors.text};
  padding:0;overflow:hidden;position:relative;box-shadow:${({theme})=>theme.shadow.card};
  background:${({theme})=>theme.colors.sheetBg};
  &::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
    background-image:linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px),
                     linear-gradient(0deg, rgba(255,255,255,.06) 1px,transparent 1px);
    background-size:10px 10px;mix-blend-mode:overlay;opacity:.18;}
  ${({$wip,theme})=>$wip?css`
    cursor:not-allowed;filter:grayscale(.05) opacity(.95);
    background-image:repeating-linear-gradient(-45deg,
      ${theme.colors.panel},${theme.colors.panel} 10px,
      ${theme.colors.sheetBg} 10px,${theme.colors.sheetBg} 20px);
    animation:${stripes} 3s linear infinite;
  `:css`
    cursor:pointer;transition:transform .06s ease, box-shadow .06s ease;
    &:hover{transform:translate(1px,1px);box-shadow:0 1px 0 #000,0 5px 0 rgba(0,0,0,.18);}
  `}
  @media(max-width:600px){aspect-ratio:0; }

`;
const Inner = styled.div`
  position:relative;z-index:1;height:100%;width:100%;
  padding:12px;display:grid;gap:6px;align-content:space-between;justify-items:start;
  h4{margin:0;font-size:clamp(14px,3vw,16px);}
`;
const Title = styled.div`font-family:${({theme})=>theme.fonts.heading};font-size:clamp(14px,3vw,16px);`;
const TopRow = styled.div`display:flex;align-items:center;gap:8px;
  @media(max-width:600px){gap: 4px}
`;
const TinyPill = styled.span`
  font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;
  padding:4px 8px;border-radius:999px;border:2px solid #000;
  background:${({theme})=>theme.colors.panel};color:${({theme})=>theme.colors.text};
`;
const HintRow = styled.div`display:flex;gap:10px;opacity:.85;font-size:.75rem;`;
const Hint = styled.span``;
const Progress = styled.div`
  width:100%;height:8px;border:2px solid #000;border-radius:8px;
  background:${({theme})=>theme.colors.panel};overflow:hidden;
`;
const Bar = styled.div`height:100%;background:${({theme})=>theme.colors.text};border-right:2px solid #000;`;
const Underlay = styled.div`
  position:absolute;inset:auto 10px 10px auto;display:flex;align-items:center;gap:6px;
  padding:6px 10px;border-radius:10px;border:2px solid #000;background:${({theme})=>theme.colors.sheetBg};
  box-shadow:0 2px 0 #000;
`;
const UnderIcon = styled.span`font-size:14px;`;
const UnderText = styled.span`font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;`;
