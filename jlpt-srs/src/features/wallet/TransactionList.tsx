import React from 'react';
import styled from 'styled-components';
import type { WalletTransaction } from '@/lib/api/types';

const relativeFormatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

function toMillis(ts: any): number | null {
  if (!ts) return null;
  if (typeof ts === 'number') return ts;
  if (typeof ts?.toMillis === 'function') return ts.toMillis();
  return null;
}

function formatRelative(timestamp: any): { label: string; title: string } {
  const ms = toMillis(timestamp);
  if (!ms) return { label: '—', title: 'Unknown date' };
  const now = Date.now();
  const diff = ms - now;
  const abs = Math.abs(diff);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  let value: number;
  let unit: Intl.RelativeTimeFormatUnit;

  if (abs < minute) {
    value = Math.round(diff / 1000);
    unit = 'second';
  } else if (abs < hour) {
    value = Math.round(diff / minute);
    unit = 'minute';
  } else if (abs < day) {
    value = Math.round(diff / hour);
    unit = 'hour';
  } else {
    value = Math.round(diff / day);
    unit = 'day';
  }

  return {
    label: relativeFormatter.format(value, unit),
    title: new Date(ms).toLocaleString('en-US'),
  };
}

type Props = {
  transactions: WalletTransaction[];
  limit?: number;
};

export const TransactionList: React.FC<Props> = ({ transactions, limit = 10 }) => {
  const entries = transactions.slice(0, limit);
  if (!entries.length) {
    return <Empty>No transactions yet.</Empty>;
  }

  return (
    <List>
      {entries.map(tx => {
        const { label, title } = formatRelative(tx.createdAt);
        const isDebit = tx.amount < 0;
        const amount = `${isDebit ? '' : '+'}${tx.amount}`;
        return (
          <li key={tx.id}>
            <div className="header">
              <span title={title}>{label}</span>
              <strong>{tx.type}</strong>
            </div>
            <Amount data-direction={isDebit ? 'debit' : 'credit'}>{amount}</Amount>
            {('note' in tx && (tx as any).note) ? (
              <Payload>{String((tx as any).note)}</Payload>
            ) : null}
          </li>
        );
      })}
    </List>
  );
};

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;

  li {
    border: 1px solid rgba(0,0,0,0.12);
    border-radius: 14px;
    padding: 10px 12px;
    background: rgba(255,255,255,0.9);
    display: grid;
    gap: 6px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  strong {
    font-family: ${({ theme }) => theme.fonts.heading};
  }
`;

const Amount = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  &[data-direction='debit'] { color: #ef4444; }
  &[data-direction='credit'] { color: #22c55e; }
`;

const Payload = styled.div`
  font-size: 0.7rem;
  opacity: 0.7;
  word-break: break-all;
`;

const Empty = styled.div`
  opacity: 0.7;
  font-size: 0.85rem;
`;
