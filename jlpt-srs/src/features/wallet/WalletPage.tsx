import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useWalletContext } from '@/features/wallet/WalletProvider';
import { TransactionList } from '@/features/wallet/TransactionList';
import { useServerTime } from '@/hooks/useServerTime';
import { Panel, PanelHeader, BalanceBadge, PrimaryButton, InfoStrip } from '@/features/wallet/styles';
import { ShardHUD } from '@/components/TopBar/ShardHUD';
import { Button } from '@/components/ui/Button';

export const WalletPage: React.FC = () => {
  const { wallet, transactions, loading, error, refresh, openBuyModal } = useWalletContext();
  const { data: serverTime } = useServerTime(true);
  const nav = useNavigate();
  const shards = wallet?.shards ?? 0;
  const lessonsTaken = wallet?.daily?.lessonsTaken ?? 0;
  const extraLessonsUsed = wallet?.daily?.extraLessonsUsed ?? 0;
  const missedRedeemed = wallet?.daily?.missedLessonsRedeemed ?? 0;
  const freeLessonsRemaining = Math.max(0, 2 - lessonsTaken);

  return (
    <Screen>
      <TileOverlay />
      <Panel>
        <PanelHeader>
          <BackButton type="button" onClick={() => nav(-1)}>
            ← Back
          </BackButton>
          <h1>My Wallet</h1>
          <ShardHUD />
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
          <MetaRow>
            <div>
              <Label>Last reset</Label>
              <Value>{wallet?.lastResetISO ?? '—'}</Value>
            </div>
            <div>
              <Label>Free lessons remaining</Label>
              <Value>{freeLessonsRemaining}</Value>
            </div>
            <div>
              <Label>Extra lessons used</Label>
              <Value>{extraLessonsUsed}</Value>
            </div>
            <div>
              <Label>Missed lessons redeemed</Label>
              <Value>{missedRedeemed}</Value>
            </div>
          </MetaRow>
        </BalanceCard>

        <InfoStrip>
          Daily free lessons reset at 00:00 JST.
          {serverTime?.iso ? ` (Server time: ${new Date(serverTime.iso).toLocaleString('en-US')})` : ''}
        </InfoStrip>

        <Section>
          <SectionHeader>
            <h2>Recent activity</h2>
          </SectionHeader>
          <TransactionList transactions={transactions} limit={10} />
        </Section>
      </Panel>
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
    #0b0f14;
  position: relative;
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
  border: 2px solid #000;
  border-radius: 20px;
  padding: 18px;
  background: rgba(255,255,255,0.92);
  display: grid;
  gap: 12px;
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
  border: 1px solid rgba(0,0,0,0.2);
  background: rgba(255,255,255,0.7);
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
`;

const BackButton = styled(Button)`
  font-size: 0.65rem;
  padding: 8px 12px;
  border-radius: 10px;
  justify-self: start;
`;
