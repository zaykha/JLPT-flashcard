import React from 'react';
import styled from 'styled-components';
import { useUserProfile } from '@/hooks/useUserProfile';
import { SettingsModal } from '@/components/settings/SettingsModal';

export const SettingsPage: React.FC = () => {
  const { data: profile, isLoading } = useUserProfile();

  return (
    <Screen>
      <Card>
        {isLoading ? (
          <Loading>Loading settings…</Loading>
        ) : (
          <SettingsModal variant="inline" profile={profile} />
        )}
      </Card>
    </Screen>
  );
};

const Screen = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 16px;
  background:
    url('/homepagebg4.jpg') center/cover no-repeat,
    radial-gradient(1200px 600px at 20% -10%, rgba(111,126,79,.35), transparent 60%),
    radial-gradient(900px 500px at 120% 110%, rgba(139,107,63,.25), transparent 65%),
    #0b0f14;
`;

const Card = styled.div`
  width: min(440px, 100%);
  border-radius: 20px;
  border: 2px solid #000;
  background: ${({ theme }) => theme.colors.sheetBg};
  box-shadow: 0 18px 40px rgba(0,0,0,0.4);
  padding: 24px;
`;

const Loading = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  text-transform: uppercase;
  letter-spacing: .08em;
  text-align: center;
`;
