import styled from 'styled-components'

export const Card = styled.div`
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: ${({ theme }) => theme.radius.xl};
  box-shadow: ${({ theme }) => theme.shadow.card};
  padding: 1rem;
`
