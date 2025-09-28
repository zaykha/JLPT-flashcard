import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/store/auth';
import { getProfile, type UserProfile } from '@/lib/user-data';
import { useNavigate } from 'react-router-dom';
import { useTopics } from '@/store/topics';
import { useSRS } from '@/store/srs';
// import HOME_BG from "@/assets/HomePage/homepagebg4.jpg";
// import Promo from "@/assets/promo/coming-soon.png";
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TopicIcon } from '@/components/ui/TopicIcon';
import { useIsMobile } from '@/hooks/useIsMobile';
import { normalizeTopicKey } from '@/types/vocab';

/** ——— layout + styling ——— */
const Screen = styled.div`
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 32px 16px;
  background:
    url(/homepagebg4.jpg) center/cover no-repeat,
    radial-gradient(1200px 600px at 20% -10%, rgba(111,126,79,.35), transparent 60%),
    radial-gradient(900px 500px at 120% 110%, rgba(139,107,63,.25), transparent 65%),
    #0b0f14;
  position: relative;
  overflow: hidden;
  @media (max-width: 520px) {
    padding: 4px 1px 12px;
  }
`;
const IconBtn = styled.button`
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  border-radius: 10px;
  border: 2px solid #000;
  background: #fff;
  cursor: pointer;
  transition: transform .1s ease;
  &:hover { transform: translateY(-1px); }
`;

const HeaderActions = styled.div`
  display: flex; gap: 8px; align-items: center;
`;

const TileOverlay = styled.div`
  position: absolute; inset: 0;
  opacity: .14;
  background-image: linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
`;

const Panel = styled.section`
  width: min(760px, 100%);
  background: ${({ theme }) => theme.colors.sheetBg};
  border-radius: 16px;
  border: 2px solid #000;
  box-shadow: 0 2px 0 #000, 0 8px 0 rgba(0,0,0,.35), ${({ theme }) => theme.shadow.card};
  padding: 18px;
  position: relative;
  image-rendering: pixelated;
  @media (max-width: 520px) {
    padding: 14px;
    border-radius: 14px;
  }
`;

const HeaderBar = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 8px 14px;
  border-bottom: 2px dashed ${({ theme }) => theme.colors.border};
  @media (max-width: 520px) {
    padding: 4px 4px 12px;
  }
`;

const TitleWrap = styled.div` display: grid; gap: 4px; `;

const Greeting = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-size: clamp(16px, 4.2vw, 22px);
  letter-spacing: .5px;
`;

const Sub = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  @media (max-width: 520px) {
  font-size: 10px;
  }
`;

const SignOut = styled.button`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 2px solid #000;
  background: ${({ theme }) => theme.colors.secondary};
  color: #fff;
  cursor: pointer;
  transition: 120ms ease;
  &:hover { transform: translateY(-1px); }
  @media (max-width: 520px) {
    padding: 8px 10px;
    font-size: 10px;
  }
`;

const Content = styled.div` display: grid; gap: 14px; padding-top: 14px; 
@media (max-width: 520px) {
  gap: 12px;
  padding-top: 12px;
}`;


const CardTitle = styled.div`
  font-weight: 800; font-size: 14px; margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
`;

const CategoryCard = styled.div`
  border: 2px solid #000;
  border-radius: 14px;
  padding: 14px;
  background:
    linear-gradient(145deg, rgba(139,107,63,.08), rgba(111,126,79,.08)),
    #fff;
    @media (max-width: 520px) {
      width:100%;
      border:none;
      padding: 0;
    }
`;

const TopicList = styled.div`
  display: grid;
  gap: 12px;
  @media (max-width: 520px) {
    gap: 10px;
  }
`;

const TopicRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #ffffff;
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 10px;
    align-items: start;
  }
`;

const TopicHead = styled.div`
  display: flex; align-items: center; gap: 8px;
  min-width: 160px;
  @media (max-width: 520px) {
    min-width: 0;
    gap: 6px;
  }
`;

const TopicTitle = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 700;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom:5px;
`;

const TopicMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;
/* Second column wrapper so we can add spacing on phones */
const BarCol = styled.div`
  @media (max-width: 520px) {
    margin-top: 2px;
  }
`;
const Actions = styled.div`
  display: grid; gap: 12px; grid-template-columns: 1fr 1fr;
  @media (max-width: 520px) { grid-template-columns: 1fr; }
`;

const ActionBtn = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 18px 16px; border-radius: 14px; border: 2px solid #000;
  font-family: ${({ theme }) => theme.fonts.heading};
  letter-spacing: .4px; text-transform: uppercase; font-size: 13px;
  cursor: pointer; transition: 120ms ease; color: #fff;
  background: ${({ variant, theme }) =>
    variant === 'secondary' ? theme.colors.secondary : theme.colors.primary};
  &:hover { transform: translateY(-1px) scale(1.01); }
  &:active { transform: translateY(0) scale(.998); }
  @media (max-width: 520px) {
    padding: 14px 12px;
    font-size: 12px;
  }
`;

