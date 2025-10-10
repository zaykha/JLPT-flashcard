import React from 'react';
import styled from 'styled-components';

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
          {choice}
        </ChoiceButton>
      ))}
    </List>
  );
};

const List = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
  @media (min-width: 520px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ChoiceButton = styled.button<{ $selected: boolean }>`
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #374151;
  color: white;
  cursor: pointer;
  background: ${({ $selected }) =>
    $selected ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)'};
  &:hover {
    background: ${({ $selected }) =>
      $selected ? 'rgba(255,255,255,0.26)' : 'rgba(255,255,255,0.16)'};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
