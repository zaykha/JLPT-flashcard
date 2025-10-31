import styled from 'styled-components';

export const Screen = styled.section`
  position: relative;
  min-height: 100vh;
  @supports (height: 100dvh) { min-height: 100dvh; }
  @supports (height: 100svh) { min-height: 100svh; }
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Safe-area padding */
  padding: clamp(16px, 2.6vw, 24px);
  padding-left: calc(env(safe-area-inset-left, 0px) + clamp(16px, 2.6vw, 24px));
  padding-right: calc(env(safe-area-inset-right, 0px) + clamp(16px, 2.6vw, 24px));
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + clamp(10px, 2vw, 16px));

  background-color: ${({ theme }) => theme.colors.bg};
  background-image:
    ${({ theme }) => `url('${theme.backgrounds.GrammarQuizSummaryPage}')`},
    ${({ theme }) => theme.textures.dither};
  background-repeat: no-repeat, repeat;
  background-size: cover, auto;
  background-position: center, center;
  background-attachment: fixed;
  @media (max-width: 768px) { background-attachment: scroll; }
`;

export const PixelFrame = styled.div`
  max-width: 720px;
  width: 100%;
  background: ${({ theme }) => `${theme.colors.panel}EB`};
  border: 4px solid ${({ theme }) => theme.colors.pixelBorder};
  box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.borderDark}, inset 0 0 0 2px ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 24px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.gold};
`;

export const ScoreBox = styled.div`
  text-align: center;
  margin-bottom: 16px;
`;

export const ScoreText = styled.div`
  font-size: 1.1rem;
  margin-bottom: 8px;
`;

export const ScoreBar = styled.div`
  background: ${({ theme }) => `${theme.colors.textMuted}33`};
  border: 2px solid ${({ theme }) => theme.colors.borderDark};
  border-radius: 4px;
  height: 12px;
  overflow: hidden;
`;

export const ScoreFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: linear-gradient(90deg, #4ade80, #16a34a);
  transition: width 0.3s ease-out;
`;

export const Small = styled.small`
  display: block;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 4px;
`;

export const List = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 20px;
`;

export const Row = styled.div<{ $correct: boolean }>`
  padding: 10px 14px;
  border-radius: 6px;
  border: 2px solid ${({ $correct }) => ($correct ? '#22c55e' : '#ef4444')};
  background: ${({ $correct }) => ($correct ? '#0f1a0f' : '#1a0f0f')};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: 0 2px 0 rgba(0,0,0,0.4);
`;

export const Prompt = styled.strong`
  display: block;
  font-size: 0.85rem;
  margin-bottom: 4px;
`;

export const Result = styled.small`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  line-height: 1.4;
  color: #fcd34d;
  &.ok { color: #4ade80; }
`;

export const Actions = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
`;

export const Btn = styled.button<{ $variant?: 'primary'|'secondary'|'ghost' }>`
  --shadow: ${({ theme }) => theme.colors.pixelBorder};
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid var(--shadow);
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(12px, 3.2vw, 13px);
  text-transform: uppercase;
  letter-spacing: .04em;
  cursor: pointer;
  color: ${({ theme, $variant }) => $variant === 'ghost' ? theme.colors.text : theme.colors.onPrimary};
  background: ${({ theme, $variant }) =>
    $variant === 'secondary' ? theme.colors.secondary :
    $variant === 'ghost' ? theme.colors.panel :
    theme.colors.primary};
  box-shadow: 4px 4px 0 var(--shadow);
  transition: transform .1s ease, box-shadow .1s ease, opacity .15s ease;
  &:hover { transform: translateY(-1px); }
  &:active { transform: translate(4px,4px); box-shadow: 0 0 0 var(--shadow); }
`;