const Backdrop = styled.div<{ open: boolean }>`
  position: fixed; inset: 0; background: rgba(0,0,0,.65);
  display: ${({ open }) => (open ? 'grid' : 'none')};
  place-items: center; z-index: 50;
`;

const Modal = styled.div`
  position: relative; width: min(640px, 92vw);
  background: ${({ theme }) => theme.colors.sheetBg};
  border: 2px solid #000; border-radius: 18px;
  box-shadow: 0 10px 24px rgba(0,0,0,.45); overflow: hidden;
`;

const Close = styled.button`
  position: absolute; left: 8px; top: 8px;
  width: 36px; height: 36px; border-radius: 10px;
  border: 2px solid #000; background: #fff;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 14px; line-height: 1; cursor: pointer;
  &:hover { transform: translateY(-1px); }
`;

const ModalTitle = styled.h3`
  text-align: center; padding: 12px 40px 4px; margin: 0;
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary}; font-size: 16px;
`;

const ModalBody = styled.div` padding: 12px; display: grid; gap: 12px; `;

const PromoImg = styled.img`
  width: 100%; display: block; border-top: 2px solid #000; border-bottom: 2px solid #000;
  max-height: 70vh; object-fit: cover;
`;

const CTA = styled.a`
  margin: 0 auto 12px; display: inline-block; padding: 10px 14px;
  border-radius: 12px; border: 2px solid #000; color: #fff; text-decoration: none;
  font-family: ${({ theme }) => theme.fonts.heading}; font-size: 12px; letter-spacing: .6px; text-transform: uppercase;
  background: ${({ theme }) => theme.gradient.emeraldCyan};
`;

/** ——— HomePage ——— */
export const HomePage: React.FC = () => {
  const isMobile = useIsMobile();
  const { user, signOutUser } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const groups = useTopics(s => s.groups);
  const srsMap = useSRS(s => s.map);
  const progressByTopic = useTopics(s => s.progressByTopic);

// ⬇️ Build the per-topic buckets using the same approach as StudySettings.
const progressMap = React.useMemo(
  () => progressByTopic(srsMap as any),
  [progressByTopic, srsMap]
);

  // Promo: open on every mount (every time Home loads)
  const [promoOpen, setPromoOpen] = useState(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPromoOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const p = await getProfile(user.uid);
      setProfile(p);
      if (!p) nav('/onboarding', { replace: true });
    })();
  }, [user, nav]);

  // compute stats (keep hooks order stable)
  // const learned = Object.keys(srsMap).length;
  // const total = groups.reduce((a, g) => a + g.items.length, 0);
  // const pct = total === 0 ? 0 : Math.min(100, Math.round((learned / total) * 100));

  if (!user) return null;

type ImgLike = string | { src: string }; // works for Vite/CRA/Next-style imports

type PromoModalProps = {
  open: boolean;
  onClose: () => void;
  imgSrc?: ImgLike;
  title?: string;
  ctaText?: string;
  ctaHref?: string;
};
type TopicBuckets = {
  newCount: number;
  dueCount: number;
  futureCount: number;
  byStep: Record<number, number>;
};
// function toSegments(buckets: {
//   newCount: number;
//   dueCount: number;
//   futureCount: number;
//   byStep: Record<string, number>;
// }): ProgressSegment[] {
//   const segs: ProgressSegment[] = [
//     { key: 'new',    label: 'New',    count: buckets.newCount },
//     { key: 'due',    label: 'Due',    count: buckets.dueCount },
//     { key: 'future', label: 'Queued', count: buckets.futureCount },
//   ];

//   // include spaced-repetition steps as s0..s4 (if present)
//   const keys = Object.keys(buckets.byStep || {});
//   keys.sort(); // s0, s1, ...
//   for (const k of keys) {
//     const c = buckets.byStep[k] || 0;
//     if (c > 0) segs.push({ key: k, label: k.toUpperCase(), count: c });
//   }
//   return segs;
// }
function toSegments(buckets: TopicBuckets) {
  const segs: import('@/components/ui/ProgressBar').ProgressSegment[] = [
    { key: 'new',    label: 'New',    count: buckets.newCount },
    { key: 'due',    label: 'Due',    count: buckets.dueCount },
    { key: 'future', label: 'Queued', count: buckets.futureCount },
  ];

  // Convert numeric steps to 's0', 's1', ... for the ProgressBar color map
  const stepEntries = Object.entries(buckets.byStep); // [ '0', 12 ] etc.
  stepEntries.sort((a, b) => Number(a[0]) - Number(b[0]));
  for (const [stepStr, count] of stepEntries) {
    const stepNum = Number(stepStr);
    if (count > 0) segs.push({ key: `s${stepNum}`, label: `S${stepNum}`, count });
  }

  return segs;
}
const resolveImgSrc = (img?: ImgLike) =>
  !img ? undefined : (typeof img === 'string' ? img : img.src);

