import React from 'react';
import styled, { css } from 'styled-components';
import {
  ModalRoot, ModalHeader, ModalTitle, ModalBody, ModalActions, ModalClose
} from '@/components/ui/Modal';
import { Btn } from '@/styles/Pages/FlashCardPage.styles';

type Props = {
  open: boolean;
  lessonsCount?: number;
  costShards?: number;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  showCost?: boolean;
};

export const BuyMoreLessonsModal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  lessonsCount = 2,
  costShards = 120,
  loading = false,
  showCost = false,
}) => {
  return (
    <ModalRoot open={open} onClose={onClose} maxWidth={620} labelledBy="buy-more-title">
      <ModalHeader>
        <ModalTitle id="buy-more-title">Buy more lessons for today?</ModalTitle>
        <ModalClose onClick={onClose} aria-label="Close">×</ModalClose>
      </ModalHeader>

      <ModalBody>
        <Intro>
          You’ve finished today’s study & exam. Unlock <strong>{lessonsCount} more {lessonsCount === 1 ? 'lesson' : 'lessons'}</strong> for today.
        </Intro>
        {showCost && (
          <CostRow>
            <CostMeta>
              <CostLabel>Cost</CostLabel>
              <CostSub>Bundle: {lessonsCount} {lessonsCount === 1 ? 'lesson' : 'lessons'}</CostSub>
            </CostMeta>
            <CostBadge>💎 {costShards} shards</CostBadge>
          </CostRow>
        )}

        {/* <Hint>
          Buying adds a new <b>current</b> queue immediately (bonus lessons skip today’s exam).
        </Hint> */}
      </ModalBody>

      <ModalActions>
        <Btn $variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn $variant="primary" disabled={loading} onClick={() => onConfirm()}>
          {loading ? 'Processing…' : 'Buy now'}
        </Btn>
      </ModalActions>
    </ModalRoot>
  );
};

/* ------------- local styles (use theme tokens) ------------- */

const Intro = styled.p`
  margin: 0 0 12px;
`;

const CostRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  margin-bottom: 12px;
  background: ${({ theme }) => theme.color.card};
`;

const CostMeta = styled.div``;

const CostLabel = styled.div`
  font-weight: 700;
`;

const CostSub = styled.div`
  opacity: .8;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
`;

const CostBadge = styled.div`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: .3px;
`;
