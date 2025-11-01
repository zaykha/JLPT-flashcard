import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/store/auth';
// import { upsertProfile, type UserProfile, type JLPTLevelStr } from '@/lib/user-data';
// import { usePurchase } from '@/hooks/usePurchase';
import type { JLPTLevelStr, UserProfile } from '@/types/userV1';
import { upsertProfile } from '@/services/profileV1';
import { AvatarPickerResponsive } from '@/components/animated/AvatarPicker';
import { loadBootstrap, saveBootstrap } from '@/lib/bootstrap';
import { useSession } from '@/store/session';
import { useNavigate } from 'react-router-dom';


type FormState = {
  nickname: string;
  avatarKey: string | null;
};

type Props = {
  open?: boolean;
  onClose?: () => void;
  profile: UserProfile | null | undefined;
  variant?: 'modal' | 'inline';
};

// const levelOptions: JLPTLevelStr[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

export const SettingsModal: React.FC<Props> = ({
  open = true,
  onClose,
  profile,
  variant = 'modal',
}) => {
  const { user } = useAuth();
  const nav = useNavigate();
  // const queryClient = useQueryClient();
  // const purchase = usePurchase();

  const defaults = useMemo<FormState>(() => ({
    nickname: profile?.nickname ?? '',
    avatarKey: profile?.avatarKey ?? null,
  }), [profile]);

  const [form, setForm] = useState<FormState>(defaults);

  useEffect(() => {
    setForm(defaults);
  }, [defaults]);

  const mutation = useMutation({
    mutationFn: async (values: FormState) => {
      if (!user) throw new Error('Not authenticated');
      await upsertProfile(user.uid, {
        nickname: values.nickname,
        avatarKey: values.avatarKey ?? undefined,
      });
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['profile', user?.uid] });
      onClose?.();
    },
  });

  const [spendOpen, setSpendOpen] = useState(false);
  const [spendCost, setSpendCost] = useState(0);
  const [spendLoading, setSpendLoading] = useState(false);
  const [spendError, setSpendError] = useState<string | null>(null);

  // Guard after hooks to keep hook order stable across renders
  if (variant === 'modal' && !open) return null;

  const content = (
    <Card as={variant === 'modal' ? 'form' : 'div'} onSubmit={variant === 'modal' ? handleSubmit : undefined}>
      <Header>
        <Title>Settings</Title>
        <Subtitle>One free change each for nickname and avatar. Later changes cost shards.</Subtitle>
      </Header>

      <Form>
        <Field>
          <Label>Nickname</Label>
          <Input
            id="nickname"
            value={form.nickname}
            onChange={e => setForm({ ...form, nickname: e.target.value })}
            placeholder="Calligraphy name"
          />
        </Field>

        <Field>
          <Label>Avatar</Label>
          <AvatarPickerResponsive
            value={form.avatarKey ?? undefined}
            onChange={(file) => setForm(prev => ({ ...prev, avatarKey: file }))}
          />
        </Field>

      </Form>

      <Footer>
        {variant === 'modal' ? (
          <GhostButton type="button" onClick={onClose}>Cancel</GhostButton>
        ) : (
          <GhostButton type="button" onClick={onClose}>← Back</GhostButton>
        )}
        <PrimaryButton
          type={variant === 'modal' ? 'submit' : 'button'}
          onClick={variant === 'modal' ? undefined : () => handleSubmitInline()}
          disabled={mutation.isPending || !user}
        >
          {mutation.isPending ? 'Saving…' : 'Save settings'}
        </PrimaryButton>
      </Footer>
    </Card>
  );

  if (variant === 'modal') {
    return (
      <Backdrop onMouseDown={handleBackdrop}>
        <ModalWrap>
          {content}
          {spendOpen && (
            <SidePanel role="dialog" aria-label="Confirm profile update">
              <PanelHeader>Confirm profile update</PanelHeader>
              <SmallHint>Changes beyond your first free update cost shards.</SmallHint>
              <KV><span>Cost</span><strong>💠 {spendCost}</strong></KV>
              <KV><span>Balance</span><strong>💠 {currentShards()}</strong></KV>
              <KV><span>After spend</span><strong>💠 {Math.max(currentShards() - spendCost, 0)}</strong></KV>
              {spendLoading ? <MiniNote>Processing…</MiniNote> : null}
              {spendError ? <ErrorText>{spendError}</ErrorText> : null}
              <SideActions>
                <GhostButton type="button" onClick={() => { setSpendOpen(false); nav('/wallet'); }}>Buy Shards</GhostButton>
                <GhostButton type="button" onClick={() => setSpendOpen(false)}>Cancel</GhostButton>
                <PrimaryButton type="button" onClick={() => void handleSpendConfirm()} disabled={spendLoading || currentShards() < spendCost}>Spend</PrimaryButton>
              </SideActions>
            </SidePanel>
          )}
        </ModalWrap>
      </Backdrop>
    );
  }

  // Inline variant: render the same card with optional side panel without a backdrop
  return (
    <InlineScreen>
      <ModalWrap>
        {content}
        {spendOpen && (
        <SidePanel role="dialog" aria-label="Confirm profile update">
          <PanelHeader>Confirm profile update</PanelHeader>
          <SmallHint>Changes beyond your first free update cost shards.</SmallHint>
          <KV><span>Cost</span><strong>💠 {spendCost}</strong></KV>
          <KV><span>Balance</span><strong>💠 {currentShards()}</strong></KV>
          <KV><span>After spend</span><strong>💠 {Math.max(currentShards() - spendCost, 0)}</strong></KV>
          {spendLoading ? <MiniNote>Processing…</MiniNote> : null}
          {spendError ? <ErrorText>{spendError}</ErrorText> : null}
          <SideActions>
            <GhostButton type="button" onClick={() => { setSpendOpen(false); nav('/wallet'); }}>Buy Shards</GhostButton>
            <GhostButton type="button" onClick={() => setSpendOpen(false)}>Cancel</GhostButton>
            <PrimaryButton type="button" onClick={() => void handleSpendConfirm()} disabled={spendLoading || currentShards() < spendCost}>Spend</PrimaryButton>
          </SideActions>
        </SidePanel>
        )}
      </ModalWrap>
    </InlineScreen>
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    triggerSave();
  }

  function handleSubmitInline() {
    triggerSave();
  }

  function triggerSave() {
    if (!user || mutation.isPending) return;
    const originalNick = profile?.nickname ?? '';
    const originalAvatar = profile?.avatarKey ?? null;
    const nickChanged = form.nickname.trim() !== originalNick.trim();
    const avatarChanged = (form.avatarKey ?? null) !== (originalAvatar ?? null);
    if (!nickChanged && !avatarChanged) {
      mutation.mutate(form);
      return;
    }

    // Free-once gating (per user, per field)
    const uid = user.uid;
    const nickKey = `koza.profile.nicknameChanged.${uid}`;
    const avKey = `koza.profile.avatarChanged.${uid}`;
    const nickAlready = localStorage.getItem(nickKey) === '1';
    const avAlready = localStorage.getItem(avKey) === '1';

    const NICK_COST = 50; // shards per subsequent change
    const AVATAR_COST = 50;
    let cost = 0;
    if (nickChanged && nickAlready) cost += NICK_COST;
    if (avatarChanged && avAlready) cost += AVATAR_COST;

    if (cost <= 0) {
      // Free changes → save and mark as changed
      mutation.mutate(form);
      try { applyProfileLocalUpdate(form.nickname, form.avatarKey ?? undefined); } catch {}
      if (nickChanged) localStorage.setItem(nickKey, '1');
      if (avatarChanged) localStorage.setItem(avKey, '1');
      return;
    }

    setSpendCost(cost);
    setSpendError(null);
    setSpendLoading(false);
    setSpendOpen(true);
  }

  function currentShards(): number {
    try {
      const boot = loadBootstrap();
      // wallet shape in bootstrap: { wallet: Wallet, transactions: [] }
      return Number((boot as any)?.wallet?.wallet?.shards ?? 0);
    } catch { return 0; }
  }

  async function handleSpendConfirm() {
    if (!user) return;
    setSpendLoading(true);
    setSpendError(null);
    try {
      const bal = currentShards();
      if (bal < spendCost) { setSpendError('Not enough shards.'); setSpendLoading(false); return; }
      const boot = loadBootstrap();
      if (boot) {
        const next = { ...(boot as any) };
        const cur = Number((next?.wallet?.wallet?.shards ?? 0));
        if (!next.wallet) next.wallet = { wallet: { shards: cur }, transactions: [] } as any;
        if (!next.wallet.wallet) next.wallet.wallet = { shards: cur } as any;
        next.wallet.wallet.shards = Math.max(0, cur - spendCost);
        next.cachedAt = Date.now();
        saveBootstrap(next as any);
      }
      // Persist profile changes
      await upsertProfile(user.uid, {
        nickname: form.nickname,
        avatarKey: form.avatarKey ?? undefined,
      });
      try { applyProfileLocalUpdate(form.nickname, form.avatarKey ?? undefined); } catch {}
      // Mark flags
      const uid = user.uid;
      const originalNick = profile?.nickname ?? '';
      const originalAvatar = profile?.avatarKey ?? null;
      if (form.nickname.trim() !== originalNick.trim()) localStorage.setItem(`koza.profile.nicknameChanged.${uid}`, '1');
      if ((form.avatarKey ?? null) !== (originalAvatar ?? null)) localStorage.setItem(`koza.profile.avatarChanged.${uid}`, '1');

      setSpendOpen(false);
      onClose?.();
    } catch (e: any) {
      setSpendError(e?.message || 'Failed to update profile.');
    } finally {
      setSpendLoading(false);
    }
  }

  function applyProfileLocalUpdate(nickname: string, avatarKey?: string) {
    const boot = loadBootstrap();
    if (!boot) return;
    const next = { ...(boot as any) };
    next.profile = {
      ...(next.profile ?? {}),
      nickname,
      avatarKey: avatarKey ?? (next.profile?.avatarKey ?? null),
    };
    next.cachedAt = Date.now();
    const changed = saveBootstrap(next as any);
    try { if (changed) useSession.getState().bumpBootRevision?.(); } catch {}
  }

  function handleBackdrop(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose?.();
  }
};

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  /* Modal backdrop: simple dim, no image */
  background: rgba(0,0,0,0.7);
  display: grid;
  place-items: center;
  padding: 24px;
  z-index: 80;
