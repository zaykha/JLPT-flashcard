import React, { useState } from 'react';
import { Seo } from '@/components/seo/Seo';
import { Page, PageTitle, Section, Shots, Shot, FooterNav, Shell, Sidebar, TocList, Content } from '@/styles/Pages/Marketing/Shared';
import { Link } from 'react-router-dom';
import BackToMain from './BackToMain';

export const AboutPage: React.FC = () => {
  const [tab, setTab] = useState<'mission'|'features'|'shots'>('mission');
  return (
    <Page>
      <Seo title="About Kozakado" description="Kozakado helps you study Japanese with interactive grammar cards, SRS, quests, and beautiful cultural themes." />
      <Shell>
        <Sidebar>
          <BackToMain />
          <TocList aria-label="Contents">
            <button type="button" onClick={() => setTab('mission')} aria-pressed={tab==='mission'}>1. Mission</button>
            <button type="button" onClick={() => setTab('features')} aria-pressed={tab==='features'}>2. Highlights</button>
            <button type="button" onClick={() => setTab('shots')} aria-pressed={tab==='shots'}>3. Screenshots</button>
          </TocList>
        </Sidebar>
        <Content>
          <PageTitle>About Kozakado</PageTitle>
          {tab==='mission' && (
            <Section>
              <h2>Our Mission</h2>
              <p>
                Kozakado is a calm learning space for Japanese. We blend spaced repetition, interactive
                grammar, and bite‑sized sessions so you can make steady progress every day.
              </p>
            </Section>
          )}
          {tab==='features' && (
            <Section>
              <h2>Highlights</h2>
              <ul>
                <li>Interactive grammar cards</li>
                <li>Spaced Repetition (SRS) for vocab</li>
                <li>Daily quests and gentle streaks</li>
                <li>Immersive cultural themes</li>
              </ul>
            </Section>
          )}
          {tab==='shots' && (
            <Section>
              <h2>Screenshots</h2>
              <Shots>
                <Shot aria-label="Screenshot placeholder" />
                <Shot aria-label="Screenshot placeholder" />
                <Shot aria-label="Screenshot placeholder" />
              </Shots>
            </Section>
          )}
        </Content>
      </Shell>
      <FooterNav aria-label="Footer navigation">
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/refunds">Refunds</Link>
        <Link to="/commerce">Commerce Disclosure</Link>
        <Link to="/contact">Contact</Link>
      </FooterNav>
    </Page>
  );
};

export default AboutPage;
