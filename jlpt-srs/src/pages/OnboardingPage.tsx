import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/store/auth';
import { upsertProfile, type JLPTLevelStr, type Pace } from '@/lib/user-data';
import { useNavigate } from 'react-router-dom';
import Home_BG from "@/assets/HomePage/homepagebg.jpg";

/** ——— constants ——— */
const paces: Pace[] = [10, 20, 30, 50];
const levels: JLPTLevelStr[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

/** ——— background candy ——— */
const float = keyframes`
  0% { transform: translateY(0) }
  50% { transform: translateY(-6px) }
  100% { transform: translateY(0) }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 0 rgba(0,0,0,0) }
  50% { box-shadow: 0 6px 24px rgba(22,128,61,.25) }
  100% { box-shadow: 0 0 0 rgba(0,0,0,0) }
`;

/** ——— layout ——— */
const Screen = styled.div`
  min-height: 100svh;
  padding: 32px 16px;
  display: grid;
  place-items: center;
  background:
    ${`url(${Home_BG})`} center/cover no-repeat,
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
  gap: 14px;
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

const Select = styled.select`
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

const PaceRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Chip = styled.button<{ active?: boolean }>`
  --ring: ${({ theme }) => theme.colors.secondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 2px solid ${({ active, theme }) => (active ? theme.colors.secondary : theme.colors.border)};
  background: ${({ active }) => (active ? 'rgba(111,126,79,.12)' : '#fff')};
  color: ${({ active, theme }) => (active ? theme.colors.secondary : theme.colors.text)};
  cursor: pointer;
  user-select: none;
  transition: 120ms ease;
  &:hover {
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
`;

const Primary = styled.button`
  margin-top: 8px;
  width: 100%;
  font-family: ${({ theme }) => theme.fonts.heading};
  letter-spacing: .5px;
  font-size: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 2px solid #000;
  color: #fff;
  background: ${({ theme }) => theme.gradient.green};
  cursor: pointer;
  transition: 120ms ease;
  text-transform: uppercase;
  &:hover { transform: translateY(-1px) scale(1.01); }
  &:active { transform: translateY(0) scale(.999); }
  &:disabled { opacity: .6; cursor: not-allowed; }
`;

/** ——— decorative sprite/hero ——— */
const Sprite = styled.div`
  position: absolute;
  right: -8px;
  top: -18px;
  filter: drop-shadow(0 6px 18px rgba(0,0,0,.35));
  animation: ${float} 5s ease-in-out infinite;
  pointer-events: none;

  /* placeholder pixel badge */
  &::after {
    content: "★";
    display: grid;
    place-items: center;
    width: 64px; height: 64px;
    background: #1f2937;
    color: #ffd166;
    border: 2px solid #000;
    border-radius: 10px;
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 22px;
  }

  @media (max-width: 520px) { display: none; }
`;

/** ——— Promo Modal ——— */
type PromoModalProps = {
  open: boolean;
  onClose: () => void;
  imgSrc?: string;          // drop any URL or imported asset
  title?: string;
  ctaText?: string;
  ctaHref?: string;
};

const Backdrop = styled.div<{ open: boolean }>`
  position: fixed; inset: 0;
  background: rgba(0,0,0,.65);
  display: ${({ open }) => (open ? 'grid' : 'none')};
  place-items: center;
  z-index: 50;
`;

const Modal = styled.div`
  position: relative;
  width: min(640px, 92vw);
  background: ${({ theme }) => theme.colors.sheetBg};
  border: 2px solid #000;
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(0,0,0,.45);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex; align-items: center; gap: 12px;
  padding: 12px 12px 0 12px;
`;

const Close = styled.button`
  position: absolute;
  left: 8px; top: 8px;
  width: 36px; height: 36px;
  border-radius: 10px;
  border: 2px solid #000;
  background: #fff;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  &:hover { transform: translateY(-1px); }
`;

const ModalTitle = styled.h3`
  width: 100%;
  text-align: center;
  padding: 8px 32px;
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 16px;
`;

const ModalBody = styled.div`
  padding: 12px;
  display: grid;
  gap: 12px;
`;

const PromoImg = styled.img`
  width: 100%;
  display: block;
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
  max-height: 70vh;
  object-fit: cover;
  image-rendering: auto;
`;

const CTA = styled.a`
  margin: 0 auto 12px;
  display: inline-block;
  padding: 10px 14px;
  border-radius: 12px;
  border: 2px solid #000;
  background: ${({ theme }) => theme.gradient.emeraldCyan};
  color: #fff;
  text-decoration: none;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 12px;
  letter-spacing: .6px;
  text-transform: uppercase;
`;

/** ——— component ——— */
export const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const nav = useNavigate();
  const [nickname, setNickname] = useState('');
  const [vocabLevel, setVocabLevel] = useState<JLPTLevelStr>('N3');
  const [grammarLevel, setGrammarLevel] = useState<JLPTLevelStr>('N3');
  const [pace, setPace] = useState<Pace>(20);
  const [busy, setBusy] = useState(false);

  // Promo modal state (auto-show once if not seen)
  const [promoOpen, setPromoOpen] = useState(false);
  const promoSeenKey = 'promo_seen_v1';
  const escHandlerRef = useRef<((e: KeyboardEvent) => void) | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem(promoSeenKey);
    if (!seen) setPromoOpen(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPromoOpen(false);
    };
    escHandlerRef.current = handler;
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function closePromo() {
    setPromoOpen(false);
    localStorage.setItem(promoSeenKey, '1');
  }

  async function save() {
    if (!user) return;
    setBusy(true);
    await upsertProfile(user.uid, { nickname, vocabLevel, grammarLevel, pace });
    setBusy(false);
    nav('/', { replace: true });
  }

  const paceLabel = useMemo(() => ({
    10: 'Chill',
    20: 'Normal',
    30: 'Intense',
    50: 'OMG'
  } as Record<Pace, string>), []);

  return (
    <Screen>
      <TileOverlay />

      <Panel role="form" aria-label="Onboarding form">
        <Sprite aria-hidden />
        <PanelHeader>Set up your profile</PanelHeader>

        <Grid>
          <Field>
            Nickname
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your hero name"
              aria-label="Nickname"
            />
          </Field>

          <Field>
            Vocabulary level
            <Select
              value={vocabLevel}
              onChange={(e) => setVocabLevel(e.target.value as JLPTLevelStr)}
              aria-label="Vocabulary level"
            >
              {levels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
          </Field>

          <Field>
            Grammar level
            <Select
              value={grammarLevel}
              onChange={(e) => setGrammarLevel(e.target.value as JLPTLevelStr)}
              aria-label="Grammar level"
            >
              {levels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
          </Field>

          <Field>
            Daily pace
            <PaceRow>
              {paces.map((p) => (
                <Chip
                  key={p}
                  type="button"
                  active={p === pace}
                  onClick={() => setPace(p)}
                  aria-pressed={p === pace}
                >
                  {paceLabel[p]} ({p}/day)
                </Chip>
              ))}
            </PaceRow>
          </Field>

          <Primary onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save & Continue'}
          </Primary>
        </Grid>
      </Panel>

      {/* Promo modal */}
      <PromoModal
        open={promoOpen}
        onClose={closePromo}
        title="New Quest Arrives Soon!"
        imgSrc="/assets/promo/coming-soon.png"   // <— put your image here
        ctaText="Follow Dev Updates"
        ctaHref="https://example.com/your-x-or-discord"
      />
    </Screen>
  );
};

/** ——— PromoModal component ——— */
const PromoModal: React.FC<PromoModalProps> = ({ open, onClose, imgSrc, title, ctaText, ctaHref }) => {
  // close when backdrop clicked (outside)
  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <Backdrop open={open} onMouseDown={onBackdrop}>
      <Modal role="dialog" aria-modal="true" aria-label={title || 'Announcement'}>
        <Close onClick={onClose} aria-label="Close">✖</Close>
        {title && (
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
          </ModalHeader>
        )}
        <ModalBody>
          {imgSrc && <PromoImg src={imgSrc} alt={title || 'Promo'} />}
          {ctaHref && ctaText && <CTA href={ctaHref} target="_blank" rel="noreferrer">{ctaText}</CTA>}
        </ModalBody>
      </Modal>
    </Backdrop>
  );
};
