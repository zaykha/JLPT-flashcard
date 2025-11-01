import React, { useCallback, useEffect, useState } from 'react';
import { FooterNav } from '@/styles/Pages/Marketing/Shared';
import { Link } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { Navigate } from 'react-router-dom';
import { Screen, Backdrop, Sheet, Brand, Logo, Title, Subtitle,
  Primary, SocialBtn, ButtonsCol, Legal,
  ModalOverlay, ModalContent, ModalInner, ModalHeader, ModalTitle, CloseButton,
  EmailForm, Field, Input, ErrorText, ToggleModeButton, 
  Legal1} from '@/styles/Pages/LoginPage.styles';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

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
  const GoogleIcon = () => ( <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden> <path fill="#EA4335" d="M12 10.2v3.9h6.5c-.3 2-2.2 5.9-6.5 5.9-3.9 0-7.1-3.2-7.1-7.1S8.1 5.8 12 5.8c2.2 0 3.6.9 4.4 1.7l3-3C17.8 3 15.2 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.9 0-.7-.1-1.1-.1-1.6H12Z"/> </svg> );
  if (user) return <Navigate to="/" replace />;
  return (
    <Screen>
      <Backdrop />
      <Sheet>
        <ThemeToggle />
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

        {/* Public links inside the sheet for safe z-index and clickability */}
        {/* <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', zIndex: 2, position: 'relative' }}> */}
           <Legal1>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/refunds">Refunds</Link>
            <Link to="/commerce">Commerce</Link>
          </Legal1>
          
        {/* </div> */}

        {/* <Legal>
          By continuing, you agree to our <a href="/terms">Terms of Use</a> and{" "}
          <a href="/privacy">Privacy Policy</a>.
        </Legal> */}
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
