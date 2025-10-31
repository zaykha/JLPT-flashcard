import React, { useEffect, useCallback, type PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** e.g. 640, "720px", "min(760px, 96vw)" */
  maxWidth?: number | string;
  /** Optional aria-label for dialog title */
  labelledBy?: string;
  
};

export const ModalRoot: React.FC<PropsWithChildren<ModalProps>> = ({
  open,
  onClose,
  maxWidth = 640,
  labelledBy,
  children
}) => {
  const esc = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = prev; };
  }, [open, esc]);

  if (!open) return null;

  return (
    <Backdrop onClick={onClose} role="presentation">
      <Frame
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
        $maxWidth={maxWidth}
      >
        {children}
      </Frame>
    </Backdrop>
  );
};

export const ModalHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: start;
`;

export const ModalTitle = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
`;

export const ModalBody = styled.div`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.primary};
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
`;

export const ModalClose = styled.button`
  appearance: none;
  background: transparent;
  border: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.colors.text }; }
`;

/* ===================== styled bits ===================== */

const Backdrop = styled.div`
  position: fixed;
  // height:100vh;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.components.modal.backdrop ?? 'rgba(0,0,0,0.6)'};
  z-index: ${({ theme }) => theme.z.modal ?? 1000};
`;

/**
 * Parchment frame via CSS border-image for a clean 9-slice look.
 * Provide frame slice/width in the theme (works for both light/dark).
 */
const Frame = styled.div<{ $maxWidth: number | string }>`
  ${({ $maxWidth }) => css`width: min(${typeof $maxWidth === 'number' ? `${$maxWidth}px` : $maxWidth}, 96vw);`}
  max-height: min(80vh, 760px);
  overflow: auto;

  /* Parchment 9-slice */
  border-style: solid;
  border-width: ${({ theme }) => theme.components.modal.frameWidth ?? 36}px;
  border-image-source: url(${({ theme }) => theme.components.modal.frameImage});
  border-image-slice: ${({ theme }) => theme.components.modal.frameSlice ?? 120} fill;
  border-image-width: ${({ theme }) => theme.components.modal.frameWidth ?? 36}px;
//   border-image-repeat: round;

  /* Inner sheet color + shadow */
//   background: ${({ theme }) => theme.components.modal.innerBg ?? '#f6e6c8'};
//   box-shadow: ${({ theme }) => theme.components.modal.shadow ?? '0 12px 32px rgba(0,0,0,.48)'};

  /* Padding for content inside the parchment */
  padding: 4px 10px;
  position: relative;
`;
