import React from 'react';
import styled, { css } from 'styled-components';
import { Btn } from '@/styles/Pages/FlashCardPage.styles';

type Props = {
  choices: string[];
  answer: string | null;
  onSelect: (value: string) => void;
  disabled?: boolean;
};

export const Choices: React.FC<Props> = ({ choices, answer, onSelect, disabled }) => {
  return (
    <List>
      {choices.map(choice => (
        <ChoiceButton
          key={choice}
          type="button"
          $selected={answer === choice}
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            onSelect(choice);
          }}
        >
          <ChoiceText>{choice}</ChoiceText>
        </ChoiceButton>
      ))}
    </List>
  );
};

const List = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
  @media (min-width: 520px) {
    grid-template-columns: 1fr 1fr;
  }
`;

// Reuse the Flashcard Btn design; primary when selected, secondary otherwise
const ChoiceButton = styled(Btn).attrs<{ $selected: boolean }>(p => ({
  $variant: p.$selected ? 'primary' : 'secondary',
}))<{$selected: boolean}>`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 14px 16px;
  min-height: 56px;
  @media (min-width: 520px) { min-height: 64px; }

  /* Do not uppercase choice labels */
  text-transform: none;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Override selected color to Sakura */
  ${({ $selected, theme }) => $selected && css`
    background: ${theme.colors.sakura};
    color: black;
  `}
`;

// Unified font styling for consistent look across EN/JP
const ChoiceText = styled.span`
  // display: inline-block;
  // width: 100%;
  // line-height: 1.25;
  // word-break: break-word;
  // white-space: normal;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 1rem;
  // font-size: clamp(16px, 4vw, 18px);
  text-transform: none;
`;

// Basic CJK detector (Hiragana, Katakana, CJK Unified Ideographs)
const HAS_CJK = /[\u3040-\u30FF\u3400-\u9FFF]/;