`;

const ModalWrap = styled.div`
  position: relative;
  display: inline-block; /* shrink to content width */
`;

// Inline settings screen background (when variant='inline')
const InlineScreen = styled.div`
  min-height: 100vh;
  width: 100%;
  display: grid;
  place-items: center;
  padding: 32px 16px;
  background:
    url('/homepagebg4.jpg') center/cover no-repeat,
    radial-gradient(1200px 600px at 20% -10%, rgba(111,126,79,.35), transparent 60%),
    radial-gradient(900px 500px at 120% 110%, rgba(139,107,63,.25), transparent 65%),
    ${({ theme }) => theme.colors.bg};
  @media (prefers-color-scheme: dark) {
    background:
      url('/homepagebg4-dark.jpg') center/cover no-repeat,
      radial-gradient(1200px 600px at 20% -10%, rgba(0,0,0,.35), transparent 60%),
      radial-gradient(900px 500px at 120% 110%, rgba(0,0,0,.25), transparent 65%),
      ${({ theme }) => theme.colors.bg};
  }
`;

const Card = styled.form`
  width: min(420px, 92vw);
  border-radius: 18px;
  border: 2px solid #000;
  background: ${({ theme }) => theme.colors.sheetBg};
  box-shadow: 0 18px 32px rgba(0,0,0,0.45);
  padding: 20px 20px 16px;
  display: grid;
  gap: 16px;
  position: relative;
  @media (max-width: 520px) {
    padding: 14px 12px;
    border-width: 1px;
  }
