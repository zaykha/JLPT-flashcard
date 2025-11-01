import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/store/auth';
// import { upsertProfile, getLessonProgress, type JLPTLevelStr } from '@/lib/user-data';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import type { JLPTLevelStr } from '@/types/userV1';
import { upsertProfile } from '@/services/profileV1';
import { AvatarPickerResponsive } from '@/components/animated/AvatarPicker';

// import { getLessonProgress } from '@/services/progressV1';
// import { createInitialLessonProgress } from '@/services/onboardingV1';
// import { JLPT_LEVEL_RANGES, PER_DAY_DEFAULT } from '@/helpers/levelsV1';
// import { ensureStudyPlan } from '@/services/StudyPlanV1';

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

  @media (max-width: 600px) {
    border-radius: 12px;
    padding: 14px;
  }
`;

const PanelHeader = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(18px, 4.4vw, 22px);
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 12px;
  letter-spacing: .5px;
  text-shadow: 0 1px 0 #00000022;
`;

/** ——— form elements ——— */
const Grid = styled.div`
  display: grid;
  gap: 18px;

  @media (max-width: 600px) {
    gap: 14px;
  }
`;

const Field = styled.label`
  display: grid;
  gap: 8px;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(12px, 2.8vw, 13px);
  color: ${({ theme }) => theme.colors.textMuted};

  small {
    font-size: clamp(11px, 2.6vw, 12px);
    line-height: 1.35;
  }
`;

const Input = styled.input`
  width: 100%;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(14px, 3.6vw, 16px);
  padding: 10px 12px;
  border-radius: 10px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: #f9fafb;
  color: ${({ theme }) => theme.colors.primary};
  outline: none;
  transition: 120ms ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.secondary};
    background: #ffffff;
  }
`;

const Legend = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(11px, 2.4vw, 13px);
  color: ${({ theme }) => theme.colors.textMuted};
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const LevelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(72px, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
  }
`;

const LevelButton = styled(Button)`
  aspect-ratio: 1;
  font-size: clamp(14px, 4.2vw, 18px);
  letter-spacing: 0.14em;
  padding: 0;
`;

const Fieldset = styled.fieldset`
  margin: 0;
  padding: 0;
  border: 0;
  display: grid;
  gap: 10px;
`;

const Actions = styled.div`
  margin-top: 12px;
`;

export const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const nav = useNavigate();
  const [nickname, setNickname] = useState('');
  const [skillLevel, setSkillLevel] = useState<JLPTLevelStr>('N5');
  const [busy, setBusy] = useState(false);

  //avatar state
  const [avatarFile, setAvatarFile] = useState<string>('');

  const nicknameIsValid = /^[A-Za-z0-9 _-]{3,20}$/.test(nickname.trim());
  const canSubmit = !busy && nicknameIsValid && !!skillLevel && !!avatarFile;

  async function save() {
    if (!user || !canSubmit || !skillLevel) return;
    setBusy(true);

    try {
      const safeNickname = nickname.trim();

      // 1) Upsert profile (persist avatar selection)
      await upsertProfile(user.uid, {
        nickname: safeNickname,
        jlptLevel: skillLevel as JLPTLevelStr,
        avatarKey: avatarFile,                // e.g. "avatar-03"
      });

      // 2) Ensure study queue + 2.5 bootstrap sync (unchanged)
      const [{ loadBootCatalog }, { ensureDailyQueue }, { syncLessonProgressFromFirestore }, { ensureWalletDoc }] = await Promise.all([
        import('@/lib/bootstrap'),
        import('@/services/StudyPlanV1'),
        import('@/lib/synLessonProgress'),
        import('@/services/walletV1'),
      ]);

      const cat = await loadBootCatalog(skillLevel as JLPTLevelStr);
      const FALLBACK: Record<JLPTLevelStr, { start: number; end: number }> = {
        N5: { start: 1, end: 66 },
        N4: { start: 67, end: 129 },
        N3: { start: 130, end: 309 },
        N2: { start: 310, end: 492 },
        N1: { start: 493, end: 838 },
      };
      const range =
        cat && cat.lessonRange && typeof cat.lessonRange.start === 'number' && typeof cat.lessonRange.end === 'number'
          ? { start: cat.lessonRange.start, end: cat.lessonRange.end }
          : FALLBACK[skillLevel as JLPTLevelStr];

      if (range) {
        await ensureDailyQueue(user.uid, { levelRange: range, perDay: 2 });
      }

      // Ensure wallet doc exists (client-side) only if explicitly allowed (dev)
      try {
        if (import.meta.env.VITE_WALLET_CLIENT_INIT === 'true') {
          await ensureWalletDoc(user.uid);
        }
      } catch (e) { console.warn('[Onboarding] ensureWalletDoc failed (non-fatal)', e); }
      try { await syncLessonProgressFromFirestore(user.uid); } catch {}

      // 3) Mirror to bootstrap cache (include avatar)
      try {
        const { loadBootstrap, saveBootstrap } = await import('@/lib/bootstrap');
        const boot = loadBootstrap() ?? {};
        saveBootstrap({
          ...boot,
          profile: {
            ...(boot as any).profile,
            uid: user.uid,
            nickname: safeNickname,
            jlptLevel: skillLevel as JLPTLevelStr,
            avatarKey: avatarFile,
            accountType: (boot as any).profile?.accountType ?? 'free',
            createdAt: (boot as any).profile?.createdAt ?? Date.now(),
            updatedAt: Date.now(),
          },
          cachedAt: Date.now(),
      } as any);
      } catch (e) {
        console.warn('[Onboarding] saveBootstrap skipped', e);
      }

      // 4) done
      try {
        localStorage.setItem('koza.onb.ok', '1');
        localStorage.setItem(`koza.onb.ok.${user.uid}`, '1');
      } catch {}
      nav('/', { replace: true });
    } catch (err) {
      console.error('[Onboarding] save failed', err);
    } finally {
      setBusy(false);
    }
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
            <small>Use 3-20 letters, numbers, spaces, _ or - characters.</small>
          </Field>

          <Fieldset>
            <Legend>JLPT level</Legend>
            <LevelGrid role="group" aria-label="Select JLPT level">
              {(['N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevelStr[]).map((level) => (
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

          <Fieldset>
            <Legend>Avatar</Legend>
              <AvatarPickerResponsive
                value={avatarFile}
                onChange={setAvatarFile}
              />
          </Fieldset>

          <Actions>
            <Button type="button" variant="primary" size="lg" block onClick={save} disabled={!canSubmit}>
              {busy ? 'Saving…' : 'Save & Continue'}
            </Button>
          </Actions>
        </Grid>
      </Panel>
    </Screen>
  );
};
