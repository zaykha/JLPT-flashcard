import React, { useState } from 'react';
import { Seo } from '@/components/seo/Seo';
import { Page, PageTitle, Section, FooterNav, Shell, Sidebar, TocList, Content } from '@/styles/Pages/Marketing/Shared';
import { Link } from 'react-router-dom';
import BackToMain from './BackToMain';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<'info'|'form'>('info');
  const emailOk = /.+@.+\..+/.test(email.trim());
  const canSubmit = name.trim().length >= 2 && emailOk && message.trim().length >= 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // no backend yet
    alert('Thanks! This demo form does not submit yet.');
  };

  return (
    <Page>
      <Seo title="Contact Us – Kozakado" description="Questions about billing, support, or feedback? Reach out to us at support@kozakado.net." />
      <Shell>
        <Sidebar>
          <BackToMain />
          <TocList aria-label="Contents">
            <button type="button" onClick={() => setTab('info')} aria-pressed={tab==='info'}>1. Contact</button>
            <button type="button" onClick={() => setTab('form')} aria-pressed={tab==='form'}>2. Message form</button>
          </TocList>
        </Sidebar>
        <Content>
          <PageTitle>Contact Us</PageTitle>
          {tab==='info' && (
            <Section>
              <p>
                For support or billing inquiries, email <a href="mailto:support@kozakado.net">support@kozakado.net</a>.
                Optional address: Oita, Beppu, Japan.
              </p>
            </Section>
          )}
          {tab==='form' && (
            <Section as="form" onSubmit={handleSubmit} aria-label="Contact form">
              <h2>Send a message</h2>
              <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
                <label>
                  <div>Name</div>
                  <input value={name} onChange={e => setName(e.target.value)} required minLength={2} />
                </label>
                <label>
                  <div>Email</div>
                  <input value={email} onChange={e => setEmail(e.target.value)} required type="email" />
                </label>
                <label>
                  <div>Message</div>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} required />
                </label>
                <div>
                  <button type="submit" disabled={!canSubmit}>Send</button>
                </div>
              </div>
            </Section>
          )}
        </Content>
      </Shell>
      <FooterNav>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/refunds">Refunds</Link>
        <Link to="/commerce">Commerce Disclosure</Link>
        <Link to="/about">About</Link>
      </FooterNav>
    </Page>
  );
};

export default ContactPage;
