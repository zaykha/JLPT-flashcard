import React, { useState } from 'react';
import { Seo } from '@/components/seo/Seo';
import { Page, PageTitle, Section, FooterNav, Shell, Sidebar, TocList, Content } from '@/styles/Pages/Marketing/Shared';
import { Link } from 'react-router-dom';
import BackToMain from './BackToMain';

export const RefundsPage: React.FC = () => {
  const [tab, setTab] = useState<'shards'|'premium'|'support'>('shards');
  return (
    <Page>
      <Seo title="Refunds & Cancellations – Kozakado" description="Refund policy for Shards and Premium. Contact support within 14 days for duplicate charges or access issues." />
      <Shell>
        <Sidebar>
          <BackToMain />
          <TocList aria-label="Contents">
            <button type="button" onClick={() => setTab('shards')} aria-pressed={tab==='shards'}>1. Shards</button>
            <button type="button" onClick={() => setTab('premium')} aria-pressed={tab==='premium'}>2. Premium</button>
            <button type="button" onClick={() => setTab('support')} aria-pressed={tab==='support'}>3. Support window</button>
          </TocList>
        </Sidebar>
        <Content>
          <PageTitle>Refunds & Cancellations</PageTitle>
          {tab==='shards' && (
            <Section>
              <h2>Shards</h2>
              <p>Digital Shards are non‑returnable.</p>
            </Section>
          )}
          {tab==='premium' && (
            <Section>
              <h2>Premium</h2>
              <p>Premium can be canceled anytime. Access remains until the end of the paid period.</p>
            </Section>
          )}
          {tab==='support' && (
            <Section>
              <h2>Support window</h2>
              <p>If you encounter a duplicate charge or access failure, contact us within 14 days at support@kozakado.net.</p>
            </Section>
          )}
        </Content>
      </Shell>
      <FooterNav>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/commerce">Commerce Disclosure</Link>
        <Link to="/contact">Contact</Link>
      </FooterNav>
    </Page>
  );
};

export default RefundsPage;
