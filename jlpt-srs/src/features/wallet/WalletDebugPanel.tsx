import React, { useState } from 'react';
import styled from 'styled-components';
import { useWalletContext } from '@/features/wallet/WalletProvider';
import { usePurchase } from '@/hooks/usePurchase';
import { usePayments } from '@/hooks/usePayments';
import { friendlyMessage } from '@/lib/api/http';

const isProduction = import.meta.env.PROD;

export const WalletDebugPanel: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);

  if (isProduction) return null;

  const { wallet, transactions, loading, error, refresh, openBuyModal } = useWalletContext();
  const purchase = usePurchase();
  const { fetchCatalog, beginOrder } = usePayments();

  const latestTransactions = (transactions ?? []).slice(0, 5);

  const lessonsTaken = wallet?.daily?.lessonsTaken ?? 0;
  const extraUsed = wallet?.daily?.extraLessonsUsed ?? 0;
  const missedRedeemed = wallet?.daily?.missedLessonsRedeemed ?? 0;

  return (
    <Panel>
      <h4>Wallet Debug</h4>
      <Row><span>Shards:</span><strong>{wallet?.shards ?? 0}</strong></Row>
      <Row><span>Lessons today:</span><strong>{lessonsTaken}</strong></Row>
      <Row><span>Extra lessons:</span><strong>{extraUsed}</strong></Row>
      <Row><span>Missed redeemed:</span><strong>{missedRedeemed}</strong></Row>
      <Row><span>Last reset:</span><strong>{wallet?.lastResetISO ?? '—'}</strong></Row>
      <Buttons>
        <button type="button" onClick={() => void refresh()}>Sync Wallet</button>
        <button type="button" onClick={() => openBuyModal()}>Open Buy Modal</button>
        <button
          type="button"
          onClick={async () => {
            setStatus('loading-products');
            try {
              const catalog = await fetchCatalog();
              console.info('[wallet] debug products', catalog);
              setStatus(`products: ${catalog.products.length}`);
            } catch (err) {
              setStatus(friendlyMessage(err));
            }
          }}
        >
          Fetch Products
        </button>
        <button
          type="button"
          onClick={async () => {
            setStatus('purchase…');
            try {
              await purchase('quiz.retry', { quizId: 'DEBUG' });
              setStatus('purchase ok');
            } catch (err) {
              setStatus(friendlyMessage(err));
            }
          }}
        >
          Mock Purchase
        </button>
        <button
          type="button"
          onClick={async () => {
            setStatus('order…');
            try {
              const { orderId, clientSecret } = await beginOrder('SHARDS_0500');
              console.info('[wallet] mock payment', { orderId, clientSecret });
              setStatus(`order ${orderId}`);
            } catch (err) {
              setStatus(friendlyMessage(err));
            }
          }}
        >
          Mock Payment Flow
        </button>
      </Buttons>
      {loading && <Status>Loading…</Status>}
      {error && <Status data-error>{error}</Status>}
      {status && <Status>{status}</Status>}
      <Transactions>
        <h5>Recent transactions</h5>
        {latestTransactions.length === 0 ? (
          <Empty>—</Empty>
        ) : (
          <ul>
            {latestTransactions.map(tx => (
              <li key={tx.id}>
                <span>{tx.type}</span>
                <strong>{tx.amount}</strong>
                <small>{tx.createdAt ?? '—'}</small>
              </li>
            ))}
          </ul>
        )}
      </Transactions>
    </Panel>
  );
};

const Panel = styled.aside`
  position: fixed;
  bottom: 16px;
  right: 16px;
  padding: 16px;
  border-radius: 12px;
  border: 1px dashed rgba(255,255,255,0.4);
  background: rgba(12, 18, 28, 0.9);
  color: #fff;
  font-size: 0.75rem;
  z-index: 99;
  max-width: 260px;
  display: grid;
  gap: 10px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  span { opacity: 0.7; }
`;

const Buttons = styled.div`
  display: grid;
  gap: 6px;
  button {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.08);
    color: inherit;
    cursor: pointer;
    font-size: 0.75rem;
    text-align: left;
  }
`;

const Status = styled.div<{ 'data-error'?: boolean }>`
  font-size: 0.72rem;
  color: ${({ 'data-error': isError }) => (isError ? '#f87171' : '#e2e8f0')};
`;

const Transactions = styled.div`
  h5 {
    margin: 0 0 6px;
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    opacity: 0.7;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 4px;
  }
  li {
    display: grid;
    gap: 2px;
    background: rgba(255,255,255,0.08);
    padding: 6px;
    border-radius: 6px;
  }
  strong {
    font-family: ${({ theme }) => theme.fonts.heading};
  }
  small {
    opacity: 0.6;
  }
`;

const Empty = styled.div`
  opacity: 0.6;
`;
