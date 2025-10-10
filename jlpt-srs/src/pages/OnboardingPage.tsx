import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/store/auth';
import { upsertProfile, type JLPTLevelStr } from '@/lib/user-data';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

const levels: JLPTLevelStr[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

const glowPulse = keyframes`
  0% { box-shadow: 0 0 0 rgba(0,0,0,0) }
  50% { box-shadow: 0 6px 24px rgba(22,128,61,.25) }
  100% { box-shadow: 0 0 0 rgba(0,0,0,0) }
`;
const Screen = styled.div`
  min-height: 100svh;
  padding: 32px 16px;
  display: grid;
  place-items: center;
  background:
    ${`url(/homepagebg.jpg)`} center/cover no-repeat,
    radial-gradient(1200px 600px at 20% -10%, rgba(111,126,79,.35), transparent 60%),
    radial-gradient(900px 500px at 120% 110%, rgba(139,107,63,.25), transparent 65%),
    #0b0f14;
  position: relative;
  overflow: hidden;
`;

/* subtle tiled pattern, evokes RPG grass/ground */
const TileOverlay = styled.div`
  position: absolute;
  inset: 0;
  opacity: .15;
  background-image: linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px);
  background-size: 24px 24px, 24px 24px;
  pointer-events: none;
`;

/** ——— pixel card/panel ——— */
const Panel = styled.section`
  width: min(720px, 100%);
  background: ${({ theme }) => theme.colors.sheetBg};
  border-radius: 16px;
  padding: 20px;
  border: 2px solid #000;
  box-shadow:
    0 2px 0 #000,
    0 8px 0 rgba(0,0,0,.35),
    ${({ theme }) => theme.shadow.card};
  position: relative;
  animation: ${glowPulse} 3.2s ease-in-out infinite;
  image-rendering: pixelated;
`;

const PanelHeader = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(18px, 2.6vw, 22px);
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 16px;
  letter-spacing: .5px;
  text-shadow: 0 1px 0 #00000022;
`;

/** ——— form elements ——— */
const Grid = styled.div`
  display: grid;
  gap: 18px;
`;

const Field = styled.label`
  display: grid;
  gap: 8px;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Input = styled.input`
  width: 100%;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: #f9fafb;
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  transition: 120ms ease;
  &:focus {
    border-color: ${({ theme }) => theme.colors.secondary};
    background: #ffffff;
  }
`;

const Fieldset = styled.fieldset`
  margin: 0;
  padding: 0;
  border: 0;
  display: grid;
  gap: 10px;
`;

const Legend = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const LevelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(72px, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
    gap: 10px;
  }
`;

const LevelButton = styled(Button)`
  aspect-ratio: 1;
  font-size: clamp(16px, 3.4vw, 20px);
  letter-spacing: 0.14em;
  padding: 0;
`;

const Actions = styled.div`
  margin-top: 12px;
`;

/** ——— component ——— */
export const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const nav = useNavigate();
  const [nickname, setNickname] = useState('');
  const [skillLevel, setSkillLevel] = useState<JLPTLevelStr | null>(null);
  const [busy, setBusy] = useState(false);

  const nicknameIsValid = /^[A-Za-z0-9 _-]{3,20}$/.test(nickname.trim());
  const canSubmit = !busy && nicknameIsValid && !!skillLevel;

  async function save() {
    if (!user || !canSubmit || !skillLevel) return;
    setBusy(true);
    const safeNickname = nickname.trim();
    await upsertProfile(user.uid, {
      nickname: safeNickname,
      jlptLevel: skillLevel
    });
    setBusy(false);
    nav('/', { replace: true });
  }

  return (
    <Screen>
      <TileOverlay />

      <Panel role="form" aria-label="Onboarding form">
        <PanelHeader>Set up your profile</PanelHeader>

        <Grid>
          <Field htmlFor="nickname">
            Nickname
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your hero name"
              aria-label="Nickname"
              maxLength={20}
            />
            <small>
              Use 3-20 letters, numbers, spaces, _ or - characters.
            </small>
          </Field>

          <Fieldset>
            <Legend>JLPT level</Legend>
            <LevelGrid role="group" aria-label="Select JLPT level">
              {levels.map((level) => (
                <LevelButton
                  key={level}
                  type="button"
                  variant="secondary"
                  size="lg"
                  active={skillLevel === level}
                  aria-pressed={skillLevel === level}
                  onClick={() => setSkillLevel(level)}
                >
                  {level}
                </LevelButton>
              ))}
            </LevelGrid>
          </Fieldset>

          <Actions>
            <Button
              type="button"
              variant="primary"
              size="lg"
              block
              onClick={save}
              disabled={!canSubmit}
            >
              {busy ? 'Saving…' : 'Save & Continue'}
            </Button>
          </Actions>
        </Grid>
      </Panel>

    </Screen>
  );
};
