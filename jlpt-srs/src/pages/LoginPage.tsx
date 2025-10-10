import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/store/auth';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
// import kozalogin from "@/assets/Loginpage/kozalogin.png";
// import kozalogin1 from "@/assets/Loginpage/kozalogin1.png";
// import logincardbg from "@/assets/Loginpage/logincardbg.png";
// import logo from "@/assets/Logos/kozaLogo1.png";

/** ======= Layout ======= */
const Screen = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: url(/homepagebg3.jpg) center/cover no-repeat fixed;
  position: relative;
  padding: 24px 12px;

  @media (max-width: 520px) {
    min-height: 100%;
    padding: 12px;
    background: url(/kozakadomb1.jpg) center/cover no-repeat fixed;
  }
`;

const Backdrop = styled.div`
  position: absolute; inset: 0;
  background: linear-gradient(to right, rgba(0,0,0,.15), rgba(0,0,0,.15));
  
`;

const Sheet = styled.div`
  position: relative;
  z-index: 1;
  width: min(420px, 102vw);
  color: #fff;
  padding: 30px;
  backdrop-filter: blur(3px);
background: linear-gradient(90deg,rgba(99, 114, 81, 1) 0%, rgba(125, 137, 103, 1) 50%, rgba(99, 114, 81, 1) 100%);    // position: absolute;
    inset: 0;
    // display: flex;
    // justify-content: center;
    // align-items: center;
    border-radius: ${({ theme }) => theme.radii.card};
    font-weight: 700;
    padding: 1rem;
    box-shadow: ${({ theme }) => theme.shadow.card};
    border: 2px solid rgba(0,0,0,0.25);
    -webkit-backface-visibility: hidden; /* Safari */
    /* sprite-like inner border */
    box-shadow:
      ${({ theme }) => theme.textures.border8},
      0 12px 24px rgba(0,0,0,0.25);
    // position: relative;
    overflow: hidden;

    /* overlays: scanlines + dither */
    &::after, &::before {
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
      pointer-events: none;
      box-shadow:
        inset 0 0 0 2px rgba(255,255,255,0.08),   /* crisp inner stroke */
        inset 0 0 18px rgba(255,255,255,0.06);    /* soft glow */
    }
    &::after {
      background-image: ${({ theme }) => theme.textures.dither};
      opacity: 0.5;
    }

  @media (max-width: 520px) {
    width: 100%;
    padding: 16px 14px;
    background: transparent;   /* no background color */

    // &::before {
    //   content: none;           /* completely remove pseudo-element */
    //   display: none;
    //   background: none;
    // }
  }
`;


/** ======= Header ======= */
const Brand = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const Logo = styled.img`
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

const Title = styled.h1`
  /* Font Styling for Retro Game Look */
  /* Use a pixel/retro font if available, or monospace as a fallback */
  font-size: clamp(20px, 6vw, 35px);
  line-height: 1.2;
  margin: 0 0 8px;
  font-weight: 700;
  
  /* Base Color - Brighter/More 'Gamey' */
  color: #FFC300;
  text-align: center;
  
  /* 3D Depth and Drop Shadow using multiple text-shadow layers */
  text-shadow: 
    /* 3D Depth layers (to the right and down) */
    1px 1px 0 #A80000,
    2px 2px 0 #A80000,
    3px 3px 0 #A80000,
    
    /* Strong Drop Shadow (further out, darker, with slight blur for better effect) */
    4px 4px 0 #4B0000,
    5px 5px 4px #000000;
`;

const Subtitle = styled.p`
  /* Font Styling for Retro Game Look */
  /* Use a pixel/retro font if available, or monospace as a fallback */
  margin: 0 0 16px;
  
  /* Base Color */
  color: #FFFFFF;
  font-size: clamp(14px, 4.4vw, 18px);
  text-align: center;

  /* 3D Depth and Drop Shadow - Subtler than the Title */
  text-shadow: 
    /* 3D Depth layers (to the right and down) */
    1px 1px 0 #006400, /* Dark Green layer 1 */
    2px 2px 0 #006400, /* Dark Green layer 2 */

    /* Strong Drop Shadow */
    3px 3px 2px #000000; /* Dark shadow, slight blur */
`;


