    import React from 'react';
import styled from 'styled-components';
import { Settings, LogOut, BarChart2 } from 'lucide-react';

type Props = {
  nickname?: string | null;
  displayName?: string | null;

  // NEW
  jlptLevel?: string | null;
  progressLabel?: string | null;

  onOpenSettings: () => void;
  onSignOut: () => void;

  // NEW (what the Progress icon triggers)
  onOpenProgress?: () => void;

  rightSlot?: React.ReactNode;
};


export const HeaderBarHome: React.FC<Props> = ({
  nickname,
  displayName,
  jlptLevel,
  progressLabel,
  onOpenSettings,
  onSignOut,
  onOpenProgress,
  rightSlot,
}) => {
  return (
    <HeaderBar>
    <HeaderInfo>
  <Greeting>Hi, {nickname ?? displayName ?? 'Explorer'}</Greeting>
  {/* NEW: JLPT + progress */}
  <Subheading>
    JLPT {jlptLevel ?? '—'}
    {progressLabel ? ` • ${progressLabel}` : ''}
  </Subheading>
</HeaderInfo>

<HeaderActions>
  {/* NEW: Progress icon */}
  <IconButton type="button" onClick={onOpenProgress} aria-label="Open progress">
    <BarChart2 />
  </IconButton>

  {/* Settings icon */}
  <IconButton type="button" onClick={onOpenSettings} aria-label="Settings">
    <Settings />
  </IconButton>

  {/* Logout icon */}
  <IconButton type="button" onClick={onSignOut} aria-label="Sign out">
    <LogOut />
  </IconButton>

  {rightSlot}
</HeaderActions>

    </HeaderBar>
  );
};

const HeaderBar = styled.header`
  display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
`;
const HeaderInfo = styled.div` display: grid; gap: 6px; `;
const Greeting = styled.h1`
  margin: 0; font-size: clamp(1.3rem, 3vw, 1.6rem); letter-spacing: 0.06em; text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.heading};
`;
const Subheading = styled.p` margin: 0; font-size: 0.85rem; opacity: 0.75; `;
const HeaderActions = styled.div` display: flex; align-items: center; gap: 10px; flex-wrap: wrap; `;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 2px solid #000;
  background: rgba(255,255,255,0.9);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform .05s ease;
  &:active { transform: translate(2px,2px); }
  svg { width: 18px; height: 18px; }
`;