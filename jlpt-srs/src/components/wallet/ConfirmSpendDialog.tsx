import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ModalBackdrop, ModalCard, ModalHeader, CloseButton, PrimaryButton, GhostButton, HelperText, Spinner } from '@/features/wallet/styles';
import type { ReactNode } from 'react';

export type ConfirmSpendProps = {
  open: boolean;
  onClose: () => void;
  onBuyShards: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description?: ReactNode;
  cost: number;
  balance: number;
  loading?: boolean;
  error?: string | null;
};

export const ConfirmSpendDialog: React.FC<ConfirmSpendProps> = ({
  open,
  onClose,
  onBuyShards,
  onConfirm,
  title,
  description,
  cost,
  balance,
  loading = false,
  error,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const insufficient = balance < cost;

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Enter') {
        event.preventDefault();
        if (!insufficient && !loading) {
          void onConfirm();
        }
      }
      if (event.key === 'Tab' && cardRef.current) {
        trapFocus(event, cardRef.current);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose, insufficient, loading, onConfirm]);

  if (!open) return null;

  return (
    <ModalBackdrop>
      <ModalCard ref={cardRef} role="dialog" aria-modal="true" aria-label={title}>
        <ModalHeader>
          <h3>{title}</h3>
          <CloseButton type="button" onClick={onClose}>✖</CloseButton>
        </ModalHeader>

        {typeof description === 'string' ? <HelperText>{description}</HelperText> : description}

        <CostRow>
          <span>Cost</span>
          <strong>💠 {cost}</strong>
        </CostRow>

        <CostRow>
          <span>Balance</span>
          <strong>💠 {balance}</strong>
        </CostRow>

        <CostRow>
          <span>After spend</span>
          <strong>💠 {Math.max(balance - cost, 0)}</strong>
        </CostRow>

        {loading && <Spinner />}

        {insufficient ? <ErrorText>Not enough shards.</ErrorText> : null}
        {error ? <ErrorText>{error}</ErrorText> : null}

        <Actions>
          <GhostButton type="button" onClick={onBuyShards}>Buy Shards</GhostButton>
          <GhostButton type="button" onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton
            type="button"
            onClick={() => void onConfirm()}
            disabled={loading || insufficient}
          >
            {loading ? 'Processing…' : `Spend ${cost} shards`}
          </PrimaryButton>
        </Actions>
      </ModalCard>
    </ModalBackdrop>
  );
};

function trapFocus(event: KeyboardEvent, container: HTMLElement) {
  if (event.key !== 'Tab') return;
  const focusable = container.querySelectorAll<HTMLElement>([
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(','));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  }
}

const CostRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  span { opacity: 0.75; }
  strong { font-family: ${({ theme }) => theme.fonts.heading}; }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.8rem;
`;
