    import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Settings, LogOut, BarChart2 } from 'lucide-react';
import { publicUrl } from '../animated/AvatarPicker';

type Props = {
  nickname?: string | null;
  displayName?: string | null;
  jlptLevel?: string | null;
  progressLabel?: string | null;

  avatarKey?: string | null;           // ← NEW

  onOpenSettings: () => void;
  onSignOut: () => void;
  onOpenProgress?: () => void;
  onOpenProfile?: () => void;          // ← optional click target for avatar

  rightSlot?: React.ReactNode;
};


function resolveAvatarSources(key?: string | null) {
  if (!key) return [];
  const raw = key.trim();
  const hasExt = /\.svg$/i.test(raw);
  const base = hasExt ? raw.replace(/\.svg$/i, '') : raw;

  // Try: exact, -neutral, -smile
  return [
    `${base}.svg`,
    `${base}-neutral.svg`,
    `${base}-smile.svg`,
  ]
    // de-dup in case base already had pose
    .filter((v, i, a) => a.indexOf(v) === i)
    .map((f) => publicUrl(`avatars/${f}`));
}
export const HeaderBarHome: React.FC<Props> = ({
  nickname, displayName, jlptLevel, progressLabel,
  avatarKey,                                  // ← NEW
  onOpenSettings, onSignOut, onOpenProgress, onOpenProfile, rightSlot,
}) => {
  const sources = useMemo(() => resolveAvatarSources(avatarKey), [avatarKey]);
  const [srcIdx, setSrcIdx] = useState(0);
  const activeSrc = sources[srcIdx] || null;

  return (
    <HeaderBar>
      <HeaderInfo>
         {/* Avatar chip */}
        <AvatarBtn
          type="button"
          aria-label="Open profile"
          onClick={onOpenProfile ?? onOpenSettings}
          title={(nickname ?? displayName ?? 'Profile') || 'Profile'}
        >
          {activeSrc ? (
            <img
              src={activeSrc}
              alt="Avatar"
              onError={() => setSrcIdx((i) => Math.min(i + 1, Math.max(0, sources.length - 1)))}
            />
          ) : (
            <Initials>{(nickname ?? displayName ?? 'U').slice(0, 1).toUpperCase()}</Initials>
          )}
        </AvatarBtn>
        <HeaderDisplay>
            {/* <p>{avatarKey}</p> */}

        <Greeting>Hi, {nickname ?? displayName ?? 'Explorer'}</Greeting>
        <Subheading>
          JLPT {jlptLevel ?? '—'}{progressLabel ? ` • ${progressLabel}` : ''}
        </Subheading>
        </HeaderDisplay>
        
      </HeaderInfo>

      <HeaderActions>
        {rightSlot}

       

        {/* Progress */}
        <IconButton type="button" onClick={onOpenProgress} aria-label="Open progress">
          <BarChart2/>
        </IconButton>

        {/* Settings */}
        <IconButton type="button" onClick={onOpenSettings} aria-label="Settings">
          <Settings />
        </IconButton>

        {/* Logout */}
        <IconButton type="button" onClick={onSignOut} aria-label="Sign out">
          <LogOut />
        </IconButton>
      </HeaderActions>
    </HeaderBar>
  );
};

const HeaderBar = styled.header`
  display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  @media (max-width: 480px) { padding: 10px 0 0 10px; }
`;
const HeaderDisplay = styled.div`
  display:flex; flex-direction:column; gap:10px;
`;
const HeaderInfo = styled.div` display: flex; gap: 10px; align-items:center;`;

const Greeting = styled.h1`
  margin: 0; font-size: clamp(1.3rem, 3vw, 1.6rem); letter-spacing: 0.06em; text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.heading};
  @media (max-width: 480px) { font-size: 0.8rem; }
`;

const Subheading = styled.p`
  margin: 0; font-size: 0.85rem; opacity: 0.75;
  @media (max-width: 480px) { font-size: 0.7rem; }
`;

const HeaderActions = styled.div` display: flex; align-items: center; gap: 10px; flex-wrap: wrap; `;

const IconButton = styled.button`
  width: 36px; height: 36px; border-radius: 12px; 
  border: ${({ theme }) => theme.colors.primary};
  color:${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.sheetBg};
  display: grid; place-items: center; cursor: pointer; transition: transform .05s ease;
  box-shadow:
    inset 0 0 0 2px ${({ theme }) => theme.colors.pixelBorder},
    0 3px 6px rgba(0,0,0,0.35);
  &:active { transform: translate(2px,2px); }
  svg { width: 18px; height: 18px; }
`;

/* NEW: avatar chip */
const AvatarBtn = styled.button`
  width: 80px; height: 80px; border-radius: 999px;
  border: 2px solid #000; 
    background: ${({ theme }) => theme.colors.sheetBg};

  padding: 0; overflow: hidden;
  display: grid; place-items: center; cursor: pointer; transition: transform .05s ease;
  &:active { transform: translate(2px,2px); }
  img { display:block; width: 100%; height: 100%; object-fit: cover; }
`;

const Initials = styled.span`
  font-weight: 700; font-size: 14px; color: #0f172a;
`;
