import styled from 'styled-components';

export const Panel = styled.section`
  width: min(720px, 100%);
  border: 2px solid #000;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.sheetBg};
  box-shadow: 0 18px 40px rgba(0,0,0,0.35);
  padding: 24px;
  display: grid;
  gap: 20px;
`;

export const PanelHeader = styled.header`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  column-gap: 12px;
  h1 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.heading};
    letter-spacing: .08em;
    text-transform: uppercase;
    justify-self: center;
  }
`;

export const PrimaryButton = styled.button`
  padding: 12px 18px;
  border-radius: 12px;
  border: 2px solid #000;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-family: ${({ theme }) => theme.fonts.heading};
  text-transform: uppercase;
  letter-spacing: .05em;
  cursor: pointer;
  transition: transform .1s ease;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
`;

export const GhostButton = styled(PrimaryButton)`
  background: rgba(255,255,255,0.9);
  color: ${({ theme }) => theme.colors.text};
`;

export const BalanceBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 2px solid #000;
  background: rgba(255,255,255,0.88);
  span[role='img'] { font-size: 20px; }
  strong { font-family: ${({ theme }) => theme.fonts.heading}; font-size: 1.4rem; }
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 0.9rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  opacity: .75;
`;

export const InfoStrip = styled.div`
  border-radius: 14px;
  border: 1px dashed rgba(0,0,0,0.2);
  padding: 12px 14px;
  background: rgba(255,255,255,0.75);
  font-size: 0.8rem;
`;

export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.72);
  display: grid;
  place-items: center;
  padding: 24px;
  z-index: 120;
`;

export const ModalCard = styled.div`
  width: min(560px, 92vw);
  border: 2px solid #000;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.sheetBg};
  box-shadow: 0 24px 48px rgba(0,0,0,0.4);
  padding: 24px;
  display: grid;
  gap: 18px;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    margin: 0;
    font-family: ${({ theme }) => theme.fonts.heading};
    text-transform: uppercase;
    letter-spacing: .08em;
  }
`;

export const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 2px solid #000;
  background: rgba(255,255,255,0.9);
  font-size: 18px;
  display: grid;
  place-items: center;
  cursor: pointer;
`;

export const ProductGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
`;

export const HelperText = styled.p`
  margin: 0;
  font-size: 0.78rem;
  opacity: 0.75;
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px dashed rgba(0,0,0,0.1);
`;

export const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid rgba(0,0,0,0.15);
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: spin 0.8s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
