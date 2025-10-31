import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useWalletContext } from '@/features/wallet/WalletProvider';


export const ShardHUD: React.FC = () => {
  const { wallet } = useWalletContext();
  const nav = useNavigate();
  const shards = wallet?.shards ?? 0;

  return (
    <HudButton
      type="button"
      onClick={() => nav('/wallet')}
      aria-label="Open wallet"
      title="View your Shards balance"
    >
      <GemIcon>💠</GemIcon>
      <Amount>{shards.toLocaleString('en-US')}</Amount>
    </HudButton>
  );
};

/* === ANIMATIONS === */
const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 8px rgba(0,255,255,0.2); }
  50% { box-shadow: 0 0 14px rgba(0,255,255,0.5); }
`;

/* === STYLES === */
const HudButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  /* Shape and size */
  padding: 6px 14px;
  border-radius: 999px;

  /* Currency chip styling */
  background: ${({ theme }) => theme.colors.bg};
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.gold};
  backdrop-filter: blur(6px);
  box-shadow:
    inset 0 0 0 2px ${({ theme }) => theme.colors.pixelBorder},
    0 3px 6px rgba(0,0,0,0.35);

  /* Font + spacing */
  font-family: ${({ theme }) => theme.fonts.heading};
  letter-spacing: 0.08em;
  text-transform: uppercase;

  /* Interactivity */
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.2s ease, background 0.2s ease;

`;

const GemIcon = styled.span`
  font-size: 20px;
  filter: drop-shadow(0 0 4px rgba(0,255,255,0.6));
`;

const Amount = styled.strong`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text};
  text-shadow: 0 1px 0 ${({ theme }) => theme.colors.borderDark};
`;