const PromoModal: React.FC<PromoModalProps> = ({ open, onClose, imgSrc, title, ctaText, ctaHref }) => {
  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const src = resolveImgSrc(imgSrc);

  
  return (
    <Backdrop open={open} onMouseDown={onBackdrop}>
      <Modal role="dialog" aria-modal="true" aria-label={title || 'Announcement'}>
        <Close onClick={onClose} aria-label="Close">✖</Close>
        {title && <ModalTitle>{title}</ModalTitle>}
        <ModalBody>
          {src && (
            <PromoImg
              src={src}
              alt={title || 'Promo'}
              onError={(e) => {
                console.warn('[PromoImg] failed to load:', src);
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          {ctaHref && ctaText && (
            <CTA href={ctaHref} target="_blank" rel="noreferrer">
              {ctaText}
            </CTA>
          )}
        </ModalBody>
      </Modal>
    </Backdrop>
  );
};


  if (!profile) {
    return (
      <Screen>
        <TileOverlay />
        <Panel><CardTitle>Loading profile…</CardTitle></Panel>
        {/* Promo still shows even while loading, if you want, keep it here */}
        <PromoModal
          open={promoOpen}
          onClose={() => setPromoOpen(false)}
          title="New Quest Arrives Soon!"
          imgSrc={'/coming-soon.png'}
          ctaText="Follow Dev Updates"
          ctaHref="https://example.com/your-x-or-discord"
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <TileOverlay />
      <Panel>
        {/* <Sprite aria-hidden /> */}
        <HeaderBar>
          <TitleWrap>
            <Greeting>Hi, {profile.nickname}</Greeting>
            <Sub>Vocab {profile.vocabLevel} • Grammar {profile.grammarLevel} • Pace {profile.pace}/day</Sub>
          </TitleWrap>
          <HeaderActions>
            <IconBtn onClick={() => nav('/settings')} aria-label="Settings">
              {/* simple gear svg */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 9 2.09V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0A1.65 1.65 0 0 0 21.91 11H22a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
              </svg>
            </IconBtn>
            <SignOut onClick={signOutUser}>Sign out</SignOut>
          </HeaderActions>

        </HeaderBar>

        <Content>
        <CategoryCard>
          <CardTitle>Progress by Topic</CardTitle>
          <TopicList>
            {groups.map(g => {
              // const buckets = progressMap[g.key] ?? { newCount: g.items.length, dueCount: 0, futureCount: 0, byStep: {} };
              const tKey = normalizeTopicKey(g.key);
              const buckets = progressMap[tKey] ?? {
                newCount: g.items.length,
                dueCount: 0,
                futureCount: 0,
                byStep: {},
              };

              const segments = toSegments(buckets);
              const totalForTopic = segments.reduce((a, s) => a + s.count, 0);

              return (
                <TopicRow key={g.key} aria-label={`${g.title} progress`}>
                  <TopicHead>
                    <TopicIcon name={g.key} size={isMobile ? 16 : 18} />
                    <div>
                      <TopicTitle>{g.title}</TopicTitle>
                      <TopicMeta>Total: {totalForTopic}</TopicMeta>
                    </div>
                  </TopicHead>

                  <BarCol>
                    <ProgressBar
                      segments={segments}
                      total={totalForTopic}
                      height={isMobile ? 10 : 12}
                      rounded
                      showLegend={!isMobile}   // hide legend on small screens
                      compact
                      ariaLabel={`${g.title} progress bar`}
                    />
                  </BarCol>
                </TopicRow>
              );
            })}
          </TopicList>
        </CategoryCard>


          <Actions>
            <ActionBtn onClick={() => nav('/flashcards')} variant="primary">Study Vocabulary</ActionBtn>
            <ActionBtn disabled onClick={() => nav('/study')} variant="secondary">Study Grammar</ActionBtn>
          </Actions>
        </Content>
      </Panel>

      {/* Promo modal on Home (opens every time Home mounts) */}
      <PromoModal
        open={promoOpen}
        onClose={() => setPromoOpen(false)}
        title="New Quest Arrives Soon!"
        imgSrc={'/coming-soon.png'}   /* drop your image here */
        ctaText="Follow Dev Updates"
        ctaHref="https://example.com/your-x-or-discord"
      />
    </Screen>
  );
};
