import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { loadBootstrap } from '@/lib/bootstrap';
import type { UserProfile } from '@/types/userV1';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { Btn } from '@/styles/Pages/FlashCardPage.styles';

export const SettingsPage: React.FC = () => {
  const nav = useNavigate();
  const boot = loadBootstrap();
  const profile: UserProfile | null = (boot?.profile as any) ?? null;

  return (
    <Wrap>
      <Inner>
        <Panel>
          <SettingsModal variant="inline" open profile={profile} onClose={() => nav(-1)} />
        </Panel>
      </Inner>
    </Wrap>
  );
};

const Wrap = styled.section`
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 24px 12px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.bg};
  background-image:
    ${({ theme }) => `url('${theme.backgrounds.FlashcardsPage}')`},
    ${({ theme }) => theme.textures.dither};
  background-repeat: no-repeat, repeat;
  background-size: cover, auto;
  background-position: center, center;
`;

const Inner = styled.div`
  width: min(920px, 96vw);
  display: grid;
  gap: 12px;
`;

// removed external header per request

const Panel = styled.div`
  display: grid;
  justify-items: center;
`;

export default SettingsPage;
