import React, { useState } from 'react';
import { Seo } from '@/components/seo/Seo';
import { Page, PageTitle, Section, FooterNav, Shell, Sidebar, TocList, Content } from '@/styles/Pages/Marketing/Shared';
import { Link } from 'react-router-dom';
import BackToMain from './BackToMain';

export const PrivacyPage: React.FC = () => {
  const [tab, setTab] = useState<'collect'|'use'|'storage'|'rights'>('collect');
  return (
    <Page>
      <Seo title="Privacy Policy – Kozakado" description="How Kozakado collects, uses, and stores your data, and how to contact us for privacy requests." />
      <Shell>
        <Sidebar>
          <BackToMain />
          <TocList aria-label="Contents">
            <button type="button" onClick={() => setTab('collect')} aria-pressed={tab==='collect'}>1. Information we collect</button>
            <button type="button" onClick={() => setTab('use')} aria-pressed={tab==='use'}>2. How we use it</button>
            <button type="button" onClick={() => setTab('storage')} aria-pressed={tab==='storage'}>3. Storage & processors</button>
            <button type="button" onClick={() => setTab('rights')} aria-pressed={tab==='rights'}>4. Your rights</button>
          </TocList>
        </Sidebar>
        <Content>
          <PageTitle>Privacy Policy</PageTitle>
          {tab === 'collect' && (
            <Section>
              <h2>Information we collect</h2>
              <p>Email address, study progress, and basic usage analytics.</p>
            </Section>
          )}
          {tab === 'use' && (
            <Section>
              <h2>How we use it</h2>
              <p>To personalize your learning plan, track progress, and communicate important updates.</p>
            </Section>
          )}
          {tab === 'storage' && (
            <Section>
              <h2>Storage & processors</h2>
              <p>We use Firebase (Auth/Firestore/Storage) and Stripe for payments.</p>
            </Section>
          )}
          {tab === 'rights' && (
            <Section>
              <h2>Your rights</h2>
              <p>Request deletion or export of your data at any time: <a href="mailto:support@kozakado.net">support@kozakado.net</a>.</p>
            </Section>
          )}
        </Content>
      </Shell>
      <FooterNav>
        <Link to="/terms">Terms</Link>
        <Link to="/refunds">Refunds</Link>
        <Link to="/commerce">Commerce Disclosure</Link>
        <Link to="/contact">Contact</Link>
      </FooterNav>
    </Page>
  );
};

export default PrivacyPage;