`;

const Header = styled.div`
  display: grid;
  gap: 6px;
`;

const Title = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.heading};
  letter-spacing: .08em;
  text-transform: uppercase;
  font-size: clamp(14px, 4vw, 16px);
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
  @media (max-width: 520px) { font-size: 0.72rem; }
`;

const Form = styled.div`
  display: grid;
  gap: 14px;
`;

const Field = styled.label`
  display: grid;
  gap: 6px;
  font-size: 0.8rem;
`;

const Label = styled.span`
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: clamp(11px, 3.2vw, 12px);
`;

const Input = styled.input`
  border-radius: 12px;
  border: 2px solid #000;
  padding: 10px 12px;
  font-size: 0.95rem;
  font-family: ${({ theme }) => theme.fonts.body};
  @media (max-width: 520px) {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
`;

const Select = styled.select`
  border-radius: 12px;
  border: 2px solid #000;
  padding: 10px 12px;
  font-size: 0.95rem;
  font-family: ${({ theme }) => theme.fonts.body};
`;

const Row = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
`;

const Footer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const PrimaryButton = styled.button`
  padding: 12px 18px;
  border-radius: 12px;
  border: 2px solid #000;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-family: ${({ theme }) => theme.fonts.heading};
  text-transform: uppercase;
  letter-spacing: .06em;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  @media (max-width: 520px) { padding: 10px 12px; font-size: 0.85rem; }
`;

const GhostButton = styled(PrimaryButton)`
  background: #1f2937;
`;

// Inline side panel for confirming spends (no extra popup)
const SidePanel = styled.aside`
  position: absolute;
  top: 12px;
  right: -12px;
  transform: translateX(100%);
  width: 280px;
  max-width: 80vw;
  border-radius: 14px;
  border: 2px solid #000;
  background: ${({ theme }) => theme.colors.panel};
  padding: 14px;
  box-shadow: 0 14px 28px rgba(0,0,0,0.35);
  @media (max-width: 520px) {
    position: static;
    transform: none;
    width: 100%;
    max-width: 100%;
    margin-top: 10px;
  }
`;

const PanelHeader = styled.h4`
  margin: 0 0 8px;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 14px;
`;

const SmallHint = styled.div`
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 8px;
`;

const KV = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13px; margin: 4px 0;
  span { opacity: 0.75; }
  strong { font-family: ${({ theme }) => theme.fonts.heading}; }
`;

const SideActions = styled.div`
  display: flex; gap: 8px; justify-content: flex-end; margin-top: 10px; flex-wrap: wrap;
`;

const MiniNote = styled.div`
  font-size: 12px; opacity: 0.8;
`;

const ErrorText = styled.div`
  color: #ef4444; font-size: 12px;
`;
