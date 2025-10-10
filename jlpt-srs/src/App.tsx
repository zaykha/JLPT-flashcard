import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StudyFlowRouter } from '@/pages/StudyFlowRouter';
import { useAuth } from '@/store/auth';
import { useSRS } from '@/store/srs';
// import { useUserProfile } from '@/hooks/useUserProfile';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

import { LoginPage } from '@/pages/LoginPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { HomePage } from '@/pages/HomePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { walletRoute } from '@/routes/walletRoute';
import type { JLPTLevelStr } from '@/lib/user-data';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen label="Loading" sublabel="Checking your save data…" />;
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
    // if (existing) {
    //     console.group('[RequireProfile] 🧭 Loaded from localStorage');
    //     console.log('Profile:', existing.profile);
    //     console.log('Progress:', existing.progress);
    //     console.log('Catalog Level:', existing.catalogLevel);
    //     console.log('CachedAt:', new Date(existing.cachedAt).toLocaleString());
    //     console.groupEnd();
    //   } else {
    //     console.warn('[RequireProfile] ⚠️ No bootstrap found in localStorage');
    //   }

function RequireProfile({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const [ready, setReady] = React.useState(false);
  const [hasProfile, setHasProfile] = React.useState<boolean>(false);

React.useEffect(() => {
  (async () => {
    const { loadBootstrap, saveBootstrap } = await import('@/lib/bootstrap');
    const existing = loadBootstrap();

    // 1️⃣ Use local bootstrap if valid
    if (existing?.profile && existing?.lessonProgress && existing?.lessonCatalog) {
      console.info('[RequireProfile] ✅ Using local bootstrap');
      setHasProfile(true);
      setReady(true);
      return;
    }

    // 2️⃣ Otherwise fetch full initial snapshot
    try {
      const { fetchInitialSnapshot } = await import('@/lib/initial-fetch');
      const snapshot = await fetchInitialSnapshot();

      // store in bootstrap for later use
      saveBootstrap({
        profile: { ...snapshot.profile, avatarKey: snapshot.profile.avatarKey ?? undefined },
        lessonProgress: snapshot.lessonProgress,
        catalogLevel: snapshot.lessonCatalog?.level,
        wallet: { wallet: snapshot.wallet, transactions: [] }, // Ensure WalletResponse structure
        srsSummary: snapshot.srsSummary,
        cachedAt: Date.now(),
      });

      (window as any).__KOZA_BOOTSTRAP__ = snapshot;
      console.group('[RequireProfile] 🌍 Bootstrapped from Firestore');
      console.log(snapshot);
      console.groupEnd();

      setHasProfile(true);
    } catch (err) {
      console.error('[RequireProfile] ❌ Failed to fetch initial snapshot', err);
      setHasProfile(false);
    } finally {
      setReady(true);
    }
  })();
}, []);


  if (!ready) {
    return <LoadingScreen label="Syncing profile" sublabel="Fetching your study plan…" />;
  }

  if (!hasProfile) {
    return <Navigate to="/onboarding" state={{ from: loc.pathname }} replace />;
  }

  return <>{children}</>;
}


export default function App() {
  const { init } = useAuth();
  useEffect(() => { init(); }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<Protected><OnboardingPage /></Protected>} />

        <Route path="/" element={<Protected><RequireProfile><HomePage /></RequireProfile></Protected>} />
        <Route
          path="/flashcards"
          element={
            <Protected>
              <RequireProfile>
                <StudyFlowRouter />
              </RequireProfile>
            </Protected>
          }
        />

        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path={walletRoute.path}
          element={
            <Protected>
              <RequireProfile>
                {React.createElement(walletRoute.component)}
              </RequireProfile>
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
