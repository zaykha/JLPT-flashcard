import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StudyFlowRouter } from '@/pages/StudyFlowRouter';
import { useAuth } from '@/store/auth';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

import { LoginPage } from '@/pages/LoginPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { HomePage } from '@/pages/HomePage';
import { ThemedBackground } from './components/layout/ThemeBackground';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { ensureDailyQueue } from './services/StudyPlanV1';
import { syncLessonProgressFromFirestore } from './lib/synLessonProgress';
import type { LessonProgress } from './types/lessonV1';
import PrerequisitePage from './pages/PrerequisitePage';
import { WalletPage } from './features/wallet/WalletPage';
import PurchasePage from './pages/PurchasePage';
import SettingsPage from './pages/SettingsPage';
import ReviewLessonPage from './pages/ReviewLessonPage';
import AboutPage from '@/pages/Marketing/AboutPage';
import ContactPage from '@/pages/Marketing/ContactPage';
import PrivacyPage from '@/pages/Marketing/PrivacyPage';
import RefundsPage from '@/pages/Marketing/RefundsPage';
import TermsPage from '@/pages/Marketing/TermsPage';
import CommercePage from '@/pages/Marketing/CommercePage';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingScreen label="Loading" sublabel="Checking your save data…" />;
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireProfile({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const [ready, setReady] = React.useState(false);
  const [hasProfile, setHasProfile] = React.useState<boolean>(false);
  const ranOnce = React.useRef(false);

  // ---- Reconcile & sync (runs once on app entry) ----
  async function reconcileProgress(uid: string, snapshot: any) {
    const [{ saveBootstrap, loadBootstrap }, { jstTodayISO }] = await Promise.all([
      import('@/lib/bootstrap'),     // @dynamic-import
      import('@/lib/cache/lessons'), // @dynamic-import
    ]);

    const todayISO = jstTodayISO();
    const perDay = 2 as 2;

    // Pull snapshot parts (server truth)
    const lp = snapshot?.lessonProgress ?? { completed: [], failed: [], current: [], examsStats: [] };
    const cat = snapshot?.lessonCatalog;
    const levelRange: { start: number; end: number } | undefined =
      (cat?.lessonRange &&
        typeof cat.lessonRange.start === 'number' &&
        typeof cat.lessonRange.end === 'number')
        ? { start: cat.lessonRange.start, end: cat.lessonRange.end }
        : undefined;

    // Ensure daily queue whenever we have a valid server profile/level.
    try {
      if (levelRange) {
        await ensureDailyQueue(uid, { levelRange, perDay }, { todayISO });
      }
    } catch (e) {
      console.warn('[RequireProfile] ensureDailyQueue failed', e);
    }

    // Immediately re-pull from Firestore → save to bootstrap → bump bootRevision
    try {
      await syncLessonProgressFromFirestore(uid); // bumps revision only when changed
    } catch (e) {
      console.warn('[RequireProfile] syncLessonProgressFromFirestore failed', e);
    }

    // Build full bootstrap bundle using the freshly-synced progress as source of truth
    const fresh = loadBootstrap();
    const freshProgress: LessonProgress =
      (fresh?.lessonProgress as LessonProgress) ??
      (lp as LessonProgress) ??
      { completed: [], failed: [], current: [], examsStats: [] };

    // Optional: srsToday compute (non-blocking)
    let srsToday: number[] | undefined = undefined;
    try {
      const { srsDueOnDate } = await import('@/helpers/srsV1'); // @dynamic-import
      srsToday = srsDueOnDate(snapshot?.srsSummary, todayISO);
    } catch {}

    // Persist unified bootstrap once (idempotent)
    saveBootstrap({
      profile: {
        uid: snapshot.profile?.uid,
        nickname: snapshot.profile?.nickname,
        avatarKey: snapshot.profile?.avatarKey ?? null,
        accountType: snapshot.profile?.accountType,
        jlptLevel: snapshot.profile?.jlptLevel,
        createdAt: snapshot.profile?.createdAt,
        updatedAt: snapshot.profile?.updatedAt,
      },
      lessonCatalog: snapshot?.lessonCatalog ?? fresh?.lessonCatalog ?? null,
      lessonProgress: freshProgress,
      catalogLevel: snapshot?.lessonCatalog?.level,
      wallet: { wallet: snapshot?.wallet, transactions: [] },
      srsSummary: snapshot?.srsSummary,
      srsToday,
      cachedAt: Date.now(),
    } as any);
  }

  React.useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    (async () => {
      try {
        const { fetchInitialSnapshot } = await import('@/lib/initial-fetch'); // @dynamic-import
        const { loadBootstrap } = await import('@/lib/bootstrap'); // @dynamic-import

        // Fresh snapshot from server (profile, wallet, progress, srs, catalog)
        const snapshot = await fetchInitialSnapshot();
        const uid = snapshot.profile?.uid as string;

        // Reconcile daily queue (rollover, assignment) + sync bootstrap from Firestore
        await reconcileProgress(uid, snapshot);

        // Wallet now syncs directly from Firestore (onSnapshot) via WalletProvider/useWalletSync

        // Bootstrap is now up-to-date (RequireProfile does not re-save stale snapshot).
        if (process.env.NODE_ENV !== 'production') {
          (window as any).__KOZA_BOOTSTRAP__ = loadBootstrap();
        }
        // Gate: if the server profile has a JLPT level set, consider onboarding complete.
        const hasServerProfile = Boolean(snapshot?.profile?.jlptLevel);
        setHasProfile(hasServerProfile);
      } catch (err) {
        console.error('[RequireProfile] ❌ Failed to fetch/reconcile snapshot', err);
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
  React.useEffect(() => {
    // One-shot; avoids re-subscribing auth listeners if `init` identity changes
    useAuth.getState().init?.();
  }, []);

  return (
    <BrowserRouter>
      <ThemedBackground />
      <Routes>
        <Route path="/welcome" element={<PrerequisitePage />} />
        <Route path="/login" element={<PrereqGate><LoginPage /></PrereqGate>} />
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
        <Route path="/diagnostics" element={<Protected><DiagnosticsPage /></Protected>} />
        <Route path="/wallet" element={<Protected><RequireProfile><WalletPage /></RequireProfile></Protected>} />
        <Route path="/purchase" element={<Protected><RequireProfile><PurchasePage /></RequireProfile></Protected>} />
        <Route path="/settings" element={<Protected><RequireProfile><SettingsPage /></RequireProfile></Protected>} />
        {/* Public marketing/legal pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/refunds" element={<RefundsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/commerce" element={<CommercePage />} />
        <Route
          path="/review-lesson/:lessonNos"
          element={
            <Protected>
              <RequireProfile>
                <ReviewLessonPage />
              </RequireProfile>
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Gate: ensure the user has acknowledged the prerequisite screen before login
function PrereqGate({ children }: { children: React.ReactNode }) {
  const ok = (() => {
    try { return localStorage.getItem('koza.prereq.ok') === '1'; } catch { return false; }
  })();
  return ok ? <>{children}</> : <Navigate to="/welcome" replace />;
}
