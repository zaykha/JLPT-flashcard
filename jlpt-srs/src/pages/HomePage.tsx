import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useAuth } from '@/store/auth';
import { useSession } from '@/store/session';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useLessonProgress } from '@/hooks/useLessonProgress';
import { useLessonCatalog } from '@/hooks/useLessonCatalog';
import { useTopics } from '@/store/topics';
import { useSRS } from '@/store/srs';
import type { SRSCard } from '@/types/vocab';

import { SettingsModal } from '@/components/settings/SettingsModal';
import { AchievementScrolls } from '@/components/home/AchievementScrolls';
import { ShardHUD } from '@/components/TopBar/ShardHUD';

import {
  DEFAULT_SCROLLS,
  LOCAL_LESSON_KEY,
} from '@/lib/home/constants';

import {
  buildProgressInsights,
  computeStreakStats,
  formatAverageTime,
  formatScore,
} from '@/lib/home/insights';

import type { ProgressInsights, QuizType } from '@/lib/home/types';

import { HeaderBarHome } from '@/components/home/HeaderBar';
import { StudySection } from '@/components/home/StudySection';
import { QuizInsights } from '@/components/home/QuizInsights';
import { StreakCalendar } from '@/components/home/StreakCalendar';
import { QuizStatsModal } from '@/components/home/QuizStatsModal';

import { getTotalLessonsForLevel } from '@/lib/constants/lessons';
import type {
  LessonProgress,
  LessonCompletion,
  LessonFailure,
  LessonQuizSnapshot,
} from '@/lib/user-data';
import { DebugOverlay } from '@/components/dev/DebugOverlay';


const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two columns: left and right */
  gap: 24px;
  align-items: start;

  @media (max-width: 800px) {
    grid-template-columns: 1fr; /* Stack on small screens */
  }
`;

const LeftColumn = styled.div`
  display: grid;
  gap: 20px;
`;

const RightColumn = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const BottomSection = styled.div`
  margin-top: 28px;
`;

const Screen = styled.div`
  min-height: 100vh;
  padding: 32px 16px 48px;
  display: grid;
  place-items: center;
  position: relative;
  background:
    url('/homepagebg3.jpg') center/cover no-repeat,
    radial-gradient(1200px 600px at 20% -10%, rgba(111,126,79,.35), transparent 60%),
    radial-gradient(900px 500px at 120% 110%, rgba(139,107,63,.25), transparent 65%),
    #0b0f14;
`;

const TileOverlay = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.12;
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
`;

const Main = styled.main`
  position: relative;
  width: min(1080px, 100%);
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 24px;
  border-radius: 24px;
  border: 2px solid rgba(0, 0, 0, 0.85);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 22px 42px rgba(0,0,0,0.35);
  backdrop-filter: blur(4px);
`;

