import React from 'react';
import styled from 'styled-components';
// import { useWalletContext } from '@/features/wallet/WalletProvider';
import { useNavigate } from 'react-router-dom';

export const ShardHUD: React.FC = () => {
  // const { wallet } = useWalletContext();
  const nav = useNavigate();
  // const shards = wallet?.shards ?? 0;
  const shards =  0;

  return (
    <HudButton type="button" onClick={() => nav('/wallet')} aria-label="Open wallet">
      <span role="img" aria-label="glyph shards">💠</span>
      <strong>{shards.toLocaleString('en-US')}</strong>
    </HudButton>
  );
};

const HudButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 2px solid #000;
  background: rgba(255,255,255,0.92);
  cursor: pointer;
  transition: transform .08s ease;
  span[role='img'] {
    font-size: 18px;
  }
  strong {
    font-family: ${({ theme }) => theme.fonts.heading};
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  &:active {
    transform: translateY(2px);
  }
`;
