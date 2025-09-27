import styled from 'styled-components'

export const Pill = styled.span<{active?: boolean}>`
  display:inline-flex; align-items:center; gap:.4rem;
  padding:.35rem .6rem;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: .78rem; font-weight: 600;
  border: 1px solid var(--border);
  background: ${({active, theme}) => active ? theme.gradient.emeraldCyan : 'rgba(255,255,255,.06)'};
  color: ${({active}) => active ? '#0b1220' : 'var(--text)'};
  white-space: nowrap;
`
