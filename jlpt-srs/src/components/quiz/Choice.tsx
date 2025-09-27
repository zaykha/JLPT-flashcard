// TODO: JP choice (kana over kanji) & EN choice
import React from 'react';
import styled from 'styled-components';
import type { QuizKind } from '@/types/vocab';

const Btn = styled.button<{state:'idle'|'right'|'wrong'}>`
  width:100%;
  text-align:left;
  border:1px solid var(--border);
  background: ${({state}) => state === 'idle' ? 'var(--panel)' : state === 'right' ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)'};
  padding:.75rem .9rem;
  border-radius:12px;
  display:grid; gap:.25rem;
  cursor:pointer;
  &:hover { border-color: var(--accent); }
`;

type ChoiceModel = {
  id: string;
  en: string;
  kanji: string;
  hiragana: string;
};

type Props = {
  kind: QuizKind;
  choice: ChoiceModel;
  picked: string | null;
  isCorrect: boolean;
  onClick: () => void;
};

export const Choice: React.FC<Props> = ({ kind, choice, picked, isCorrect, onClick }) => {
  const state: 'idle'|'right'|'wrong' =
    picked ? (isCorrect ? 'right' : (picked === choice.id ? 'wrong' : 'idle')) : 'idle';

  if (kind === 'EN2JP') {
    // show kana over kanji
    return (
      <Btn state={state} onClick={onClick}>
        <span style={{ display:'inline-grid', lineHeight:1 }}>
          <small style={{ fontSize:'.9rem', color:'#94a3b8', justifySelf:'start' }}>
            {choice.hiragana || '—'}
          </small>
          <span style={{ fontSize:'1.25rem', fontWeight:700 }}>
            {choice.kanji || choice.hiragana}
          </span>
        </span>
      </Btn>
    );
  }

  // JP2EN → show English
  return (
    <Btn state={state} onClick={onClick}>
      <span style={{ fontSize:'1.05rem', fontWeight:700 }}>{choice.en}</span>
    </Btn>
  );
};
