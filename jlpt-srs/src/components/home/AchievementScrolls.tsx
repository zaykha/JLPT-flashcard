import React from 'react';
import styled from 'styled-components';

type Scroll = {
  id: string;
  title: string;
  unlocked: boolean;
  description: string;
};

type Props = {
  scrolls: Scroll[];
};

export const AchievementScrolls: React.FC<Props> = ({ scrolls }) => {
  return (
    <Wrap>
      <Heading>Dojo Scrolls</Heading>
      <Grid>
        {scrolls.map(scroll => (
          <ScrollCard key={scroll.id} $unlocked={scroll.unlocked}>
            <Ribbon>{scroll.unlocked ? 'Unlocked' : 'Locked'}</Ribbon>
            <Title>{scroll.title}</Title>
            <Description>{scroll.description}</Description>
          </ScrollCard>
        ))}
      </Grid>
    </Wrap>
  );
};

const Wrap = styled.section`
  // border: 2px solid #000;
  // border-radius: 18px;
  // padding: 18px;
  width:95%;
  margin:auto;

`;

const Heading = styled.h3`
  margin: 0 0 12px;
  font-family: ${({ theme }) => theme.fonts.heading};
  letter-spacing: .08em;
  text-transform: uppercase;
  font-size: 14px;
`;

const Grid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
`;

const ScrollCard = styled.div<{ $unlocked: boolean }>`
  position: relative;
  border: 2px solid #000;
  border-radius: 14px;
  padding: 16px 14px 20px;
  min-height: 120px;
  color: ${({ $unlocked }) => ($unlocked ? '#1f2937' : 'rgba(31,41,55,0.55)')};
  background:
    radial-gradient(circle at top, rgba(255,255,255,0.9), rgba(255,255,255,0.72)),
    ${({ $unlocked }) => ($unlocked ? '#f8f5ef' : 'rgba(248,245,239,0.65)')};
  filter: ${({ $unlocked }) => ($unlocked ? 'none' : 'grayscale(0.6)')};
`;

const Ribbon = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  border-radius: 999px;
  border: 2px solid #000;
  background: linear-gradient(135deg, #fbbf24, #f97316);
  color: #fff;
  font-size: 10px;
  letter-spacing: .08em;
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const Title = styled.div`
  margin-top: 12px;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 13px;
`;

const Description = styled.p`
  margin: 10px 0 0;
  font-size: 11px;
  line-height: 1.4;
`;

export type { Scroll };
