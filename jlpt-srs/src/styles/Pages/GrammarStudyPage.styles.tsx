import styled from 'styled-components';

export const Screen = styled.section`
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 24px 12px;
  position: relative;
  overflow: hidden;

  background-color: ${({ theme }) => theme.colors.bg};
  background-image:
    ${({ theme }) => `url('${theme.backgrounds.GrammarStudyPage}')`},
    ${({ theme }) => theme.textures.dither},
    radial-gradient(1200px 600px at 20% -10%, ${({ theme }) => `${theme.colors.secondary}59`}, transparent 60%),
    radial-gradient(900px 500px at 120% 110%, ${({ theme }) => `${theme.colors.gold}40`}, transparent 65%);
  background-repeat: no-repeat, repeat, no-repeat, no-repeat;
  background-size: cover, auto, auto, auto;
  background-position: center, center, center, center;
`;

export const TileOverlay = styled.div`
  position: absolute; inset: 0;
  opacity: .14;
  background-image:
    linear-gradient(to right, ${({ theme }) => `${theme.colors.text}0F`} 1px, transparent 1px),
    linear-gradient(to bottom, ${({ theme }) => `${theme.colors.text}0F`} 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
`;

export const Panel = styled.section`
  width: min(860px, 100%);
  position: relative;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.card};

  background: ${({ theme }) => `${theme.colors.panel}3A`};
  border: 2px solid ${({ theme }) => theme.colors.borderDark};
  box-shadow:
    ${({ theme }) => theme.textures.border8},
    ${({ theme }) => theme.shadow.card};
  backdrop-filter: blur(6px);
`;

export const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  gap: 8px;
  margin: 8px 0 6px;
  padding: 4px 6px 12px;
  border-bottom: 2px dashed ${({ theme }) => theme.colors.border};
`;

export const Title = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.text};
  font-size: clamp(14px, 3.6vw, 18px);
  letter-spacing: .5px;
  text-align: center;
`;

export const Body = styled.div`
  display: grid;
  gap: 12px;
  padding-top: 12px;
`;

export const Stage = styled.div`
  display: grid;
  gap: 10px;
  justify-items: center;
`;

export const Hud = styled.div`
  display: grid;
  gap: 8px;
  justify-items: center;
`;

export const Counter = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(12px, 3.2vw, 13px);
  color: ${({ theme }) => theme.colors.text};
`;

export const BarWrap = styled.div`
  width: min(420px, 90%);
  height: 12px;
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  border-radius: 10px;
  background: ${({ theme }) => `${theme.colors.textMuted}22`};
  overflow: hidden;
`;

export const BarFill = styled.div<{ $pct:number }>`
  width: ${({ $pct }) => `${$pct}%`};
  height: 100%;
  background: ${({ theme }) => theme.gradient.green};
  transition: width 200ms ease;
`;

export const Controls = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 10px;
  @media (max-width: 520px) {
    grid-auto-flow: row;
    grid-template-columns: 1fr 1fr 1fr;
  }
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
  @media (max-width: 520px) { padding: 10px 12px; }
`;

export const ModalBackdrop = styled.div`
  position: fixed; inset: 0; background: ${({ theme }) => `${theme.colors.bg}CC`};
  display: grid; place-items: center; z-index: 50;
`;
export const Modal = styled.div`
  background:  ${({ theme }) => theme.gradient.slate};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 16px;
  padding: 30px; 
  width: min(92vw, 420px); box-shadow: ${({ theme }) => theme.shadow.card};
`;
export const TopRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 8px 0 6px;
  text-align: left;
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;
export const Small = styled.div` font-size: 12px; opacity: 0.9; color: ${({ theme }) => theme.colors.text};`;

