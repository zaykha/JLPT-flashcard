import React from 'react';
import styled from 'styled-components';
import type { Product } from '@/lib/api/types';

const formatter = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });

type Props = {
  product: Product;
  onSelect: (product: Product) => void;
  highlight?: boolean;
};

export const ProductCard: React.FC<Props> = ({ product, onSelect, highlight }) => {
  const price = Number.isFinite(Number((product as any).amount)) ? Number((product as any).amount) : 0;
  return (
    <Card $highlight={highlight}>
      {product.bonus ? <Bonus>+{product.bonus} bonus</Bonus> : null}
      <Shards>
        <span role="img" aria-label="glyph shards">💠</span>
        <strong>{product.shards.toLocaleString('ja-JP')}</strong>
      </Shards>
      <Price>{formatter.format(price)}</Price>
      {highlight ? <Badge>Best Value</Badge> : null}
      <SelectButton type="button" onClick={() => onSelect(product)}>
        Choose
      </SelectButton>
    </Card>
  );
};

const Card = styled.div<{ $highlight?: boolean }>`
  position: relative;
  border: 2px solid ${({ theme, $highlight }) => ($highlight ? theme.colors.primary : theme.colors.pixelBorder)};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.panel};
  padding: 16px;
  display: grid;
  gap: 10px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  box-shadow: ${({ $highlight }) => ($highlight ? '0 12px 28px rgba(139,107,63,0.25)' : 'none')};
`;

const Bonus = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(111,126,79,0.9);
  color: #fff;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Badge = styled(Bonus)`
  position: static;
  width: fit-content;
  margin: 0 auto;
  background: rgba(139,107,63,0.9);
`;

const Shards = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  span { font-size: 20px; }
  strong { font-family: ${({ theme }) => theme.fonts.heading}; font-size: 1.2rem; }
`;

const Price = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const SelectButton = styled.button`
  margin-top: 4px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 2px solid #000;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-family: ${({ theme }) => theme.fonts.heading};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: transform .1s ease;
  &:hover { transform: translateY(-1px); }
`;
