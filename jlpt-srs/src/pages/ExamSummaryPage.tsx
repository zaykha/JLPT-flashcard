// ExamSummaryPage.tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/store/session';
import { Screen, Title, ScoreBox, ScoreText, ScoreBar, ScoreFill, Small, Row, Prompt, Result, Btn } from '@/styles/Pages/GrammarQuizSummaryPage.styles';
import { Actions } from '@/styles/Pages/QuizPage.styles';
import { List, PixelFrame, ResultNote } from '@/styles/Pages/QuizSummaryPage.styles';
import { hasPrompt } from '@/helpers/shared';
import { ResultFX } from '@/components/animated/ResultFX';


// prompt guard moved to helpers/shared
// Debug switch: set localStorage.setItem('koza.debug.exam','1') to enable
const DEBUG_EXAM_FLOW =
  (typeof window !== 'undefined' && window.localStorage.getItem('koza.debug.exam') === '1') ||
  process.env.NODE_ENV !== 'production';

function dbg(...args: any[]) {
  if (DEBUG_EXAM_FLOW) console.log('[ExamSummary]', ...args);
}

// Minimal no-deps toast
function toast(message: string, type: 'info'|'success'|'error' = 'info') {
  // SSR / no DOM
  if (typeof window === 'undefined' || !document?.body) {
    (type === 'error' ? console.error : console.log)(message);
    return;
  }
  const el = document.createElement('div');
  el.textContent = message;

  // Basic styling
  el.style.position = 'fixed';
  el.style.left = '50%';
  el.style.bottom = '24px';
  el.style.transform = 'translateX(-50%)';
  el.style.padding = '10px 14px';
  el.style.borderRadius = '10px';
  el.style.color = '#fff';
  el.style.fontSize = '14px';
  el.style.fontWeight = '600';
  el.style.boxShadow = '0 6px 24px rgba(0,0,0,.2)';
  el.style.zIndex = '2147483000';
  el.style.opacity = '0.98';
  el.style.transition = 'opacity .25s ease';
  el.style.pointerEvents = 'none';
  el.style.background = type === 'error' ? '#e03131' : type === 'success' ? '#2f9e44' : '#364fc7';

  document.body.appendChild(el);
  // auto-hide
  const hide = () => { el.style.opacity = '0'; setTimeout(() => el.remove(), 280); };
  setTimeout(hide, 1800);
}


