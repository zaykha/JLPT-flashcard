import styled from 'styled-components';

// ===== Screen / Backdrop / Sheet =====
export const Screen = styled.section`
  min-height: 100vh;
  display: grid;
  place-items: center;
  position: relative;
  padding: 24px 12px;

  background-color: ${({ theme }) => theme.colors.bg};
  background-image:
    ${({ theme }) => `url('${theme.backgrounds.LoginPage}')`},
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
        `url('${(theme.backgrounds as any).LoginPageMobile ?? theme.backgrounds.LoginPage}')`},
      ${({ theme }) => theme.textures.dither};
  }
`;

export const Backdrop = styled.div`
  position: absolute; inset: 0;
  /* subtle dark veil that adapts to theme */
  background: linear-gradient(
    to right,
    ${({ theme }) => `${theme.colors.bg}26`},
    ${({ theme }) => `${theme.colors.bg}26`}
  );
`;

export const Sheet = styled.div`
  position: relative;
  z-index: 1;
  width: min(420px, 102vw);
  color: ${({ theme }) => theme.colors.text};
  padding: 30px;
  backdrop-filter: blur(8px);

  /* translucent panel using theme */
  background: ${({ theme }) => `${theme.colors.panel}80`}; /* ~50% */
  border-radius: ${({ theme }) => theme.radii.card};
  font-weight: 700;
  box-shadow: ${({ theme }) => theme.shadow.card};
  border: 2px solid ${({ theme }) => theme.colors.borderDark};
  -webkit-backface-visibility: hidden;

  /* sprite-like inner border + outer lift */
  box-shadow:
    ${({ theme }) => theme.textures.border8},
    0 12px 24px rgba(0,0,0,0.25);

  overflow: hidden;

  /* overlays: scanlines + dither */
  &::before, &::after {
    content: '';
    position: absolute; inset: 0;
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
  &::after { background-image: ${({ theme }) => theme.textures.dither}; opacity: .5; }

  @media (max-width: 520px) {
    width: 100%;
    padding: 16px 14px;
    background: ${({ theme }) => `${theme.colors.panel}40`}; /* lighter veil on phones */
  }
`;

// ===== Header =====
export const Brand = styled.div`
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10px;
`;

export const Logo = styled.img`
  width: clamp(96px, 28vw, 180px);
  height: clamp(96px, 28vw, 180px);
  object-fit: contain;
  margin-top: clamp(10px, 4vw, 40px);
  @media (max-width: 520px) {
    width: clamp(56px, 28vw, 180px);
    height: clamp(56px, 28vw, 180px);
    margin-top: 0;
  }
`;

export const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(20px, 6vw, 35px);
  line-height: 1.2;
  margin: 0 0 8px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.gold};
  text-align: center;
  text-shadow:
    1px 1px 0 ${({ theme }) => theme.colors.accent},
    2px 2px 0 ${({ theme }) => theme.colors.accent},
    3px 3px 0 ${({ theme }) => theme.colors.accent},
    4px 4px 0 rgba(0,0,0,0.6),
    5px 5px 4px rgba(0,0,0,0.8);
`;

export const Subtitle = styled.p`
  margin: 0 0 16px;
  color: ${({ theme }) => theme.colors.sakura}; /* bright on both */
  font-size: clamp(14px, 4.4vw, 18px);
  text-align: center;
  text-shadow:
    1px 1px 0 ${({ theme }) => theme.colors.secondary},
    2px 2px 0 ${({ theme }) => theme.colors.secondary},
    3px 3px 2px rgba(0,0,0,0.7);
`;

// ===== Buttons =====
export const Primary = styled.button`
  width: 100%;
  padding: clamp(12px, 3.6vw, 16px) clamp(14px, 4.5vw, 20px);
  margin-top: 8px;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(12px, 3.6vw, 14px);
  font-weight: 800;
  color: ${({ theme }) => theme.components.button.primary.fg};
  text-transform: uppercase;
  letter-spacing: .06em;
  cursor: pointer;

  background: ${({ theme }) => theme.components.button.primary.bg};
  border: 4px solid ${({ theme }) => theme.colors.pixelBorder};
  border-radius: 12px;
  box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.pixelBorder};
  transition: transform .1s ease, box-shadow .1s ease, background .15s ease;

  &:hover { background: ${({ theme }) => theme.components.button.primary.hover}; }
  &:active { transform: translate(4px, 4px); box-shadow: 0 0 0 ${({ theme }) => theme.colors.pixelBorder}; }

  &:disabled {
    background: ${({ theme }) => `${theme.components.button.primary.bg}CC`};
    cursor: not-allowed;
    box-shadow: 2px 2px 0 ${({ theme }) => theme.colors.pixelBorder};
    opacity: .85;
    transform: none;
  }
