import React from 'react';
import { useAuth } from '@/store/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { BackButton } from '@/styles/Pages/Marketing/Shared';

export const BackToMain: React.FC = () => {
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const go = React.useCallback(() => {
    // If URL has ?from=..., honor it
    const url = new URL(window.location.href);
    const from = url.searchParams.get('from');
    if (from === 'login' || from === '/login') return nav('/login', { replace: true });
    if (from === 'welcome' || from === '/welcome' || from === 'prereq') return nav('/welcome', { replace: true });
    if (from === 'home' || from === '/' ) return nav('/', { replace: true });

    // Fallback: if signed in → Home; else prerequisite or login depending on gate
    if (user) return nav('/', { replace: true });
    try {
      const ok = localStorage.getItem('koza.prereq.ok') === '1';
      return nav(ok ? '/login' : '/welcome', { replace: true });
    } catch {
      return nav('/login', { replace: true });
    }
  }, [nav, user, loc.key]);

  return (
    <BackButton type="button" onClick={go} aria-label="Back to main">← Back</BackButton>
  );
};

export default BackToMain;

