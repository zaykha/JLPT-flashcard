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
  return (
    <Card $highlight={highlight}>
      {product.bonus ? <Bonus>+{product.bonus} bonus</Bonus> : null}
      <Shards>
        <span role="img" aria-label="glyph shards">💠</span>
        <strong>{product.shards.toLocaleString('ja-JP')}</strong>
      </Shards>
      <Price>{formatter.format(product.amount)}</Price>
      {highlight ? <Badge>Best Value</Badge> : null}
      <SelectButton type="button" onClick={() => onSelect(product)}>
        Choose
      </SelectButton>
    </Card>
  );
};

const Card = styled.div<{ $highlight?: boolean }>`
  position: relative;
  border: 2px solid ${({ $highlight }) => ($highlight ? '#8B6B3F' : 'rgba(0,0,0,0.12)')};
  border-radius: 16px;
  background:
    linear-gradient(145deg, rgba(139,107,63,0.12), rgba(111,126,79,0.08)),
    #fff;
  padding: 16px;
  display: grid;
  gap: 10px;
  text-align: center;
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
  strong { font-family: ${({ theme }) => theme.fonts.heading}; font-size: 1.6rem; }
`;

const Price = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
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
