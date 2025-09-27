import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/store/auth';
import { useTopics } from '@/store/topics';
import { useSRS } from '@/store/srs';

import { normalizeList } from '@/lib/normalize';
import { makeTopicGroups } from '@/lib/group';
import { useJLPTWords } from '@/lib/api';
import { levelStrToNum } from '@/lib/jlpt-level';
import { useUserProfile } from '@/hooks/useUserProfile';

import { LoginPage } from '@/pages/LoginPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { HomePage } from '@/pages/HomePage';
import { StudySettings } from '@/pages/StudySettings';
import { FlashcardsPage } from '@/pages/FlashcardsPage';
import { QuizPage } from '@/pages/QuizPage';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding:16 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireProfile({ children }: { children: React.ReactNode }) {
  const { data: profile, isLoading } = useUserProfile();
  const loc = useLocation();

  if (isLoading) return <div style={{ padding:16 }}>Loading profile…</div>;
  if (!profile) return <Navigate to="/onboarding" state={{ from: loc.pathname }} replace />;
  return <>{children}</>;
}

export default function App() {
  // auth
  const { init } = useAuth();
  useEffect(() => { init(); }, [init]);

  // hydrate stores
  const srsHydrated = useSRS(s => s.hydrated);
  const hydrateSrs = useSRS(s => s.hydrate);
  const topicsHydrated = useTopics(s => s.hydrated);
  const hydrateTopics = useTopics(s => s.hydrate);
  useEffect(() => { if (!srsHydrated) hydrateSrs(); }, [srsHydrated, hydrateSrs]);
  useEffect(() => { if (!topicsHydrated) hydrateTopics(); }, [topicsHydrated, hydrateTopics]);

  // profile → derive level → fetch vocab for that level
  const { data: profile } = useUserProfile();
  const apiLevel = profile ? levelStrToNum(profile.vocabLevel) : undefined;
  const { data: words } = useJLPTWords(apiLevel);

  const setAllWords = useTopics(s => s.setAllWords);
  const setGroups = useTopics(s => s.setGroups);

  useEffect(() => {
    if (!words) return;
    const normalized = normalizeList(words);
    const { groups, withTopics } = makeTopicGroups(normalized);
    setAllWords(withTopics);
    setGroups(groups);
  }, [words, setAllWords, setGroups]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/onboarding" element={<Protected><OnboardingPage/></Protected>} />

        <Route path="/" element={<Protected><RequireProfile><HomePage/></RequireProfile></Protected>} />
        <Route path="/flashcards" element={<Protected><RequireProfile><FlashcardsPage/></RequireProfile></Protected>} />
        <Route path="/quiz" element={<Protected><RequireProfile><QuizPage/></RequireProfile></Protected>} />

        {/* keep StudySettings for grammar placeholder or remove if not needed */}
        <Route path="/study" element={<Protected><RequireProfile><StudySettings/></RequireProfile></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
