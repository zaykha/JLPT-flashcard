import React, { useState } from 'react';
import { Seo } from '@/components/seo/Seo';
import { Page, PageTitle, Section, Table, FooterNav, Shell, Sidebar, TocList, Content } from '@/styles/Pages/Marketing/Shared';
import { Link } from 'react-router-dom';
import BackToMain from './BackToMain';

export const CommercePage: React.FC = () => {
  const [tab, setTab] = useState<'jp'|'en'>('jp');
  return (
    <Page>
      <Seo title="特定商取引法に基づく表記 – Kozakado" description="Commerce disclosure for Kozakado (特定商取引法). Seller, contact, price, payment timing, delivery, returns, environment." />
      <Shell>
        <Sidebar>
          <BackToMain />
          <TocList aria-label="Contents">
            <button type="button" onClick={() => setTab('jp')} aria-pressed={tab==='jp'}>1. 日本語</button>
            <button type="button" onClick={() => setTab('en')} aria-pressed={tab==='en'}>2. English</button>
          </TocList>
        </Sidebar>
        <Content>
          <PageTitle>特定商取引法に基づく表記 / Commerce Disclosure</PageTitle>
          {tab==='jp' && (
            <Section>
              <Table>
              <tbody>
            <tr><th>販売事業者名（屋号）</th><td>コザカド (Kozakado)</td></tr>
            <tr><th>運営責任者</th><td>モエ・ゼイ・カ (Moe Zay Kha)</td></tr>
            <tr><th>所在地</th><td>大分県別府市中須賀本町1048-1 パレドール別府501号</td></tr>
            <tr><th>連絡先</th><td>support@kozakado.net</td></tr>
            <tr><th>販売価格</th><td>各商品ページに税込価格で表示</td></tr>
            <tr><th>支払方法／支払時期</th><td>クレジットカード（Stripe）／購入時に即時決済</td></tr>
            <tr><th>引き渡し時期</th><td>決済完了後すぐにアプリ内利用可能</td></tr>
            <tr><th>返品・キャンセル</th><td>デジタル商品のため原則返品不可。重複課金時は14日以内に連絡。</td></tr>
            <tr><th>動作環境</th><td>最新のChrome／Safari／Edge</td></tr>
          </tbody>
              </Table>
            </Section>
          )}
          {tab==='en' && (
            <Section>
              <Table>
              <tbody>
            <tr><th>Seller</th><td>Kozakado</td></tr>
            <tr><th>Responsible person</th><td>Moe Zay Kha</td></tr>
            <tr><th>Address</th><td>1048-1 Paledor Beppu #501, Nakasuga-honmachi, Beppu, Oita, Japan</td></tr>
            <tr><th>Contact</th><td>support@kozakado.net</td></tr>
            <tr><th>Price</th><td>Displayed tax‑inclusive on each product page</td></tr>
            <tr><th>Payment method/timing</th><td>Credit card (Stripe) / charged at purchase</td></tr>
            <tr><th>Delivery</th><td>Available immediately in‑app after payment</td></tr>
            <tr><th>Returns/Cancellation</th><td>Digital items non‑returnable. Duplicate charges: contact within 14 days.</td></tr>
            <tr><th>Environment</th><td>Latest Chrome/Safari/Edge</td></tr>
          </tbody>
              </Table>
            </Section>
          )}
        </Content>
      </Shell>
      <FooterNav>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/refunds">Refunds</Link>
        <Link to="/contact">Contact</Link>
      </FooterNav>
    </Page>
  );
};

export default CommercePage;
