import styled from 'styled-components';

export const Page = styled.main`
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 16px 80px;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  @media (max-width: 520px) { padding: 24px 12px 64px; }
`;

export const PageTitle = styled.h1`
  margin: 0 0 16px;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(20px, 4.5vw, 28px);
  letter-spacing: .04em;
`;

export const Section = styled.section`
  margin: 24px 0;
  line-height: 1.7;
  max-width: 70ch;
  h2 { font-size: 1.05rem; margin: 0 0 8px; }
  p { margin: 0 0 12px; }
  ul { margin: 0 0 12px 18px; }
`;

export const Shots = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

export const Shot = styled.div`
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  background: ${({ theme }) => theme.colors.panel};
  aspect-ratio: 16 / 9;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0 16px;
  th, td {
    border: 1px solid ${({ theme }) => theme.colors.pixelBorder};
    padding: 8px 10px;
    text-align: left;
    vertical-align: top;
    background: ${({ theme }) => theme.colors.sheetBg};
  }
  th { width: 32%; background: ${({ theme }) => theme.colors.panel}; }
`;

export const FooterNav = styled.footer`
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.pixelBorder};
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  a { color: ${({ theme }) => theme.colors.primary}; text-decoration: none; }
`;

// Legal/Policy shell inspired by multi-column layout
export const Shell = styled.div`
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.sheetBg};
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  box-shadow: 0 18px 36px rgba(0,0,0,.25);
  display: grid;
  grid-template-columns: 240px 1fr;
  overflow: hidden;
  position: relative;
  z-index: 1;
  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

export const Sidebar = styled.aside`
  background: ${({ theme }) => theme.colors.panel};
  padding: 18px 14px;
  border-right: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  display: grid;
  gap: 10px;
  position: sticky;
  top: 12px;
  align-self: start;
  @media (max-width: 820px) {
    position: static;
    border-right: none;
    border-bottom: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  }
`;

export const TocList = styled.nav`
  display: grid;
  gap: 8px;
  a, button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 10px;
    text-decoration: none;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.sheetBg};
    border: 1px solid ${({ theme }) => theme.colors.pixelBorder};
    cursor: pointer;
  }
`;

export const Content = styled.div`
  padding: 20px 22px;
  background: ${({ theme }) => theme.colors.sheetBg};
  color: ${({ theme }) => theme.colors.text};
  position: relative;
  z-index: 1;
`;

export const BackRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const BackButton = styled.button`
  padding: 8px 12px;
  border-radius: 10px;
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: 700;
  cursor: pointer;
`;
