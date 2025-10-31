import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

export const PrerequisitePage: React.FC = () => {
  const nav = useNavigate();
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    try { setAgree(localStorage.getItem('koza.prereq.ok') === '1'); } catch {}
  }, []);

  function continueToLogin() {
    try { localStorage.setItem('koza.prereq.ok', '1'); } catch {}
    nav('/login');
  }

  return (
    <Wrap>
      <Card role="dialog" aria-labelledby="prereq-title" aria-describedby="prereq-desc">
        <Header>
          <Title id="prereq-title">Before You Start</Title>
          <Subtitle id="prereq-desc">A quick note about how to use this app</Subtitle>
        </Header>

        <Body>
          <P>
            This app is designed to complement your JLPT study routine — not replace it.
            Think of it as a playful, on‑the‑go trainer you can use during short breaks,
            on the train, or whenever you have a spare moment.
          </P>
          <List>
            <li>Use multiple sources: textbooks, graded readers, videos, real exercises.</li>
            <li>We focus on quick practice, spaced review, and keeping momentum.</li>
            <li>Daily “study → exam → review” flow is lightweight and repeatable.</li>
          </List>
          <P>
            If you rely on multiple inputs and keep sessions short and frequent,
            you will get the most out of this app.
          </P>

          <AgreeRow>
            <input
              id="agree"
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label htmlFor="agree">I understand and will use this app responsibly.</label>
          </AgreeRow>

          <Actions>
            <Btn disabled={!agree} onClick={continueToLogin} aria-disabled={!agree}>
              Continue to login →
            </Btn>
          </Actions>
        </Body>
      </Card>
    </Wrap>
  );
};

const Wrap = styled.section`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px 16px;
  background: ${({ theme }) => theme.colors.bg};
`;
const Card = styled.div`
  width: min(720px, 94vw);
  border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.panel};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: ${({ theme }) => theme.shadow.card};
  display: grid;
  gap: 12px;
  padding: clamp(16px, 3vw, 24px);
  position: relative;
  z-index: 1; /* ensure over any global background layer */
`;
const Header = styled.header`display: grid; gap: 6px;`;
const Title = styled.h1`
  margin: 0; font-size: clamp(1.1rem, 4vw, 1.6rem);
  font-family: ${({ theme }) => theme.fonts.heading};
`;
const Subtitle = styled.p`
  margin: 0; opacity: .85; font-size: clamp(.85rem, 2.4vw, .95rem);
`;
const Body = styled.div`display: grid; gap: 10px;`;
const P = styled.p`margin: 0; line-height: 1.5; font-size: clamp(.9rem, 2.6vw, 1rem);`;
const List = styled.ul`
  margin: 0; padding-left: 1.1rem; line-height: 1.5;
  li { margin: .25rem 0; font-size: clamp(.9rem, 2.6vw, 1rem); }
`;
const AgreeRow = styled.div`
  margin-top: 6px;
  display: grid; grid-auto-flow: column; gap: 8px; align-items: center; justify-content: start;
  label { font-size: .9rem; }
`;
const Actions = styled.div` display: flex; justify-content: flex-end; margin-top: 6px; `;
const Btn = styled.button`
  padding: 12px 16px; border-radius: 12px; border: 2px solid ${({ theme }) => theme.colors.pixelBorder};
  background: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.onPrimary};
  font-family: ${({ theme }) => theme.fonts.heading}; text-transform: uppercase; letter-spacing: .06em;
  cursor: pointer; opacity: ${({ disabled }) => (disabled ? .6 : 1)};
`;

export default PrerequisitePage;