export const ExamSummaryPage: React.FC = () => {
  const nav = useNavigate();

  const quiz        = useSession(s => s.quiz);
  const quizResults = useSession(s => s.quizResults);
  const recordExamStatsAndPersist = useSession(s => s.recordExamStatsAndPersist);
  const quizMode    = useSession(s => s.quizMode);

  const total        = quiz.length;
  const correct      = quizResults.filter(r => r.correct).length;
  const scorePercent = total ? Math.round((correct / total) * 100) : 0;

  const totalMs = quizResults.reduce((s, r) => s + (r.timeMs ?? 0), 0);
  const avgSec  = Math.round(((totalMs / Math.max(1, quizResults.length)) / 100)) / 10;
  const durationSec = Math.max(1, Math.round(totalMs / 1000)); // authoritative

  const rows = useMemo(() => {
    return quizResults.map((r, i) => {
      const q = quiz.find(x => x.id === r.id);
      const prompt = q && hasPrompt(q) ? q.prompt : (q?.type === 'matching' ? 'Matching' : '');
      return {
        id: r.id,
        idx: i + 1,
        correct: r.correct,
        your: r.your || '-',
        expected: r.expected || '-',
        prompt,
        timeSec: r.timeMs != null ? Math.round(r.timeMs / 100) / 10 : null,
      };
    });
  }, [quizResults, quiz]);

  const submittingRef = useRef(false);
  const [saving, setSaving] = useState(false);

 const handleFinish = useCallback(async () => {
  if (submittingRef.current) return;
  submittingRef.current = true;
  setSaving(true);

  const st = useSession.getState();
  const hereBefore = location.pathname;

  try {
    // 1) Persist only for daily exam; for SRS we don't record daily exam stats
    if (quizMode === 'exam') {
      try {
        dbg('Saving exam stats…');
        await recordExamStatsAndPersist({
          scorePercentage: scorePercent,
          timeTakenPerQuestionSec: Math.round((totalMs / Math.max(1, quizResults.length)) / 1000),
          totalQuestions: total,
          correct,
          durationSec,
        });
        dbg('Saved exam stats ✓');
        toast('Exam saved', 'success');
      } catch (e) {
        dbg('Failed to save exam stats', e);
        toast('Failed to save exam stats', 'error');
        // continue; we still route away
      }
    }

    // 2) Try unlock SRS (only in daily exam flow)
    let unlocked = false;
    if (quizMode === 'exam') {
      const pair = st.lastExamPair;
      if (pair && typeof st.completeDailyExamAndUnlockSrs === 'function') {
        try {
          dbg('Unlocking SRS with pair', pair);
          await st.completeDailyExamAndUnlockSrs(pair);
          unlocked = true;
          dbg('SRS unlocked ✓');
        } catch (e) {
          dbg('completeDailyExamAndUnlockSrs failed', e);
          toast('Could not unlock SRS (fallback to Home)', 'error');
        }
      } else {
        dbg('No lastExamPair or unlock API missing; skipping SRS unlock');
      }
    }

    // 3) Refresh due list (best effort)
    let due: number[] = [];
    if (typeof st.refreshSrsDueToday === 'function') {
      try {
        dbg('Refreshing SRS due today…');
        await st.refreshSrsDueToday();
        due = Array.isArray(useSession.getState().srsDueToday) ? useSession.getState().srsDueToday : [];
        dbg('SRS due today:', due);
      } catch (e) {
        dbg('refreshSrsDueToday failed', e);
        toast('Could not refresh SRS list', 'error');
      }
    }

    // 4) Route decision
    if (quizMode === 'exam' && unlocked && due.length > 0) {
      dbg('Routing to SRS fresher at /flashcards');
      st.setStage?.('srsFresher');
      nav('/flashcards');
    } else {
      dbg('No SRS available; routing Home "/" and setting stage=studying');
      st.setStage?.('studying');
      nav('/');
    }

    // 5) Safety net: ensure we actually left this page
    setTimeout(() => {
      const stillHere = location.pathname === hereBefore;
      if (stillHere) {
        dbg('Navigation seems blocked; forcing Home "/"');
        try { st.setStage?.('studying'); nav('/'); } catch {}
      }
    }, 300);

  } catch (e) {
    dbg('Unexpected error in handleFinish', e);
    toast('Unexpected error after exam. Returning Home.', 'error');
    try { st.setStage?.('studying'); nav('/'); } catch {}
  } finally {
    setSaving(false);
    submittingRef.current = false;
  }
}, [
  recordExamStatsAndPersist,
  scorePercent,
  totalMs,
  quizResults.length,
  total,
  correct,
  durationSec,
  nav,
]);


  return (
    <Screen>
      <PixelFrame>
        <ResultFX perfect={scorePercent === 100} density={18} />
        <Title>Exam Summary</Title>

        <ScoreBox>
          <ScoreText><strong>{correct}</strong> / {total}</ScoreText>
          <ScoreBar><ScoreFill $pct={scorePercent} /></ScoreBar>
          <Small>Accuracy: {scorePercent}% · Avg time: {isFinite(avgSec) ? `${avgSec}s` : '—'}</Small>
          <ResultNote $perfect={scorePercent === 100}>
            {scorePercent === 100
              ? '🎉 Congrats! You have successfully passed the quiz.'
              : '⚠️ Please score 100% to move forward.'}
          </ResultNote>
        </ScoreBox>

        {/* Scrollable results */}
        {/* <div style={{ maxHeight: '48vh', overflowY: 'auto', marginTop: 8, paddingRight: 4 }}> */}
          <List>
            {rows.map(r => (
              <Row key={r.id} $correct={r.correct}>
                <Prompt>Q{r.idx}: {r.prompt}</Prompt>
                <Result className={r.correct ? 'ok' : ''}>
                  {r.correct ? '✔ Correct' : (
                    <>
                      <span>❌ Your:</span> <b>{r.your}</b>{' '}
                      <span>✅ Correct:</span> <b>{r.expected}</b>
                    </>
                  )}
                </Result>
                {r.timeSec != null && <Small style={{opacity:0.8}}>⏱ {r.timeSec}s</Small>}
              </Row>
            ))}
          </List>
        {/* </div> */}
        <Actions>
          <Btn $variant="primary" onClick={handleFinish} disabled={saving}>
            {saving ? 'Saving…' : 'Finish'}
          </Btn>
        </Actions>
         
        {/* Sticky footer actions */}
        {/* <div
          style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 999,
            background: 'var(--panel, #111)', borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 16px', display: 'flex', gap: 12, justifyContent: 'flex-end'
          }}
        >
          
        </div> */}
      </PixelFrame>
    </Screen>
  );
};
