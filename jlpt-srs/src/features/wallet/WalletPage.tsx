import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWalletContext } from '@/features/wallet/WalletProvider';
import { TransactionList } from '@/features/wallet/TransactionList';
import { useServerTime } from '@/hooks/useServerTime';
import { Panel, PanelHeader, BalanceBadge, PrimaryButton, InfoStrip } from '@/features/wallet/styles';
import { ShardHUD } from '@/components/TopBar/ShardHUD';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api/http';
import { useAuth } from '@/store/auth';
import { ModalRoot, ModalHeader, ModalTitle, ModalBody, ModalActions, ModalClose } from '@/components/ui/Modal';
import { useWalletActions } from '@/hooks/useWalletActions';

export const WalletPage: React.FC = () => {
  const { wallet, transactions, loading, error, refresh, openBuyModal } = useWalletContext();
  const { data: serverTime } = useServerTime(true);
  const nav = useNavigate();
  const loc = useLocation();
  const { spend } = useWalletActions();
  const { user } = useAuth();
  const shards = wallet?.shards ?? 0;
  const [banner, setBanner] = React.useState<string | null>(null);

  // Minimal toast helper
  function toast(message: string, type: 'info' | 'success' | 'error' = 'info') {
    if (typeof window === 'undefined' || !document?.body) {
      (type === 'error' ? console.error : console.log)(message);
      return;
    }
    const el = document.createElement('div');
    el.textContent = message;
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
    const hide = () => { el.style.opacity = '0'; setTimeout(() => el.remove(), 280); };
    setTimeout(hide, 1800);
  }

  // Detect success redirect
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('success') || params.has('session_id')) {
      toast('Payment completed. Balance updated.', 'success');
      // Clean up query params without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // Quick buy using Netlify functions
  const PRICES = {
    P250: import.meta.env.VITE_PRICE_250 as string | undefined,
    P500: import.meta.env.VITE_PRICE_500 as string | undefined,
    P1200: import.meta.env.VITE_PRICE_1200 as string | undefined,
  } as const;

  async function quickCheckout(priceId: string | undefined, shards: number) {
    if (!priceId) {
      toast('Price not configured', 'error');
      return;
    }
    try {
      const res = await apiFetch<{ url: string }>('/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, shards }),
      });
      if (res?.url) {
        window.location.assign(res.url);
      } else {
        toast('Failed to start checkout', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Failed to start checkout', 'error');
    }
  }

  async function openBillingPortal() {
    try {
      const res = await apiFetch<{ url: string }>('/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res?.url) {
        window.location.assign(res.url);
      } else {
        toast('Unable to open billing portal', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Unable to open billing portal', 'error');
    }
  }

  // Spend confirmation from query params
  const [spendOpen, setSpendOpen] = React.useState(false);
  const [spendBusy, setSpendBusy] = React.useState(false);
  const [spendMsg, setSpendMsg] = React.useState<string | null>(null);

  const intent = React.useMemo(() => {
    const q = new URLSearchParams(loc.search);
    const source = (q.get('source') as 'missed' | 'extra' | null) ?? null;
    const count = Number(q.get('count') || '0') || 0;
    const lessonNos = (q.get('lessonNos') || '')
      .split(',')
      .map(x => Number(x))
      .filter(n => Number.isFinite(n));
    return { source, count, lessonNos };
  }, [loc.search]);

  React.useEffect(() => {
    if (intent.source === 'missed' || intent.source === 'extra') setSpendOpen(true);
  }, [intent.source]);

  const clearIntent = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('source');
    url.searchParams.delete('count');
    url.searchParams.delete('lessonNos');
    window.history.replaceState({}, '', url.toString());
  };

  const confirmSpend = async () => {
    if (!intent.source) return;
    setSpendBusy(true);
    setSpendMsg(null);
    try {
      const { jstTodayISO } = await import('@/lib/cache/lessons');
      const dayISO = jstTodayISO();
      if (intent.source === 'extra') {
        const n = Math.max(1, intent.count || 2);
        await spend({ action: 'extra_lesson', count: n, note: `extra_lesson x${n}`, dayISO, dayIso: dayISO });
        // Assign extra lessons to progress + bootstrap
        const [{ assignExtraLessonsForToday }] = await Promise.all([
          import('@/services/assignExtraV1'),
        ]);
        // derive levelRange from cached catalog
        const [{ loadBootstrap, loadBootCatalog }] = await Promise.all([
          import('@/lib/bootstrap'),
        ]);
        const boot = loadBootstrap();
        const level = boot?.catalogLevel as any;
        if (user?.uid && level) {
          const cat = await (await loadBootCatalog(level))?.lessonRange;
          if (cat && (n === 2 || n === 3)) {
            await assignExtraLessonsForToday(user.uid, { levelRange: cat, count: (n >= 3 ? 3 : 2) as 2 | 3 });
          }
        }
      } else if (intent.source === 'missed') {
        const n = Math.max(1, intent.lessonNos.length || 1);
        await spend({ action: 'missed_lesson', count: n, note: `missed_lesson x${n}`, dayISO, dayIso: dayISO, lessonNos: intent.lessonNos, lessonId: String(intent.lessonNos[0] ?? '') });
        // Append missed lessonNos to current in progress + bootstrap
        if (user?.uid && intent.lessonNos.length) {
          const { assignMissedLessonsForToday } = await import('@/services/assignMissedV1');
          await assignMissedLessonsForToday(user.uid, intent.lessonNos);
          // Remove purchased missed lessons from failed
          try {
            const { removeFailedLessons } = await import('@/services/removeFailedV1');
            await removeFailedLessons(user.uid, intent.lessonNos);
          } catch {}
        }
      }
      setSpendOpen(false);
      clearIntent();
      await refresh();
      setBanner('Purchase successful. Preparing your lessons…');
      // Redirect to Home to start lessons
      setTimeout(() => {
        if (intent.source === 'extra') {
          const n = Math.max(1, intent.count || 2);
          nav(`/?start=extra&count=${n}`, { replace: true });
        } else if (intent.source === 'missed') {
          const list = intent.lessonNos.join(',');
          nav(`/?start=missed&lessonNos=${encodeURIComponent(list)}` , { replace: true });
        }
      }, 600);
    } catch (e: any) {
      setSpendMsg(e?.message || 'Failed to complete purchase');
    } finally {
      setSpendBusy(false);
    }
  };

  return (
    <Screen>
      {banner && (
        <Banner role="status">
          {banner}
        </Banner>
      )}
      <TileOverlay />
      <Panel>
        <PanelHeader>
          <BackButton type="button" onClick={() => nav(-1)}>
            ← Back
          </BackButton>
          <h1>My Wallet</h1>
          {/* <ShardHUD /> */}
        </PanelHeader>

        <BalanceCard id="wallet-balance">
          <div>
            <Label>Current balance</Label>
            <BalanceBadge>
              <span role="img" aria-label="glyph shards">💠</span>
              <strong>{shards.toLocaleString('en-US')}</strong>
            </BalanceBadge>
          </div>
          <Actions>
            <PrimaryButton type="button" onClick={() => openBuyModal()}>
              Buy Shards
            </PrimaryButton>
            <SmallButton type="button" onClick={() => refresh()} disabled={loading}>
              {loading ? 'Syncing…' : 'Refresh'}
            </SmallButton>
          </Actions>
          {error ? <ErrorText>{error}</ErrorText> : null}
        </BalanceCard>

          <InfoStrip>
          Daily free lessons reset at 00:00 JST.
          {serverTime?.iso ? ` (Server time: ${new Date(serverTime.iso).toLocaleString('en-US')})` : ''}
        </InfoStrip>

        <Section>
          <SectionHeader>
            <h2>Recent activity</h2>
          </SectionHeader>
          <ActivityWrap>
            <TransactionList transactions={transactions} limit={10} />
          </ActivityWrap>
        </Section>

        {/* <Section>
          <SectionHeader>
            <h2>Buy Shards</h2>
          </SectionHeader>
          <QuickBuyRow>
            <PrimaryButton type="button" onClick={() => quickCheckout(PRICES.P250, 250)} disabled={!PRICES.P250}>
              250 shards
            </PrimaryButton>
            <PrimaryButton type="button" onClick={() => quickCheckout(PRICES.P500, 500)} disabled={!PRICES.P500}>
              500 shards
            </PrimaryButton>
            <PrimaryButton type="button" onClick={() => quickCheckout(PRICES.P1200, 1200)} disabled={!PRICES.P1200}>
              1200 shards
            </PrimaryButton>
          </QuickBuyRow>
          <small style={{ opacity: 0.7 }}>Or use catalog: <a onClick={() => openBuyModal()} href="#">open modal</a></small>
        </Section> */}

      </Panel>
      <ModalRoot open={spendOpen} onClose={() => { setSpendOpen(false); clearIntent(); }} maxWidth={520} labelledBy="spend-title">
        <ModalHeader>
          <ModalTitle id="spend-title">Confirm purchase</ModalTitle>
          <ModalClose aria-label="Close" onClick={() => { setSpendOpen(false); clearIntent(); }}>×</ModalClose>
        </ModalHeader>
        <ModalBody>
          {intent.source === 'extra' && (
            <>
              <p>
                Unlock extra lessons for today.
              </p>
              <p style={{ opacity: 0.8 }}>
                Cost: <b>{Math.max(1, intent.count || 2) * 25} shards</b>
              </p>
            </>
          )}
          {intent.source === 'missed' && (
            <>
              <p>
                Unlock missed lessons ({intent.lessonNos.length}).
              </p>
              <p style={{ opacity: 0.8 }}>
                Lessons: {intent.lessonNos.join(', ')}
              </p>
              <p style={{ opacity: 0.8 }}>
                Cost: <b>{intent.lessonNos.length * 20} shards</b>
              </p>
            </>
          )}
          {spendMsg && <ErrorText>{spendMsg}</ErrorText>}
        </ModalBody>
        <ModalActions>
          <SmallButton type="button" onClick={() => { setSpendOpen(false); clearIntent(); }}>Cancel</SmallButton>
          <PrimaryButton type="button" onClick={confirmSpend} disabled={spendBusy}>{spendBusy ? 'Processing…' : 'Confirm'}</PrimaryButton>
        </ModalActions>
      </ModalRoot>
    </Screen>
  );
};

const Screen = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 16px;
  background:
    url('/homepagebg4.jpg') center/cover no-repeat,
    radial-gradient(1200px 600px at 20% -10%, rgba(111,126,79,.35), transparent 60%),
    radial-gradient(900px 500px at 120% 110%, rgba(139,107,63,.25), transparent 65%),
    ${({ theme }) => theme.colors.bg};
  position: relative;
  @media (max-width: 480px) { padding: 20px 12px; }
`;

const TileOverlay = styled.div`
  position: absolute;
  inset: 0;
  opacity: .12;
  background-image: linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
`;

const BalanceCard = styled.section`
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  border-radius: 20px;
  padding: 18px;
  background: ${({ theme }) => theme.colors.panel};
  display: grid;
  gap: 12px;
  backdrop-filter: saturate(120%) blur(2px);
  @media (max-width: 480px) { padding: 14px; gap: 10px; }
`;

const Label = styled.div`
  font-size: 0.75rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Value = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.95rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

const SmallButton = styled.button`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.pixelBorder};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
`;

const ErrorText = styled.div`
  font-size: 0.78rem;
  color: #f87171;
`;

const MetaRow = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const Section = styled.section`
  display: grid;
  gap: 12px;
`;

const ActivityWrap = styled.div`
  /* Desktop/tablet: fixed height with scroll */
  max-height: 320px;
  overflow-y: auto;
  padding-right: 4px; /* space for scrollbar */

  /* Smooth scroll and subtle scrollbar styling */
  scroll-behavior: smooth;
  &::-webkit-scrollbar { width: 8px; height: 8px; }
  &::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 8px; }
  &::-webkit-scrollbar-track { background: transparent; }

  /* Mobile: allow natural flow, no fixed height */
  @media (max-width: 480px) {
    max-height: none;
    overflow: visible;
    padding-right: 0;
  }
`;

const QuickBuyRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  @media (max-width: 480px) { button { flex: 1 1 auto; } }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2 {
    margin: 0;
    font-size: 0.85rem;
    letter-spacing: .08em;
    text-transform: uppercase;
    opacity: .75;
  }
  @media (max-width: 480px) { flex-direction: column; align-items: flex-start; gap: 6px; }
`;

const BackButton = styled(Button)`
  font-size: 0.65rem;
  padding: 8px 12px;
  border-radius: 10px;
  justify-self: start;
`;

const Banner = styled.div`
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 90vw;
  padding: 10px 14px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: 0.85rem;
  font-weight: 700;
  z-index: 200;
  box-shadow: 0 10px 24px rgba(0,0,0,.35);
`;