/** ======= Buttons ======= */
const Primary = styled.button`
  width: 100%;
  padding: clamp(12px, 3.6vw, 16px) clamp(14px, 4.5vw, 20px);
  margin-top: 8px;
  font-family: ${(p) => p.theme.fonts.body};
  font-size: clamp(12px, 3.6vw, 14px);
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: .06em;
  cursor: pointer;

  background: #8B6B3F;
  border: 4px solid #4a351f;
  border-radius: 12px;
  box-shadow: 4px 4px 0 #4a351f;
  transition: transform .1s ease, box-shadow .1s ease, background .15s ease;

  &:hover { background: #a37e4b; }
  &:active { transform: translate(4px, 4px); box-shadow: 0 0 0 #4a351f; }

  &:disabled {
    background: #6c5432;
    cursor: not-allowed;
    box-shadow: 2px 2px 0 #392614;
    opacity: .85;
    transform: none;
  }
`;

const SocialBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: ${(p) => p.theme.fonts.body};

  padding: clamp(10px, 3.6vw, 14px) clamp(12px, 4.4vw, 18px);
  font-weight: 500;
  font-size: clamp(12px, 3.4vw, 13px);
  text-transform: uppercase;
  cursor: pointer;

  background: #f7f7f7;
  color: #111;
  border: 3px solid #333;
  border-radius: 12px;
  box-shadow: 4px 4px 0 #333;
  transition: transform .1s ease, box-shadow .1s ease, background .15s ease;

  &:hover { background: #eaeaea; }
  &:active { transform: translate(4px, 4px); box-shadow: 0 0 0 #333; }

  &:disabled {
    opacity: .6;
    cursor: not-allowed;
    box-shadow: none;
  }

  @media (max-width: 520px) {
    gap: 8px;
    font-size: 10px;
  }
`;

const ButtonsCol = styled.div`
  display: grid;
  gap: 18px;
  margin-bottom: clamp(30px, 10vw, 70px);
`;

/** ======= Footer ======= */
const Legal = styled.p`
  position: absolute;
  left: 0; right: 0;
  bottom: max(8px, env(safe-area-inset-bottom));
  margin: 0;
  text-align: center;
  color: #e3e3e3;
  font-size: clamp(10px, 2.8vw, 12px);
  line-height: 1.3;

  a { color: #8B6B3F; text-decoration: none; }
`;


/** ======= Inline Icons (you can swap to files later) ======= */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path fill="#EA4335" d="M12 10.2v3.9h6.5c-.3 2-2.2 5.9-6.5 5.9-3.9 0-7.1-3.2-7.1-7.1S8.1 5.8 12 5.8c2.2 0 3.6.9 4.4 1.7l3-3C17.8 3 15.2 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.9 0-.7-.1-1.1-.1-1.6H12Z"/>
  </svg>
);

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: clamp(24px, 6vw, 48px) clamp(16px, 5vw, 36px);
  background: rgba(6, 8, 12, 0.82);
  backdrop-filter: blur(6px);
`;

const ModalContent = styled.div`
  position: relative;
  width: min(480px, 100%);
  border-radius: ${(p) => p.theme.radius.lg};
  border: 3px solid rgba(255, 255, 255, 0.18);
  box-shadow: ${(p) => p.theme.shadow.card};
  overflow: hidden;
  background: ${(p) => p.theme.gradient.slate};
  color: #f9fafb;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(8, 11, 20, 0.68);
    pointer-events: none;
  }
`;

const ModalInner = styled.div`
  position: relative;
  padding: clamp(22px, 5vw, 32px);
  display: grid;
  gap: 18px;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: clamp(16px, 4.6vw, 22px);
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const CloseButton = styled.button`
  appearance: none;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #f3f4f6;
  width: 34px;
  height: 34px;
  border-radius: ${(p) => p.theme.radius.md};
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background .15s ease, transform .15s ease;

  &:hover { background: rgba(255, 255, 255, 0.16); }
  &:active { transform: scale(0.96); }
  &:focus-visible {
    outline: 2px solid #ffc300;
    outline-offset: 2px;
  }
`;

const EmailForm = styled.form`
  display: grid;
  gap: 14px;
`;

const Field = styled.label`
  display: grid;
  gap: 8px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(248, 250, 252, 0.78);

  span {
    font-size: inherit;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: ${(p) => p.theme.radius.md};
  border: 2px solid rgba(255, 255, 255, 0.18);
  background: rgba(12, 9, 5, 0.55);
  color: #fff;
  font-family: ${(p) => p.theme.fonts.body};
  font-size: 14px;
  letter-spacing: 0.03em;
  transition: border-color .2s ease, box-shadow .2s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.55);
  }

  &:focus {
    outline: none;
    border-color: #ffc300;
    box-shadow: 0 0 0 2px rgba(255, 195, 0, 0.25);
  }
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #ff9b9b;
  letter-spacing: 0.05em;
`;

const ToggleModeButton = styled.button`
  justify-self: center;
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  transition: color .15s ease;

  &:hover {
    color: #ffc300;
  }

  &:disabled {
    color: rgba(255, 255, 255, 0.4);
    cursor: not-allowed;
  }
`;

export const LoginPage: React.FC = () => {
  const {
    user,
    signInGoogle,
    signInEmail,
    signUpEmail,
    loading,
    error,
  } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showAuthError, setShowAuthError] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const helperText = localError ?? (showAuthError ? error : null);

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setMode('signin');
    setLocalError(null);
    setShowAuthError(false);
  }, []);

  useEffect(() => {
    if (!emailModalOpen || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setEmailModalOpen(false);
        resetForm();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [emailModalOpen, resetForm]);

  const openEmailModal = () => {
    resetForm();
    setEmailModalOpen(true);
  };

  const closeEmailModal = () => {
    setEmailModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    setShowAuthError(false);

    if (!trimmedEmail) {
      setLocalError('Please enter your email address.');
      return;
    }

    if (!trimmedPassword) {
      setLocalError('Please enter your password.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLocalError(null);
      setShowAuthError(false);
      if (mode === 'signin') {
        await signInEmail(trimmedEmail, trimmedPassword);
      } else {
        await signUpEmail(trimmedEmail, trimmedPassword);
      }
    } catch {
      // Error is handled and exposed by the auth store
      setShowAuthError(true);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
    setLocalError(null);
    setShowAuthError(false);
  };

  if (user) return <Navigate to="/" replace />;
  return (
    <Screen>
      <Backdrop />
      <Sheet>
        <Brand>
          <Logo src={'/kozaLogo1.png'} alt="Koza World" />
          <Title>KOZA World</Title>
          <Subtitle>Take your Japanese to the next level.</Subtitle>
        </Brand>

        <ButtonsCol>
          <Primary type="button" onClick={openEmailModal} disabled={loading}>
            Continue with email
          </Primary>

          <SocialBtn type="button" onClick={signInGoogle} disabled={loading}>
            <GoogleIcon /> Continue with Google
          </SocialBtn>
        </ButtonsCol>

        <Legal>
          By continuing, you agree to our <a href="/terms">Terms of Use</a> and{" "}
          <a href="/privacy">Privacy Policy</a>.
        </Legal>
      </Sheet>
      {emailModalOpen ? (
        <ModalOverlay
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-login-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEmailModal();
          }}
        >
          <ModalContent>
            <ModalInner>
              <ModalHeader>
                <ModalTitle id="email-login-title">
                  {mode === 'signin' ? 'Log in with email' : 'Create your account'}
                </ModalTitle>
                <CloseButton type="button" onClick={closeEmailModal} aria-label="Close email login">
                  X
                </CloseButton>
              </ModalHeader>

              <EmailForm onSubmit={handleSubmit}>
                <Field>
                  <span>Email</span>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setLocalError(null);
                      setShowAuthError(false);
                    }}
                    disabled={loading}
                    required
                  />
                </Field>

                <Field>
                  <span>Password</span>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setLocalError(null);
                      setShowAuthError(false);
                    }}
                    disabled={loading}
                    required
                  />
                </Field>

                {helperText ? <ErrorText role="alert">{helperText}</ErrorText> : null}

                <Primary type="submit" disabled={loading}>
                  {loading ? 'Please wait...' : mode === 'signin' ? 'Log in' : 'Create account'}
                </Primary>
              </EmailForm>

              <ToggleModeButton type="button" onClick={toggleMode} disabled={loading}>
                {mode === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Log in'}
              </ToggleModeButton>
            </ModalInner>
          </ModalContent>
        </ModalOverlay>
      ) : null}
    </Screen>
  );
};
