import React, { useState } from 'react';
import { Seo } from '@/components/seo/Seo';
import { Page, PageTitle, Section, FooterNav, Shell, Sidebar, TocList, Content, BackRow } from '@/styles/Pages/Marketing/Shared';
import { Link } from 'react-router-dom';
import BackToMain from './BackToMain';

export const TermsPage: React.FC = () => {
  const [tab, setTab] = useState<'use'|'payment'|'ip'|'prohibited'|'liability'>('use');
  return (
    <Page>
      <Seo title="Terms of Service – Kozakado" description="Terms for using Kozakado. Payment terms, intellectual property, prohibited behavior, and liability." />
      <Shell>
        <Sidebar>
          <BackToMain />
          <TocList aria-label="Contents">
            <button type="button" onClick={() => setTab('use')} aria-pressed={tab==='use'}>1. Use of Service</button>
            <button type="button" onClick={() => setTab('payment')} aria-pressed={tab==='payment'}>2. Payment Terms</button>
            <button type="button" onClick={() => setTab('ip')} aria-pressed={tab==='ip'}>3. Intellectual Property</button>
            <button type="button" onClick={() => setTab('prohibited')} aria-pressed={tab==='prohibited'}>4. Prohibited Behavior</button>
            <button type="button" onClick={() => setTab('liability')} aria-pressed={tab==='liability'}>5. Disclaimer & Liability</button>
          </TocList>
        </Sidebar>
        <Content>
          <BackRow>
            <PageTitle>Terms of Service</PageTitle>
          </BackRow>
          {tab==='use' && (
            <Section>
              <h2>Use of Service</h2>
              <p>For educational, personal use. Do not misuse or disrupt the service.</p>
            </Section>
          )}
          {tab==='payment' && (
            <Section>
              <h2>Payment Terms</h2>
              <p>Charges are captured immediately at checkout. Prices include applicable taxes where required.</p>
            </Section>
          )}
          {tab==='ip' && (
            <Section>
              <h2>Intellectual Property</h2>
              <p>Kozakado retains rights to the app, content, and branding.</p>
            </Section>
          )}
          {tab==='prohibited' && (
            <Section>
              <h2>Prohibited Behavior</h2>
              <p>Abuse, resale, scraping, or reverse‑engineering is prohibited.</p>
            </Section>
          )}
          {tab==='liability' && (
            <Section>
              <h2>Disclaimer & Liability</h2>
              <p>Provided “as is” without warranty. Liability is limited to the maximum extent permitted by law.</p>
            </Section>
          )}
        </Content>
      </Shell>
      <FooterNav>
        <Link to="/privacy">Privacy</Link>
        <Link to="/refunds">Refunds</Link>
        <Link to="/commerce">Commerce Disclosure</Link>
        <Link to="/contact">Contact</Link>
      </FooterNav>
    </Page>
  );
};

export default TermsPage;
