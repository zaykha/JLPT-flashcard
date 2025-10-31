import styled from 'styled-components';

export const Screen = styled.section`
  min-height: 100vh;
  display: grid;
  place-items: center;
  position: relative;
  padding: 24px 12px;

  background-color: ${({ theme }) => theme.colors.bg};
  background-image:
    ${({ theme }) => `url('${theme.backgrounds.QuizPage}')`},
    ${({ theme }) => theme.textures.dither},
    radial-gradient(1100px 520px at 20% -10%, ${({ theme }) => `${theme.colors.secondary}55`}, transparent 60%),
    radial-gradient(900px 500px at 120% 110%, ${({ theme }) => `${theme.colors.gold}33`}, transparent 65%);
  background-repeat: no-repeat, repeat, no-repeat, no-repeat;
  background-size: cover, auto, auto, auto;
  background-position: center, center, center, center;
  background-attachment: fixed;

  @media (max-width: 520px) {
    min-height: 100%;
    padding: 12px;
    /* if you have a dedicated mobile art, add LoginPageMobile in theme.backgrounds */
    background-image:
      ${({ theme }) =>
        `url('${(theme.backgrounds as any).QuizPageMobile ?? theme.backgrounds.QuizPage}')`},
      ${({ theme }) => theme.textures.dither};
  }
`;
/* ==== Quiz Card ==== */
export const QuizCard = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.card};
  padding: 18px;
  width: 100%;
  max-width: 520px;
  color: ${({ theme }) => theme.colors.onPrimary};
  text-align: center;

  border: 2px solid ${({ theme }) => theme.colors.borderDark};
  box-shadow: ${({ theme }) => theme.shadow.card};
  backdrop-filter: blur(6px);

  /* Pixel-border + lift */
  box-shadow:
    ${({ theme }) => theme.textures.border8},
    0 12px 24px rgba(0, 0, 0, 0.25);

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &::before {
    background-image: ${({ theme }) => theme.textures.scanlines};
    mix-blend-mode: multiply;
    inset: 6px;
    border-radius: calc(${({ theme }) => theme.radii.card} - 6px);
    box-shadow:
      inset 0 0 0 2px ${({ theme }) => `${theme.colors.border}AA`},
      inset 0 0 18px ${({ theme }) => `${theme.colors.border}66`};
  }

  &::after {
    background-image: ${({ theme }) => theme.textures.dither};
    opacity: 0.45;
  }

  @media (min-width: 768px) {
    padding: 24px;
  }

  /* Let content flow naturally; allow page to scroll */
`;

/* ==== Loader ==== */
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
`;

export const LoaderBar = styled.div`
  height: 10px;
  background: ${({ theme }) => `${theme.colors.textMuted}33`};
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 12px;
`;

export const LoaderFill = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.accent},
    ${({ theme }) => theme.colors.secondary}
  );
  animation: load 3s linear forwards;

  @keyframes load {
    from { width: 0%; }
    to { width: 100%; }
  }
`;

export const LoaderText = styled.div`
  margin-bottom: 8px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const LoaderMeta = styled.div`
  opacity: 0.9;
  font-size: 13px;
  display: grid;
  gap: 4px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

// ==== Quiz Components ====
export const TopRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
  text-align: left;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const Small = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.9;
`;

export const ProgressWrap = styled.div`
  height: 8px;
  background: ${({ theme }) => `${theme.colors.textMuted}33`};
  border-radius: 999px;
  margin-bottom: 16px;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => Math.max(0, Math.min(100, $pct))}%;
  background: 
    ${({ theme }) => theme.components.progress.fill};
  transition: width 1s linear;
`;

export const Actions = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  
`;

/* pixel-button variant */
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
  color: ${({ theme }) => theme.colors.onPrimary};

  background: ${({ $variant: variant, theme }) =>
    variant === 'secondary' ? theme.colors.secondary :
    variant === 'ghost' ? theme.colors.panel :
    theme.colors.primary};

  box-shadow: 4px 4px 0 var(--shadow);
  transition: transform .1s ease, box-shadow .1s ease, opacity .15s ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.95;
  }

  &:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 var(--shadow);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 520px) {
    padding: 10px 12px;
  }
`;
// Add near the bottom of the file
export const QuizScreen = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  /* no fixed height to avoid clipping */

  /* Full visible height without causing mobile overscroll */
  // min-height: 90dvh;
  // @supports (height: 100dvh) {
  //   min-height: 100dvh;
  // }

  /* Internal padding so content isn’t cramped */
  padding: clamp(10px, 2.4vw, 20px);
  box-sizing: border-box;

  /* Allow natural page scroll */
  overflow: visible;

  // /* Background for contrast (optional) */
  // background: ${({ theme }) => theme.colors.bg};
`;

export const QuestionArea = styled.div`
  /* Let choices render fully without inner scrolling */
  padding-bottom: 8px;
  overflow: visible;
`;

/* Wrapper around the question component so its internal scroll area can size correctly */
export const QuestionWrap = styled.div``;

/* Floating Submit button for mobile */
export const FixedSubmit = styled(Btn)`
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 10000;
  box-shadow: 6px 6px 0 ${({ theme }) => theme.colors.pixelBorder}, 0 8px 24px rgba(0,0,0,0.35);
`;
