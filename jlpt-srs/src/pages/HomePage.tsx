import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { useSession } from '@/store/session';

import { SettingsModal } from '@/components/settings/SettingsModal';
import { AchievementScrolls } from '@/components/home/AchievementScrolls';
import { ShardHUD } from '@/components/TopBar/ShardHUD';
import type { SessionState } from '@/types/session';
import { useShallow } from 'zustand/react/shallow';
import {
  DEFAULT_SCROLLS,
  LOCAL_LESSON_KEY,
} from '@/lib/home/constants';

import {
  buildProgressInsights,
  computeStreakStats,
} from '@/lib/home/insights';

import type { ProgressInsights, QuizType } from '@/lib/home/types';

import { HeaderBarHome } from '@/components/home/HeaderBar';
import { StudySection } from '@/components/home/StudySection';
import { ExtraCurricular } from '@/components/home/ExtraCurricular';
import { DailyTasks } from '@/components/home/DailyTasks';
import { StreakCalendar } from '@/components/home/StreakCalendarNew';
import { ModalRoot, ModalHeader, ModalTitle, ModalBody, ModalActions, ModalClose } from '@/components/ui/Modal';
// import { QuizStatsModal } from '@/components/home/QuizStatsModal';
import { ProgressModal } from '@/components/home/ProgressModal';
import { BuyMoreLessonsModal } from '@/components/home/BuyMoreModal';
import { useWalletActions } from '@/hooks/useWalletActions';

import { getTotalLessonsForLevel } from '@/lib/constants/lessons';

// import { DebugOverlay } from '@/components/dev/DebugOverlay';
import { TestButtons } from '@/dev/dev/TestButtons';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LeftColumn, Main, MainGrid, RightColumn, Screen, TileOverlay } from '@/styles/Pages/HomePage.styles';
import type { LessonCompletion, LessonProgress } from '@/types/lessonV1';
import { jstTodayISO } from '@/helpers/dateV1';
import type { JLPTLevelStr } from '@/types/userV1';
import { SrsUnlockCard } from '@/components/srs/srsUnlockCard';
import { Btn } from '@/styles/Pages/FlashCardPage.styles';


// ---------- helpers (pure) ----------
const isoOf = (s?: string) => (typeof s === 'string' ? s.slice(0, 10) : '');

function normalizeCurrent(curr: LessonProgress['current'] | undefined, todayISO: string) {
  if (!Array.isArray(curr)) return [] as Array<{ lessonNo: number; LessonDate: string }>;
  return curr
    .map((it) =>
      it && typeof it === 'object' && 'lessonNo' in it
        ? { lessonNo: Number(it.lessonNo), LessonDate: String(it.LessonDate ?? todayISO) }
        : { lessonNo: Number(it as any), LessonDate: todayISO },
    )
    .filter((it) => Number.isFinite(it.lessonNo));
}

function pickTwoForExam(completed: Array<{ lessonNo: number; completedAt: string }>, todayISO: string) {
  if (!Array.isArray(completed)) return null;
  const todays = completed.filter((e) => isoOf(e.completedAt) === todayISO).map((e) => e.lessonNo);
  if (todays.length >= 2) {
    const a = todays[todays.length - 2];
    const b = todays[todays.length - 1];
    return { a, b };
  }
  const allNos = completed.map((e) => e.lessonNo).filter((n) => Number.isFinite(n));
  if (allNos.length >= 2) {
    const a = allNos[allNos.length - 2];
    const b = allNos[allNos.length - 1];
    return { a, b };
  }
  return null;
}

