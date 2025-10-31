import styled from 'styled-components';

export const ScreenGQ = styled.section`
  position: relative;
  /* Prefer dynamic viewport units to avoid mobile address bar jumps */
  min-height: 100vh;
  @supports (height: 100dvh) { min-height: 100dvh; }
  @supports (height: 100svh) { min-height: 100svh; }
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Safe-area aware padding */
  padding: clamp(16px, 2.6vw, 24px);
  padding-left: calc(env(safe-area-inset-left, 0px) + clamp(16px, 2.6vw, 24px));
  padding-right: calc(env(safe-area-inset-right, 0px) + clamp(16px, 2.6vw, 24px));
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + clamp(10px, 2vw, 16px));

  background-color: ${({ theme }) => theme.colors.bg};
  background-image:
    ${({ theme }) => `url('${theme.backgrounds.GrammarQuizPage}')`},
    ${({ theme }) => theme.textures.dither},
    radial-gradient(1000px 500px at 15% -5%, ${({ theme }) => `${theme.colors.secondary}40`}, transparent 60%),
    radial-gradient(800px 420px at 120% 110%, ${({ theme }) => `${theme.colors.gold}30`}, transparent 70%);
  background-repeat: no-repeat, repeat, no-repeat, no-repeat;
  background-size: cover, auto, auto, auto;
  background-position: center, center, center, center;
  /* Fixed backgrounds can cause huge scroll on iOS; limit to wide viewports */
  background-attachment: fixed;
  @media (max-width: 768px) {
    background-attachment: scroll;
  }

  /* Use mobile art on tall/narrow screens */
  @media (max-aspect-ratio: 4/3) {
    background-image:
      ${({ theme }) => `url('${(theme.backgrounds as any).QuizSummaryPageMobile ?? theme.backgrounds.QuizSummaryPage}')`},
      ${({ theme }) => theme.textures.dither};
  }
`;
export const Header = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(1rem, 2vw, 1.3rem);
  text-transform: uppercase; letter-spacing: 0.06em;
  margin-bottom: 1rem; text-align: center; color: ${({ theme }) => theme.colors.onPrimary};
`;

export const QuizCard = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.card};
  padding: clamp(18px, 2.5vw, 24px);
  width: 100%;
  max-width: 560px;
  color: ${({ theme }) => theme.colors.onPrimary};
  text-align: center;

  border: 2px solid ${({ theme }) => theme.colors.borderDark};
  box-shadow: ${({ theme }) => theme.textures.border8}, 0 12px 24px rgba(0,0,0,0.25);
  backdrop-filter: blur(6px);

  /* Let content grow naturally; page can scroll if needed */

  &::before {
    content: '';
    position: absolute; inset: 6px;
    background-image: ${({ theme }) => theme.textures.scanlines};
    mix-blend-mode: multiply;
    border-radius: calc(${({ theme }) => theme.radii.card} - 6px);
    pointer-events: none;
  }
`;

export const Buttons = styled.div`
  display: flex; justify-content: center; gap: .75rem; margin-top: 1rem;
`;

export const Btn = styled.button<{ $variant?: 'primary' | 'secondary' | 'ghost' }>`
  --shadow: ${({ theme }) => theme.colors.pixelBorder};
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid var(--shadow);
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(12px, 3.2vw, 13px);
  text-transform: uppercase;
  letter-spacing: .04em;
  cursor: pointer;
  color: ${({ theme, $variant }) => $variant === 'ghost' ? theme.colors.text : theme.colors.onPrimary};
  background: ${({ theme, $variant }) =>
    $variant === 'secondary' ? theme.colors.secondary :
    $variant === 'ghost' ? theme.colors.panel :
    theme.colors.primary};
  box-shadow: 4px 4px 0 var(--shadow);
  transition: transform .1s ease, box-shadow .1s ease, opacity .15s ease;
  &:hover { transform: translateY(-1px); }
  &:active { transform: translate(4px,4px); box-shadow: 0 0 0 var(--shadow); }
`;

export const LoaderCard = styled.div`
  background: ${({ theme }) => `${theme.colors.panel}A0`};
  border-radius: ${({ theme }) => theme.radii.card};
  padding: 22px;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadow.card};
  backdrop-filter: blur(6px);
  margin: 0 auto;
`;

export const LoaderBar = styled.div`
  height: 10px; background: ${({ theme }) => `${theme.colors.textMuted}33`};
  border-radius: 999px; overflow: hidden; margin-bottom: 12px;
`;

export const LoaderFill = styled.div`
  width: 100%; height: 100%; background: linear-gradient(90deg, ${({ theme }) => theme.colors.accent}, ${({ theme }) => theme.colors.secondary});
  animation: load 0.6s linear forwards;
  @keyframes load { from { width: 0%; } to { width: 100%; } }
`;

export const LoaderText = styled.div`margin-bottom: 8px; font-weight: 600; color: ${({ theme }) => theme.colors.text};`;
export const LoaderMeta = styled.div`opacity: 0.9; font-size: 13px; display: grid; gap: 4px; color: ${({ theme }) => theme.colors.text};`;
