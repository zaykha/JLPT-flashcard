import React from 'react';
import styled from 'styled-components';

type Props = {
  currentStreak: number;
  longestStreak: number;
  monthStudyDays: number;
  monthTarget: number;
};

export const StreakRings: React.FC<Props> = ({ currentStreak, longestStreak, monthStudyDays, monthTarget }) => {
  const progressPct = clampPercent(monthStudyDays / max1(monthTarget));
  const streakPct = clampPercent(currentStreak / max1(longestStreak || currentStreak));

  return (
    <RingRow>
      <RingCard>
        <Ring $pct={streakPct}>
          <span>{currentStreak}</span>
        </Ring>
        <Label>Current Streak</Label>
        <Meta>Best {longestStreak} days</Meta>
      </RingCard>

      <RingCard>
        <Ring $pct={progressPct}>
          <span>{monthStudyDays}</span>
        </Ring>
        <Label>Days Studied</Label>
        <Meta>Goal {monthTarget} days</Meta>
      </RingCard>

      <RingCard>
        <Ring $pct={clampPercent(longestStreak / 30)}>
          <span>{longestStreak}</span>
        </Ring>
        <Label>Longest Streak</Label>
        <Meta>Keep the fire burning</Meta>
      </RingCard>
    </RingRow>
  );
};

type RingProps = { $pct: number };

function clampPercent(value: number) {
  return Math.max(0, Math.min(1, value));
}

function max1(value: number) {
  return Math.max(1, value || 1);
}

const RingRow = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
`;

const RingCard = styled.div`
  border: 2px solid #000;
  border-radius: 18px;
  padding: 16px 14px 18px;
  background: rgba(255,255,255,0.82);
  display: grid;
  gap: 8px;
  place-items: center;
`;

const Ring = styled.div<RingProps>`
  --size: 110px;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: ${({ $pct }) => `conic-gradient(#f97316 ${$pct * 360}deg, rgba(15,23,42,0.12) ${$pct * 360}deg)`};
  border: 2px solid #000;
  display: grid;
  place-items: center;
  span {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.4rem;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0,0,0,0.35);
  }
`;

const Label = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.75rem;
  letter-spacing: .08em;
  text-transform: uppercase;
`;

const Meta = styled.div`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;
