// TODO: Single question renderer
import React, { useEffect, useState } from 'react';
import type { QuizQuestionModel } from '@/types/vocab';
import { Choice } from './Choice';

type Props = {
  question: QuizQuestionModel;
  index: number;
  total: number;
  onChoose: (choiceId: string) => void;
  onNext: () => void;
};

export const QuizQuestion: React.FC<Props> = ({ question, index, total, onChoose, onNext }) => {
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => { setPicked(null); }, [question.id]);

  const isEN2JP = question.kind === 'EN2JP';

  return (
    <div style={{ padding: 16, display:'grid', gap: '1rem', maxWidth: 560, margin:'0 auto' }}>
      <div style={{ fontSize:'.9rem', opacity:.7 }}>{index+1} / {total}</div>

      <div style={{ fontWeight:800, fontSize: isEN2JP ? '1.4rem' : '1.2rem', textAlign:'center' }}>
        {isEN2JP ? (
          <>What is the Japanese for “{question.promptEN}”?</>
        ) : (
          <>
            What is the meaning of&nbsp;
            <span style={{ display:'inline-grid', lineHeight:1 }}>
              <small style={{ fontSize:'.9rem', color:'#94a3b8', justifySelf:'center' }}>{question.promptJP?.hiragana}</small>
              <span style={{ fontSize:'1.6rem' }}>{question.promptJP?.kanji || question.promptJP?.hiragana}</span>
            </span>
            ?
          </>
        )}
      </div>

      <div style={{ display:'grid', gap:'.75rem' }}>
        {question.choices.map(ch => (
          <Choice
            key={ch.id}
            kind={question.kind}
            choice={ch}
            picked={picked}
            isCorrect={ch.id === question.correctId}
            onClick={() => {
              if (picked) return; // lock after first click
              setPicked(ch.id);
              onChoose(ch.id);
              // auto-advance after short delay
              setTimeout(() => onNext(), 650);
            }}
          />
        ))}
      </div>
    </div>
  );
};
