import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
export function publicUrl(p: string) {
  // Vite or CRA base handling
  // @ts-ignore
  const viteBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '';
  // @ts-ignore
  const craBase = (typeof process !== 'undefined' && process.env && process.env.PUBLIC_URL) || '';
  const base = viteBase || craBase || '/';
  const join = (a: string, b: string) => (a.endsWith('/') ? a.slice(0, -1) : a) + '/' + (b.startsWith('/') ? b.slice(1) : b);
  return join(base, p);
}

type FeatureRow = { file: string };

export function AvatarPickerResponsive(props: {
  value?: string;
  onChange: (file: string) => void;
  files?: string[];
  onCancel?: () => void;     // kept for compatibility (ignored)
  onSave?: (file: string) => void; // kept for compatibility (ignored)
}) {
  const [all, setAll] = useState<string[]>(props.files ?? []);
  const [sel, setSel] = useState<string>(props.value ?? '');

  useEffect(() => {
    if (props.files?.length) return;
    (async () => {
      const res = await fetch(publicUrl('avatars/features.json'), { cache: 'no-store' });
      const arr: FeatureRow[] = await res.json();
      const files = arr.map(r => r.file).sort();
      setAll(files);
      if (!sel && files.length) setSel(files[0]);
    })().catch(e => console.error('[AvatarPicker] load failed', e));
  }, [props.files]); // eslint-disable-line

  useEffect(() => { if (sel) props.onChange(sel); }, [sel]); // eslint-disable-line

  const thumbs = useMemo(() => all, [all]);

  return (
    <Wrap>
      <Header>
        <Preview>{sel && <img src={publicUrl(`avatars/${sel}`)} alt="Selected avatar" />}</Preview>
        <HeaderMeta>
          <Title>Choose your avatar</Title>
          <Hint>Tap one below. You can change it anytime.</Hint>
        </HeaderMeta>
      </Header>

      <Picker role="listbox" aria-label="Avatar choices">
        {thumbs.map((f) => (
          <Item
            key={f}
            $active={sel === f}
            onClick={() => setSel(f)}
            aria-selected={sel === f}
            title={f.replace('.svg', '')}
          >
            <div className="ring">
              <img src={publicUrl(`avatars/${f}`)} alt={f} loading="lazy" />
            </div>
          </Item>
        ))}
      </Picker>
      {/* Save/Cancel removed by request */}
    </Wrap>
  );
}
/* ---------------- styles (replace) ---------------- */

const Wrap = styled.div`
  display: grid;
  gap: 16px;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 12px;
  align-items: center;

  @media (max-width: 600px) {
    grid-template-columns: 64px 1fr;
    gap: 10px;
  }
`;

const Preview = styled.div`
  width: 88px; height: 88px;
  border-radius: 999px;
  background: #0f172a0d;
  border: 2px solid rgba(0,0,0,.08);
  display: grid; place-items: center; overflow: hidden;
  img { width: 100%; height: 100%; object-fit: cover; }

  @media (max-width: 600px) { width: 64px; height: 64px; }
`;

const HeaderMeta = styled.div``;

const Title = styled.h3`
  margin: 0 0 6px;
  font-size: clamp(14px, 2.6vw, 16px);
  color: ${({ theme }) => theme.colors?.text || '#0f172a'};
`;

const Hint = styled.p`
  margin: 0;
  font-size: clamp(11px, 2.1vw, 12px);
  color: ${({ theme }) => theme.colors?.textMuted || '#64748b'};
`;

/**
 * Desktop (>=900px):
 *  - Horizontal scroller with exactly 2 rows
 *  - Fixed column width via --cell so spacing stays perfect
 *  - Visible horizontal scrollbar
 * Mobile:
 *  - Normal grid but with fixed block height, so only this block scrolls
 */

const Picker = styled.div`
  --cell: 84px;   /* avatar circle size */
  --gap: 14px;    /* space between chips */

  /* MOBILE (default): vertical scroll only inside this block */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: var(--gap);
  max-height: calc(3 * 72px + 2 * var(--gap));
  overflow-y: auto;
  overflow-x: hidden;
  padding: 6px 4px;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 #e2e8f0;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 8px; }
  &::-webkit-scrollbar-track { background: #e2e8f0; }

  @media (min-width: 900px) {
    /* DESKTOP: exactly TWO ROWS, horizontal scroll */
    display: flex;
    flex-flow: column wrap;              /* fill top→bottom, then new column */
    align-content: flex-start;           /* columns pack from the left */
    gap: var(--gap);
    height: calc(2 * var(--cell) + var(--gap));  /* 2 rows tall */
    min-height: calc(2 * var(--cell) + var(--gap)); /* enforce 2 rows */
    overflow-x: auto;
    overflow-y: hidden;

    /* only horizontal padding to avoid height math issues */
    padding: 0 8px 10px 8px;
    box-sizing: content-box;
    scrollbar-gutter: stable both-edges;

    /* horizontal scrollbar */
    scrollbar-width: thin;
    scrollbar-color: #94a3b8 #e2e8f0;
    &::-webkit-scrollbar {
      height: 10px;
      background: #e2e8f0;
      border-radius: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
    }
    &::-webkit-scrollbar-thumb:hover { background: #64748b; }
  }
`;


const Item = styled.button.attrs({ type: 'button' })<{ $active?: boolean }>`
  appearance: none;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;

  /* LOCK the chip size so borders never push neighbors */
  inline-size: var(--cell);
  block-size: var(--cell);
  min-inline-size: var(--cell);
  min-block-size: var(--cell);
  flex: 0 0 var(--cell);  /* for desktop flex layout */

  .ring {
    width: 100%;
    height: 100%;
    border-radius: 999px;
    display: grid; place-items: center; overflow: hidden;
    border: 3px solid ${({ $active }) => ($active ? '#22c55e' : 'rgba(0,0,0,.12)')};
    box-sizing: border-box;
    box-shadow: ${({ $active }) => ($active ? '0 0 0 6px rgba(34,197,94,.18)' : 'none')};
    transition: border-color 120ms ease, box-shadow 120ms ease;
    background: #ffffff;
    contain: layout paint; /* micro-optimization */
  }

  img { display: block; width: 100%; height: 100%; object-fit: cover; }

  &:hover .ring {
    border-color: ${({ $active }) => ($active ? '#16a34a' : 'rgba(0,0,0,.24)')};
  }
`;
