import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Btn } from '@/styles/Pages/FlashCardPage.styles';
import { jstTodayISO } from '@/helpers/dateV1';
import { loadBootstrap, saveBootstrap } from '@/lib/bootstrap';
import { useSession } from '@/store/session';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export const PurchasePage: React.FC = () => {
  const q = useQuery();
  const nav = useNavigate();
  const source = q.get('source') || 'extra';
  const lessonNos = (q.get('lessonNos') || '')
    .split(',')
    .map(x => Number(x))
    .filter(n => Number.isFinite(n));
  const count = Math.max(1, Math.min(3, Number(q.get('count') || 2)));

  const [creating, setCreating] = useState(false);
  const [intent, setIntent] = useState<{ intentId: string; checkoutUrl: string } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function createMockIntent() {
    setCreating(true);
    setMsg(null);
    try {
      // In production, call your backend: POST /api/wallet/purchase-intent
      // For now, simulate an intent and a checkout URL.
      await new Promise(r => setTimeout(r, 500));
      const id = `intent_${Date.now()}`;
      const url = `${location.origin}/wallet/checkout/${id}`;
      setIntent({ intentId: id, checkoutUrl: url });
    } catch (e: any) {
      setMsg(e?.message || 'Failed to create purchase intent');
    } finally {
      setCreating(false);
    }
  }

  function dedupeByLessonNo<T extends { lessonNo?: number }>(arr: T[]): T[] {
    const out: T[] = [];
    const seen = new Set<number>();
    for (const x of arr) {
      const n = Number((x as any)?.lessonNo);
      if (!Number.isFinite(n)) continue;
      if (!seen.has(n)) { out.push(x); seen.add(n); }
    }
    return out;
  }

  async function simulateCheckoutComplete() {
    try {
      const boot = loadBootstrap();
      const lp = boot?.lessonProgress ?? { completed: [], failed: [], current: [], examsStats: [] };
      const today = jstTodayISO();

      const completedNos: number[] = Array.isArray(lp.completed)
        ? (lp.completed as any[]).map(e => Number(e.lessonNo)).filter(Number.isFinite)
        : [];
      const currentObjs: Array<{ lessonNo: number; LessonDate: string }> = Array.isArray(lp.current)
        ? (lp.current as any[]).map((it: any) => ({ lessonNo: Number(it.lessonNo ?? it), LessonDate: String(it.LessonDate ?? today) }))
        : [];
      const failedNos: number[] = Array.isArray(lp.failed)
        ? (lp.failed as any[]).map(e => Number(e.lessonNo)).filter(Number.isFinite)
        : [];

      const touchedCurrent = new Set<number>(currentObjs.map(c => c.lessonNo));
      const touchedCompleted = new Set<number>(completedNos);
      const touchedAll = new Set<number>([...completedNos, ...failedNos, ...currentObjs.map(c => c.lessonNo)]);

      let grant: number[] = [];
      if (source === 'missed' && lessonNos.length) {
        grant = lessonNos.slice(0, 2).filter(n => Number.isFinite(n));
      } else {
        // New Lesson Purchase: derive next two after highest completed
        const high = completedNos.length ? Math.max(...completedNos) : 0;
        grant = [high + 1, high + 2];
      }
      // Remove numbers already present in current (always). For 'missed', allow re-adding even if they exist in failed.
      if (source === 'missed') {
        grant = grant.filter(n => !touchedCurrent.has(n) && !touchedCompleted.has(n));
      } else {
        // 'extra' guard against any touched (completed/failed/current)
        grant = grant.filter(n => !touchedAll.has(n));
      }

      if (!grant.length) {
        setMsg('Nothing to add (already in progress or completed).');
        // still route back to Home
        await new Promise(r => setTimeout(r, 400));
        nav('/');
        return;
      }

      const toAdd = grant.map(n => ({ lessonNo: n, LessonDate: today }));
      const nextCurrent = dedupeByLessonNo([...currentObjs, ...toAdd]);

      // Persist locally (bootstrap only, since this is a simulation)
      saveBootstrap({ ...(boot as any), lessonProgress: { ...lp, current: nextCurrent, currentDateISO: today }, cachedAt: Date.now() } as any);
      try { useSession.getState().bumpBootRevision?.(); } catch {}

      // Reset study stage and build today; route to Flashcards
      try {
        const st = useSession.getState();
        st.setStage?.('studying');
        st.setToday?.([]);
        st.buildTodayFixed?.();
      } catch {}

      nav('/flashcards');
    } catch (e: any) {
      setMsg(e?.message || 'Failed to finalize purchase');
    }
  }

  return (
    <Wrap>
      <Card>
        <h2>{source === 'extra' ? 'New Lesson Purchase' : 'Missed Lesson Purchase'}</h2>
        <p>Source: <b>{source === 'extra' ? 'New Lesson Purchase' : 'Missed lessons'}</b></p>
        {lessonNos.length ? (
          <p>Lessons: <b>{lessonNos.join(', ')}</b></p>
        ) : (
          <p>Count: <b>{count}</b></p>
        )}

        {!intent ? (
          <Btn $variant="primary" onClick={createMockIntent} disabled={creating}>
            {creating ? 'Preparing…' : 'Create mock intent'}
          </Btn>
        ) : (
          <>
            <p>Intent: <code>{intent.intentId}</code></p>
            <Btn $variant="secondary" onClick={simulateCheckoutComplete}>Simulate checkout ✓</Btn>
          </>
        )}

        <div style={{ marginTop: 10 }}>
          <Btn $variant="ghost" onClick={() => nav(-1)}>← Back</Btn>
        </div>
        {msg && <SmallNote>{msg}</SmallNote>}
      </Card>
    </Wrap>
  );
};

const Wrap = styled.section`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: ${({ theme }) => theme.colors.bg};
`;
const Card = styled.div`
  width: min(560px, 94vw); border: 2px solid ${({ theme }) => theme.colors.pixelBorder}; border-radius: 16px; background: ${({ theme }) => theme.colors.panel};
  padding: 18px; display: grid; gap: 10px; color: ${({ theme }) => theme.colors.text};
  h2 { margin: 0 0 4px; font-family: ${({ theme }) => theme.fonts.heading }; }
`;
const SmallNote = styled.div` font-size: 12px; opacity: 0.8; margin-top: 8px; `;

export default PurchasePage;