// ---------- page ----------
export const HomePage: React.FC = () => {
  const nav = useNavigate();
  const { user, signOutUser } = useAuth();
  const { spend } = useWalletActions();

  // Local state
  const [boot, setBoot] = useState<any>(null);
  const [cat, setCat] = useState<any>(null);
  const [showDbg, setShowDbg] = useState<boolean>(() => localStorage.getItem('koza.debug.ui') === '1');
  // const [statsModal, setStatsModal] = useState<QuizType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hasInProgress, setHasInProgress] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [spendOpen, setSpendOpen] = useState(false);
  const [spendBusy, setSpendBusy] = useState(false);
  const [spendMsg, setSpendMsg] = useState<string | null>(null);
  const [spendIntent, setSpendIntent] = useState<{ source: 'extra'|'missed'; count?: number; lessonNos?: number[] } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  // Unified lightweight modal for Home (simple title/body/OK)
  const [popup, setPopup] = useState<{ title: string; msg: string } | null>(null);
  const openPopup = (title: string, msg: string) => setPopup({ title, msg });
  const closePopup = () => setPopup(null);

  // Session (batched)
  const { sessionLessonNo, quiz, quizResults, quizAttempt, bootRevision } = useSession(
    useShallow((s: SessionState) => ({
      sessionLessonNo: s.lessonNo,
      quiz: s.quiz,
      quizResults: s.quizResults,
      quizAttempt: s.quizAttempt,
      bootRevision: s.bootRevision,
    })),
  );

  // Bootstrap-derived
  const profile = boot?.profile ?? null;
  const lessonProgress: LessonProgress =
    boot?.lessonProgress ?? { completed: [], failed: [], current: [], examsStats: [] };

  const currentQueue = useMemo(
    () => normalizeCurrent(lessonProgress?.current, jstTodayISO()),
    [lessonProgress?.current],
  );

  // Exam readiness
  const todayISO = jstTodayISO();
  const completedList = (lessonProgress?.completed as LessonCompletion[] | undefined) ?? [];
  const examPair = useMemo(() => pickTwoForExam(completedList as any, todayISO), [completedList, todayISO]);
  const examReady = currentQueue.length === 0 && !!examPair;

  // Current lessonNo resolution
  const storedLessonNo =
    typeof window !== 'undefined'
      ? (() => {
          const raw = window.localStorage.getItem(LOCAL_LESSON_KEY);
          const n = raw ? Number(raw) : null;
          return Number.isFinite(n as any) ? n : null;
        })()
      : null;

  const rangeStart: number | undefined = (cat as any)?.lessonRange?.start;
  const lastCompletedNo = Math.max(
    ...(((lessonProgress?.completed as LessonCompletion[] | undefined)?.map((e) => e.lessonNo ?? -Infinity)) ??
      [-Infinity]),
  );

  const computedLessonNo =
    typeof sessionLessonNo === 'number' && Number.isFinite(sessionLessonNo)
      ? sessionLessonNo
      : storedLessonNo != null && Number.isFinite(storedLessonNo)
      ? storedLessonNo
      : currentQueue.length && Number.isFinite(Number(currentQueue[0]?.lessonNo))
      ? Number(currentQueue[0].lessonNo)
      : Number.isFinite(lastCompletedNo)
      ? (lastCompletedNo as number) + 1
      : (rangeStart as number | undefined);

  const currentLessonNo: number | undefined = computedLessonNo;

  // Daily tasks
  const dailyLessonsDone = Math.max(0, 2 - currentQueue.length);
  const totalLessons = getTotalLessonsForLevel(profile?.jlptLevel ?? null);

  const completedLessons = useMemo(() => {
    if (!lessonProgress?.completed) return 0;
    return lessonProgress.completed.filter((entry: LessonCompletion) => {
      if (!profile?.jlptLevel) return true;
      return (entry.level ?? null) === profile.jlptLevel;
    }).length;
  }, [lessonProgress?.completed, profile?.jlptLevel]);

  const progressLabel = totalLessons ? `${completedLessons} / ${totalLessons} lessons` : null;

  const insights: ProgressInsights = useMemo(
    () =>
      buildProgressInsights(lessonProgress, sessionLessonNo, quiz.length, quizResults, quizAttempt),
    [lessonProgress, sessionLessonNo, quiz.length, quizResults, quizAttempt],
  );

  const streakStats = useMemo(() => computeStreakStats(lessonProgress), [lessonProgress]);

  const selectedRecord = useMemo(() => {
    if (!insights.calendarRecords.length) return undefined;
    if (selectedDate) return insights.calendarRecords.find((r) => r.dateISO === selectedDate);
    return insights.calendarRecords[insights.calendarRecords.length - 1];
  }, [insights.calendarRecords, selectedDate]);

  // ---------- effects ----------
  // Load bootstrap+catalog on bootRevision
  useEffect(() => {
    (async () => {
      const { loadBootstrap, loadBootCatalog } = await import('@/lib/bootstrap');
      const b = loadBootstrap();
      setBoot(b);
      if (b?.catalogLevel) {
        const c = await loadBootCatalog(b.catalogLevel);
        setCat(c);
      }
    })();
  }, [bootRevision]);

  // One-shot: stage ensure + initial calendar preselect
  useEffect(() => {
    useSession.getState().ensureStageForHome();
  }, []); // ✅ Run once on mount

  // Listen for calendar missed purchase request (no prop drilling)
  useEffect(() => {
    const onBuyMissed = (e: any) => {
      const lessonNos: number[] = Array.isArray(e?.detail?.lessonNos) ? e.detail.lessonNos : [];
      if (lessonNos.length) {
        setSpendIntent({ source: 'missed', lessonNos });
        setSpendOpen(true);
      }
    };
    window.addEventListener('koza:buy-missed', onBuyMissed as any);
    return () => window.removeEventListener('koza:buy-missed', onBuyMissed as any);
  }, []);

  // Keep debug overlay in sync if toggled via console/localStorage after mount
  useEffect(() => {
    const syncDbg = () => setShowDbg(localStorage.getItem('koza.debug.ui') === '1');
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'koza.debug.ui') syncDbg();
    };
    window.addEventListener('focus', syncDbg);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('focus', syncDbg);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // ✅ Separate effect for calendar preselection (runs when insights ready)
  useEffect(() => {
    if (selectedDate) return; // ✅ Only set if not already selected
    if (!insights.calendarRecords.length) return;

    const iso = jstTodayISO();
    const todayRecord =
      insights.calendarRecords.find((r) => r.dateISO === iso) ??
      insights.calendarRecords[insights.calendarRecords.length - 1];

    if (todayRecord) {
      setSelectedDate(todayRecord.dateISO);
    }
  }, [insights.calendarRecords, selectedDate]); // ✅ Proper dependencies

  // Guarded in-progress flag (prevents redundant sets)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedLessonStr = window.localStorage.getItem(LOCAL_LESSON_KEY);
    const storedLesson = storedLessonStr ? Number(storedLessonStr) : null;

    const activeSession =
      Boolean(sessionLessonNo) && quizResults.length > 0 && quizResults.length < quiz.length;

    const completedStored =
      storedLesson != null &&
      lessonProgress?.completed?.some((entry: LessonCompletion) => entry.lessonNo === storedLesson);

    if (completedStored) {
      window.localStorage.removeItem(LOCAL_LESSON_KEY);
    }

    const next = Boolean((storedLesson && !completedStored) || activeSession);
    setHasInProgress((prev) => (prev === next ? prev : next));
  }, [lessonProgress, sessionLessonNo, quizResults.length, quiz.length]);

  // ---------- UI handlers ----------
  const rightSlot = useMemo(
    () => (
      <>
        <ThemeToggle />
        <ShardHUD />
      </>
    ),
    [],
  );

  const handleBuyConfirm = async () => {
    setShowBuyModal(false);
    try {
      const { loadBootstrap } = await import('@/lib/bootstrap');
      const bootNow = loadBootstrap();
      const failed = Array.isArray(bootNow?.lessonProgress?.failed) ? (bootNow!.lessonProgress!.failed as any[]) : [];
      if (failed.length > 0) {
        const byDate = failed.slice().sort((a, b) => String(a.attemptedAt ?? '').localeCompare(String(b.attemptedAt ?? '')));
        const pair = byDate.slice(0, 2).map(e => Number(e.lessonNo)).filter(Number.isFinite);
        if (pair.length) { setSpendIntent({ source: 'missed', lessonNos: pair }); setSpendOpen(true); return; }
      }
    } catch {}
    setSpendIntent({ source: 'extra', count: 2 });
    setSpendOpen(true);
  };

  const confirmSpend = async () => {
    if (!spendIntent) return;
    setSpendBusy(true);
    setSpendMsg(null);
    try {
      const { jstTodayISO } = await import('@/lib/cache/lessons');
      const dayISO = jstTodayISO();
      if (spendIntent.source === 'extra') {
        const n = Math.max(1, spendIntent.count || 2);
        await spend({ action: 'extra_lesson', count: n, note: `extra_lesson x${n}`, dayISO, dayIso: dayISO });
        // Assign extra lessons
        const [{ assignExtraLessonsForToday }] = await Promise.all([
          import('@/services/assignExtraV1'),
        ]);
        const [{ loadBootstrap, loadBootCatalog }] = await Promise.all([
          import('@/lib/bootstrap'),
        ]);
        const boot2 = loadBootstrap();
        const level = boot2?.catalogLevel as any;
        if (user?.uid && level) {
          const cat = await (await loadBootCatalog(level))?.lessonRange;
          if (cat && (n === 2 || n === 3)) {
            await assignExtraLessonsForToday(user.uid, { levelRange: cat, count: (n >= 3 ? 3 : 2) as 2 | 3 });
          }
        }
      } else if (spendIntent.source === 'missed') {
        const arr = (spendIntent.lessonNos ?? []).filter(Number.isFinite);
        const n = Math.max(1, arr.length || 1);
        await spend({ action: 'missed_lesson', count: n, note: `missed_lesson x${n}`, dayISO, dayIso: dayISO, lessonNos: arr, lessonId: String(arr[0] ?? '') });
        if (user?.uid && arr.length) {
          const { assignMissedLessonsForToday } = await import('@/services/assignMissedV1');
          await assignMissedLessonsForToday(user.uid, arr);
          const { removeFailedLessons } = await import('@/services/removeFailedV1');
          await removeFailedLessons(user.uid, arr);
        }
      }
      setSpendOpen(false);
      // Auto start study
      await handleStudy();
    } catch (e: any) {
      setSpendMsg(e?.message || 'Failed to complete purchase');
    } finally {
      setSpendBusy(false);
    }
  };

  const handleStudy = async () => {
    const st = useSession.getState();
    const { jstTodayISO } = await import('@/lib/cache/lessons');
    const todayISO = jstTodayISO();
    const perDay = 2;

    const { loadBootstrap, loadBootCatalog } = await import('@/lib/bootstrap');
    const boot = loadBootstrap();
    const prog = boot?.lessonProgress ?? { completed: [], failed: [], current: [], examsStats: [] };

    const { getTodaysLessonNos, hasExamForDate, lastTwo } = await import('@/helpers/todayV1');
    const todaysNos = getTodaysLessonNos(prog, todayISO);

    const currentEmpty = !Array.isArray(prog.current) || prog.current.length === 0;
    const localExamDone =
      hasExamForDate(prog, todayISO) || (st as any)?.examTakenISO === todayISO;

    if (process.env.NODE_ENV !== 'production') console.info('[Home.handleStudy] invoked', { stage: st.stage });

    // Quota met & no current → exam fresher or buy
    if (currentEmpty && todaysNos.length >= perDay) {
      if (localExamDone) {
        if ((HomePage as any).__suppressBuyFlow) {
          if (process.env.NODE_ENV !== 'production') console.info('[Home.handleStudy] suppressing buy flow (post-purchase auto-start)');
          // fall through to normal study routing below
        } else {
          if (process.env.NODE_ENV !== 'production') console.info('[Home.handleStudy] exam done; routing to wallet for extra');
          await handleBuyConfirm();
          return;
        }
      }
      const pair = lastTwo(todaysNos);
      if (pair) {
        if (process.env.NODE_ENV !== 'production') console.info('[Home.handleStudy] routing to exam fresher with pair', pair);
        st.setLastExamPair({ a: pair[0], b: pair[1] });
        if (st.stage !== 'examFresher') st.setStage('examFresher');
        if (location.pathname !== '/flashcards') nav('/flashcards');
        return;
      }
      return;
    }

    // Need assignments but current is empty → soft fetch plan (idempotent on server)
    if (currentEmpty && todaysNos.length < perDay) {
      try {
        const level = boot?.catalogLevel as JLPTLevelStr | undefined;
        if (level) {
          const cat = await loadBootCatalog(level);
          const range = (cat?.lessonRange ?? undefined) as { start: number; end: number } | undefined;
          if (range) {
            const { ensureDailyQueue } = await import('@/services/StudyPlanV1');
            const { useAuth } = await import('@/store/auth');
            const uid = useAuth.getState().user?.uid;
            if (uid) {
              if (process.env.NODE_ENV !== 'production') console.info('[Home.handleStudy] ensuring daily queue…');
              await ensureDailyQueue(uid, { levelRange: range, perDay });
            }
          }
        }
      } catch {}
    }

    // Normal study route
    if (process.env.NODE_ENV !== 'production') console.info('[Home.handleStudy] routing to Flashcards; forcing rebuild');
    st.setToday([]); // why: force buildTodayFixed
    const { LOCAL_LESSON_KEY } = await import('@/lib/home/constants');
    if (typeof window !== 'undefined') window.localStorage.setItem(LOCAL_LESSON_KEY, String(todayISO));
    if (st.stage !== 'studying' && st.stage !== 'grammar') st.setStage('studying');
    if (location.pathname !== '/flashcards') nav('/flashcards');
  };

  // If redirected back from Wallet after spending shards, auto start study
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const start = params.get('start');
    if (!start) return;
    // Clean params early to avoid loops
    const url = new URL(window.location.href);
    url.searchParams.delete('start');
    url.searchParams.delete('count');
    url.searchParams.delete('lessonNos');
    window.history.replaceState({}, '', url.toString());
    // Suppress buy flow branch when auto-starting after purchase
    (HomePage as any).__suppressBuyFlow = true;
    // Kick off study route using existing logic
    void handleStudy();
    // Clear the suppression on next tick to avoid affecting normal use
    setTimeout(() => { (HomePage as any).__suppressBuyFlow = false; }, 1000);
  }, []);

  // const handleCloseStats = () => setStatsModal(null);
  const handleCalendarSelect = (dateISO: string /* , record?: any */) => setSelectedDate(dateISO);
  const handleSignOut = async () => {
    setShowLogoutConfirm(true);
  };

  // ---------- render ----------
  return (
    <Screen $page="HomePage">
      <TileOverlay />
      <Main>
        <HeaderBarHome
          nickname={profile?.nickname}
          displayName={user?.displayName ?? 'Guest'}
          jlptLevel={profile?.jlptLevel ?? '—'}
          progressLabel={progressLabel}
          avatarKey={profile?.avatarKey}
          onOpenSettings={() => nav('/settings')}
          onSignOut={handleSignOut}
          onOpenProgress={() => setShowProgress(true)}
          rightSlot={rightSlot}
        />

        <MainGrid>
          
          <LeftColumn>
            <StudySection onStart={handleStudy} lessonNo={currentLessonNo} />
            <DailyTasks />
            {/* <SrsUnlockCard /> */}
            <ExtraCurricular onOpenModal={({ title, msg }) => openPopup(title, msg)} />
            {/* <AchievementScrolls scrolls={[...DEFAULT_SCROLLS]} /> */}
          </LeftColumn>

          <RightColumn>
            <StreakCalendar
              streakStats={streakStats}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              onOpenModal={({ title, msg }) => openPopup(title, msg)}
            />
          </RightColumn>
        </MainGrid>

        {/* Settings moved to dedicated page */}

        <ProgressModal open={showProgress} onClose={() => setShowProgress(false)} lessonProgress={lessonProgress} />

        {/* {showDbg && boot && (
          <DebugOverlay
            title="HomePage Inspect"
            payloads={[
              { label: 'Bootstrap.profile', value: boot.profile },
              { label: 'Bootstrap.lessonProgress', value: boot.lessonProgress },
              // { label: 'Catalog (from kv)', value: cat },
              // { label: 'Catalog keys', value: cat ? Object.keys(cat) : null },
              // { label: 'Sample lesson', value: (cat as any)?.lessons?.[0] ?? null },
            ]}
            onClose={() => {
              setShowDbg(false);
              localStorage.removeItem('koza.debug.ui');
            }}
          />
        )} */}

        {showDbg && (
          <div style={{ marginTop: 12 }}>
            <TestButtons />
          </div>
        )}

        <BuyMoreLessonsModal
          open={showBuyModal}
          lessonsCount={2}
          // hide cost in this confirmation; Wallet page handles spending
          showCost={false}
          costShards={120}
          loading={false}
          onClose={() => setShowBuyModal(false)}
          onConfirm={handleBuyConfirm}
        />

        {/* Spend confirm modal (extra/missed) */}
        <ModalRoot open={spendOpen} onClose={() => setSpendOpen(false)} maxWidth={520} labelledBy="spend-title">
          <ModalHeader>
            <ModalTitle id="spend-title">Confirm purchase</ModalTitle>
            <ModalClose aria-label="Close" onClick={() => setSpendOpen(false)}>×</ModalClose>
          </ModalHeader>
          <ModalBody>
            {spendIntent?.source === 'extra' && (
              <>
                <p>Unlock extra lessons for today.</p>
                <p style={{ opacity: 0.8 }}>Cost: <b>{Math.max(1, spendIntent.count || 2) * 25} shards</b></p>
              </>
            )}
            {spendIntent?.source === 'missed' && (
              <>
                <p>Unlock missed lessons ({spendIntent.lessonNos?.length ?? 0}).</p>
                <p style={{ opacity: 0.8 }}>Lessons: {spendIntent.lessonNos?.join(', ')}</p>
                <p style={{ opacity: 0.8 }}>Cost: <b>{(spendIntent.lessonNos?.length ?? 0) * 20} shards</b></p>
              </>
            )}
            {spendMsg && <div style={{ color: '#e03131', fontSize: 13 }}>{spendMsg}</div>}
          </ModalBody>
          <ModalActions>
            <Btn $variant="ghost" onClick={() => setSpendOpen(false)}>Cancel</Btn>
            <Btn $variant="primary" onClick={confirmSpend} disabled={spendBusy}>{spendBusy ? 'Processing…' : 'Confirm'}</Btn>
          </ModalActions>
        </ModalRoot>

        {/* Unified Home popup */}
       
     </Main>
      <ModalRoot open={!!popup} onClose={closePopup} maxWidth={560} labelledBy="home-popup-title">
          <ModalHeader>
            <ModalTitle id="home-popup-title">{popup?.title}</ModalTitle>
            <ModalClose aria-label="Close" onClick={closePopup}>×</ModalClose>
          </ModalHeader>
          <ModalBody>{popup?.msg}</ModalBody>
          <ModalActions>
            <Btn onClick={closePopup}>OK</Btn>
          </ModalActions>
        </ModalRoot>

        {/* Logout confirmation modal */}
        <ModalRoot open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} maxWidth={520} labelledBy="logout-title">
          <ModalHeader>
            <ModalTitle id="logout-title">Sign out?</ModalTitle>
            <ModalClose aria-label="Close" onClick={() => setShowLogoutConfirm(false)}>×</ModalClose>
          </ModalHeader>
          <ModalBody>
            You’re about to sign out. You can sign back in anytime.
          </ModalBody>
          <ModalActions>
            <Btn $variant="ghost" onClick={() => setShowLogoutConfirm(false)}>Cancel</Btn>
            <Btn $variant="primary" onClick={async () => { setShowLogoutConfirm(false); await signOutUser(); }}>Sign out</Btn>
          </ModalActions>
        </ModalRoot>
    </Screen>
  );
};

// Assuming exported default elsewhere if needed
export default HomePage;

  
