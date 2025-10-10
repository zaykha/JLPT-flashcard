import React from 'react';
import styled, { keyframes } from 'styled-components';

type Props = {
  label?: string;
  sublabel?: string;
};

export const LoadingScreen: React.FC<Props> = ({
  label = 'Loading',
  sublabel,
}) => {
  return (
    <Screen>
      <TileOverlay />
      <Panel>
        <Indicator>
          <Dot />
          <Dot />
          <Dot />
        </Indicator>
        <Label>{label}</Label>
        {sublabel ? <SubLabel>{sublabel}</SubLabel> : null}
      </Panel>
    </Screen>
  );
};

const Screen = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    url('/homepagebg4.jpg') center/cover no-repeat,
    radial-gradient(1200px 600px at 20% -10%, rgba(111,126,79,.35), transparent 60%),
    radial-gradient(900px 500px at 120% 110%, rgba(139,107,63,.25), transparent 65%),
    #0b0f14;
  position: relative;
  overflow: hidden;
  padding: 24px 16px;
`;

const TileOverlay = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.18;
  background-image: linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
`;

const Panel = styled.div`
  position: relative;
  z-index: 1;
  width: min(360px, 90%);
  padding: 28px 24px;
  border-radius: ${({ theme }) => theme.radii.card};
  border: 2px solid #000;
  color: #fff;
  text-align: center;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  background:
    linear-gradient(145deg, rgba(17,24,39,0.85), rgba(15,23,42,0.86));
  box-shadow:
    0 2px 0 #000,
    0 12px 40px rgba(0,0,0,0.45),
    ${({ theme }) => theme.shadow.card};
`;

const twinkle = keyframes`
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.9); }
  40% { opacity: 1; transform: scale(1.05); }
`;

const Indicator = styled.div`
  display: inline-flex;
  gap: 8px;
  margin-bottom: 18px;
`;

const Dot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.secondary};
  box-shadow: 0 0 12px rgba(139,107,63,0.6);
  animation: ${twinkle} 1.2s infinite ease-in-out;

  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
`;

const Label = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(16px, 4.2vw, 20px);
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const SubLabel = styled.div`
  margin-top: 12px;
  font-size: 12px;
  opacity: 0.8;
`;
