import styled, { css, type DefaultTheme } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  active?: boolean;
};

const getVariantTokens = (theme: DefaultTheme, variant: ButtonVariant) => {
  const primary = theme.colors?.primary ?? '#8B6B3F';
  const secondary = theme.colors?.secondary ?? '#6F7E4F';

  if (variant === 'secondary') {
    return {
      base: secondary,
      pressed: '#4b5b31',
      text: '#f5fbe6',
      border: '#000',
      shadow: '#000',
      selected: '#3a4524',
    };
  }

  if (variant === 'ghost') {
    const base = '#1f2937';
    return {
      base,
      pressed: '#111827',
      text: '#e2e8f0',
      border: '#000',
      shadow: '#000',
      selected: '#0b1120',
    };
  }

  return {
    base: primary,
    pressed: '#5e4323',
    text: '#fff7ec',
    border: '#000',
    shadow: '#000',
    selected: '#4a341f',
  };
};

const SIZES: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css`
    padding: 10px 12px;
    font-size: 11px;
    min-height: 40px;
  `,
  md: css`
    padding: 12px 16px;
    font-size: 13px;
    min-height: 44px;
  `,
  lg: css`
    padding: 16px 20px;
    font-size: 14px;
    min-height: 50px;
  `,
};

const shouldForwardProp = (prop: string) =>
  !['variant', 'size', 'block', 'active'].includes(prop);

export const Button = styled.button.withConfig({ shouldForwardProp })<ButtonProps>`
  ${({ theme, variant = 'primary', active }) => {
    const token = getVariantTokens(theme, variant);
    return css`
      --shadow: ${token.shadow};
      background: ${token.base};
      color: ${token.text};
      border: 2px solid ${token.border};
      box-shadow: 4px 4px 0 var(--shadow);
      transform: translate3d(0, 0, 0);

      &:active:not(:disabled) {
        background: ${token.pressed};
        box-shadow: 0 0 0 var(--shadow);
        transform: translate(4px, 4px);
      }

      ${active &&
      css`
        background: ${token.selected};
        box-shadow: 0 0 0 var(--shadow);
        transform: translate(4px, 4px);
      `}
    `;
  }}

  ${({ size = 'md' }) => SIZES[size]}

  ${({ block }) =>
    block &&
    css`
      width: 100%;
      display: inline-flex;
    `}

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 12px;
  font-family: ${({ theme }) => theme.fonts.heading};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-decoration: none;
  line-height: 1.1;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease, background 0.15s ease, opacity 0.15s ease;
  image-rendering: pixelated;
  position: relative;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: 2px 2px 0 var(--shadow);
    transform: none;
  }

  &:focus-visible {
    outline: 3px solid #ffc300;
    outline-offset: 3px;
  }

  @media (max-width: 520px) {
    padding-inline: 12px;
  }
`;
