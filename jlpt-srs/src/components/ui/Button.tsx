import styled from 'styled-components'

type Variant = 'primary' | 'ghost' | 'danger'

export const Button = styled.button<{ variant?: Variant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  padding: .65rem 1rem;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid var(--border);
  color: var(--text);
  background: ${({ variant, theme }) =>
    variant === 'primary' ? theme.gradient.emeraldCyan :
    variant === 'danger'  ? 'rgba(239,68,68,.12)' :
                             'rgba(255,255,255,.04)'};
  box-shadow: ${({ theme }) => theme.shadow.card};
  cursor: pointer;
  transition: transform .06s ease, opacity .15s ease;
  &:active { transform: scale(.98); }
  &:disabled { opacity: .5; cursor: not-allowed; }
`