export const HomePage: React.FC = () => {
  const nav = useNavigate();
  const { user, signOutUser } = useAuth();

  const [boot, setBoot] = React.useState<any>(null);
  const [cat, setCat] = React.useState<any>(null);
  const [showDbg, setShowDbg] = React.useState<boolean>(() => localStorage.getItem('koza.debug.ui') === '1');

  React.useEffect(() => {
    (async () => {
      const { loadBootstrap } = await import('@/lib/bootstrap');
      const data = loadBootstrap();
      setBoot(data);
    })();
  }, []);

  const profile = boot?.profile ?? null;
  const lessonProgress = boot?.progress ?? { completed: [], failed: [], current: [], currentDateISO: undefined };

  // If you still need the catalog object inside HomePage:
  const [catalog, setCatalog] = React.useState<any>(null);

  React.useEffect(() => {
    (async () => {
      if (!boot?.catalogLevel) return;
      const { loadBootCatalog } = await import('@/lib/bootstrap');
      const cached = await loadBootCatalog(boot.catalogLevel);
      setCatalog(cached);
    })();
  }, [boot?.catalogLevel]);

  React.useEffect(() => {
    (async () => {
      const { loadBootstrap, loadBootCatalog } = await import('@/lib/bootstrap');
      const b = loadBootstrap();
      setBoot(b);
      if (b?.catalogLevel) {
        const c = await loadBootCatalog(b.catalogLevel);
        setCat(c);
      }
    })();
  }, []);
  const sessionLessonId = useSession(s => s.lessonId);
  const quiz = useSession(s => s.quiz);
  const quizResults = useSession(s => s.quizResults);
  const quizAttempt = useSession(s => s.quizAttempt);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsModal, setStatsModal] = useState<QuizType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hasInProgress, setHasInProgress] = useState(false);


  const totalLessons = getTotalLessonsForLevel(profile?.jlptLevel ?? null);
  const completedLessons = useMemo(() => {
    if (!lessonProgress?.completed) return 0;
    return lessonProgress.completed.filter((entry: LessonCompletion) => {
      if (!profile?.jlptLevel) return true;
      return (entry.level ?? null) === profile.jlptLevel;
    }).length;
  }, [lessonProgress?.completed, profile?.jlptLevel]);

  const progressLabel = totalLessons
    ? `${completedLessons} / ${totalLessons} lessons`
    : null;

  const insights: ProgressInsights = useMemo(
    () =>
      buildProgressInsights(
        lessonProgress,
        sessionLessonId,
        quiz.length,
        quizResults,
        quizAttempt,
      ),
    [lessonProgress, sessionLessonId, quiz.length, quizResults, quizAttempt],
  );

  const streakStats = useMemo(() => computeStreakStats(lessonProgress), [lessonProgress]);

  const [selectedRecord, setSelectedRecord] = useState(
    insights.calendarRecords.length ? insights.calendarRecords[insights.calendarRecords.length - 1] : undefined
  );

  useEffect(() => {
    if (!selectedDate && insights.calendarRecords.length) {
      const todayISO = new Date().toISOString().slice(0, 10);
      const todayRecord =
        insights.calendarRecords.find(record => record.dateISO === todayISO) ??
        insights.calendarRecords[insights.calendarRecords.length - 1];
      if (todayRecord) {
        setSelectedDate(todayRecord.dateISO);
        setSelectedRecord(todayRecord);
      }
    } else if (selectedDate) {
      const record = insights.calendarRecords.find(item => item.dateISO === selectedDate);
      setSelectedRecord(record);
    }
  }, [insights.calendarRecords, selectedDate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedLesson = window.localStorage.getItem(LOCAL_LESSON_KEY);
    const activeSession =
      Boolean(sessionLessonId) && quizResults.length > 0 && quizResults.length < quiz.length;
    const completedStored =
      !!storedLesson && !!lessonProgress?.completed?.some((entry: LessonCompletion) => entry.lessonId === storedLesson);
    if (completedStored) {
      window.localStorage.removeItem(LOCAL_LESSON_KEY);
    }
    setHasInProgress(Boolean((storedLesson && !completedStored) || activeSession));
  }, [lessonProgress, sessionLessonId, quizResults.length, quiz.length]);

  if (!user) return null;

  const handleStudy = () => {
    if (typeof window !== 'undefined') {
      const lessonId = sessionLessonId ?? new Date().toISOString().slice(0, 10);
      window.localStorage.setItem(LOCAL_LESSON_KEY, lessonId);
    }
    nav('/flashcards');
  };

  const handleOpenStats = (type: QuizType) => setStatsModal(type);
  const handleCloseStats = () => setStatsModal(null);

  const handleCalendarSelect = (dateISO: string, record: typeof selectedRecord) => {
    setSelectedDate(dateISO);
    setSelectedRecord(record);
  };

  const handleSignOut = async () => { await signOutUser(); };

  const studyLabel = hasInProgress ? 'Continue Study' : 'Start Study';
  const studyCopy = hasInProgress
    ? 'Pick up where you left off and finish the lesson.'
    : 'Jump into your next lesson and keep the streak alive.';
  // --- derive current lesson & status for the Study card ---
  type StudyStatus = 'not-started' | 'in-progress' | 'completed';
  // last completed lesson number (if any)
  const lastCompletedNo =
  Math.max(...(lessonProgress?.completed?.map((e: LessonCompletion) => e.lessonNo ?? -Infinity) ?? [-Infinity]));
  const lastFailedNo = lessonProgress?.failed?.slice(-1)[0]?.lessonNo;
  const currentLessonNo =
    (hasInProgress && lastFailedNo) ? lastFailedNo :
    (Number.isFinite(lastCompletedNo) ? (lastCompletedNo as number) + 1 : undefined);

  // work out today's status
  const todayISO = new Date().toISOString().slice(0, 10);
  const didCompleteToday = Boolean(
    lessonProgress?.completed?.some((c: LessonCompletion) => (c.completedAt ?? '').slice(0, 10) === todayISO)
  );
  const studyStatus: StudyStatus = hasInProgress ? 'in-progress' : (didCompleteToday ? 'completed' : 'not-started');
  const vocabSummary = insights.vocabStats[insights.vocabStats.length - 1] ?? null;
  const grammarSummary = insights.grammarStats[insights.grammarStats.length - 1] ?? null;

  return (
  
    <Screen>
      <TileOverlay />
      <Main>
        <HeaderBarHome
        nickname={profile?.nickname}
        displayName={user.displayName}
        // NEW: single JLPT + progress label
        jlptLevel={profile?.jlptLevel ?? '—'}
        progressLabel={progressLabel}

        onOpenSettings={() => setSettingsOpen(true)}
        onSignOut={handleSignOut}
        // OPTIONAL: if you want the Progress icon to do something now
        onOpenProgress={() => {/* setProgressOpen(true) or nav('/progress') */}}

        rightSlot={<ShardHUD />}
      />


        <MainGrid>
          {/* Left Column */}
          <LeftColumn>
            <StudySection
              onStart={handleStudy}
              lessonNo={currentLessonNo}
              status={studyStatus}
            />

            <QuizInsights
              vocabSummary={vocabSummary}
              grammarSummary={grammarSummary}
              vocabAttempts={insights.vocabStats.length}
              grammarAttempts={insights.grammarStats.length}
              onOpenStats={handleOpenStats}
              formatScore={formatScore}
              formatAverageTime={formatAverageTime}
            />
             <AchievementScrolls scrolls={[...DEFAULT_SCROLLS]} />
          </LeftColumn>

          {/* Right Column */}
          <RightColumn>
            <StreakCalendar
              streakStats={streakStats}
              records={insights.calendarRecords}
              selectedDate={selectedDate}
              selectedRecord={selectedRecord}
              onSelect={handleCalendarSelect}
            />
          </RightColumn>
        </MainGrid>
        {/*<BottomSection>
        </BottomSection> */}
      </Main>

      {/* Modals remain unchanged */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile ?? null}
      />
      <QuizStatsModal
        open={statsModal === 'vocab'}
        title="Vocabulary quiz stats"
        stats={insights.vocabStats}
        onClose={handleCloseStats}
      />
      <QuizStatsModal
        open={statsModal === 'grammar'}
        title="Grammar quiz stats"
        stats={insights.grammarStats}
        onClose={handleCloseStats}
      />
      {showDbg && boot && (
      <DebugOverlay
          title="HomePage Inspect"
          payloads={[
            { label: 'Bootstrap.profile', value: boot.profile },
            { label: 'Bootstrap.progress', value: boot.progress },
            { label: 'Catalog (from kv)', value: cat },
            { label: 'Catalog keys', value: cat ? Object.keys(cat) : null },
            { label: 'Sample lesson', value: (cat as any)?.lessons?.[0] ?? null },
          ]}
          onClose={() => { setShowDbg(false); localStorage.removeItem('koza.debug.ui'); }}
        />
      )}
    </Screen>
  );
};