`;

export const SocialBtn = styled.button`
  width: 100%;
  display: flex; align-items: center; justify-content: center;
  gap: 10px;
  font-family: ${({ theme }) => theme.fonts.body};
  padding: clamp(10px, 3.6vw, 14px) clamp(12px, 4.4vw, 18px);
  font-weight: 600;
  font-size: clamp(12px, 3.4vw, 13px);
  text-transform: uppercase;
  cursor: pointer;

  background: ${({ theme }) => theme.colors.onPrimary ?? theme.colors.panel};
  color: ${({ theme }) => theme.colors.text};
  border: 3px solid ${({ theme }) => theme.colors.borderDark};
  border-radius: 12px;
  box-shadow: 4px 4px 0 ${({ theme }) => theme.colors.borderDark};
  transition: transform .1s ease, box-shadow .1s ease, background .15s ease;

  &:hover { background: ${({ theme }) => `${theme.colors.panel}`}; }
  &:active { transform: translate(4px, 4px); box-shadow: 0 0 0 ${({ theme }) => theme.colors.borderDark}; }

  &:disabled { opacity: .6; cursor: not-allowed; box-shadow: none; }

  @media (max-width: 520px) { gap: 8px; font-size: 10px; }
`;

export const ButtonsCol = styled.div`
  display: grid; gap: 18px;
  margin-bottom: clamp(30px, 10vw, 70px);
`;

// ===== Footer =====
export const Legal = styled.p`
  position: absolute; left: 0; right: 0;
  bottom: max(8px, env(safe-area-inset-bottom));
  margin: 0; text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: clamp(10px, 2.8vw, 12px);
  line-height: 1.3;

  a { color: ${({ theme }) => theme.colors.primary}; text-decoration: none; }
`;
export const Legal1 = styled.div`
  margin-top: 8;
  display: flex; 
  gap: 12px; 
  flex-wrap: wrap; 
  justify-content: center; 
  z-index: 2; 
  position: relative;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: clamp(10px, 2.8vw, 12px);
  // line-height: 1.3;

  a { color: ${({ theme }) => theme.colors.primary}; text-decoration: none; }
`;
// ===== Modal =====
export const ModalOverlay = styled.div`
  position: fixed; inset: 0; z-index: 20;
  display: grid; place-items: center;
  padding: clamp(24px, 6vw, 48px) clamp(16px, 5vw, 36px);
  background: ${({ theme }) => `${theme.colors.bg}D1`}; /* ~82% */
  backdrop-filter: blur(6px);
`;

export const ModalContent = styled.div`
  position: relative;
  width: min(480px, 100%);
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 3px solid ${({ theme }) => `${theme.colors.border}2E`};
  box-shadow: ${({ theme }) => theme.shadow.card};
  overflow: hidden;
  background: ${({ theme }) => theme.gradient.slate};
  color: ${({ theme }) => theme.colors.text};

  &::before {
    content: "";
    position: absolute; inset: 0;
    background: ${({ theme }) => `${theme.colors.sheetBg}AD`};
    pointer-events: none;
  }
`;

export const ModalInner = styled.div`
  position: relative;
  padding: clamp(22px, 5vw, 32px);
  display: grid; gap: 18px;
`;

export const ModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: clamp(16px, 4.6vw, 22px);
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

export const CloseButton = styled.button`
  appearance: none; border: none;
  background: ${({ theme }) => `${theme.colors.border}30`};
  color: ${({ theme }) => theme.colors.text};
  width: 34px; height: 34px;
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid; place-items: center;
  cursor: pointer;
  transition: background .15s ease, transform .15s ease;

  &:hover { background: ${({ theme }) => `${theme.colors.border}55`}; }
  &:active { transform: scale(0.96); }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

// ===== Form =====
export const EmailForm = styled.form`
  display: grid; gap: 14px;
`;

export const Field = styled.label`
  display: grid; gap: 8px;
  font-size: 12px; letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => `${theme.colors.text}C7`};

  span { font-size: inherit; }
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => `${theme.colors.panel}8C`};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 14px; letter-spacing: 0.03em;
  transition: border-color .2s ease, box-shadow .2s ease;

  &::placeholder { color: ${({ theme }) => `${theme.colors.textMuted}`}; }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.accent}40`};
  }
`;

export const ErrorText = styled.p`
  margin: 0; font-size: 12px; color: ${({ theme }) => theme.components.quiz?.incorrect ?? '#F0523D'};
  letter-spacing: 0.05em;
`;

export const ToggleModeButton = styled.button`
  justify-self: center;
  background: none; border: none; padding: 0;
  font-size: 12px; letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => `${theme.colors.text}BF`};
  cursor: pointer; transition: color .15s ease;

  &:hover { color: ${({ theme }) => theme.colors.accent}; }
  &:disabled { color: ${({ theme }) => `${theme.colors.textMuted}`}; cursor: not-allowed; }
`;

// ===== Inline Google icon stays the same (or tint by theme if you want)
