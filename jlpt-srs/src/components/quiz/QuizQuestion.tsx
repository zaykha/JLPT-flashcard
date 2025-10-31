import React, { useMemo } from 'react';
import styled from 'styled-components';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Choices } from './Choices';
import type { QuizItem } from '@/types/quiz';
import { QuestionArea } from '@/styles/Pages/QuizPage.styles';

type MatchingRight = { id: string; text: string };

type Props = {
  question: QuizItem;
  answer: string | null;
  onAnswer: (value: string) => void;
  rightsOrder: MatchingRight[];
  setRightsOrder: React.Dispatch<React.SetStateAction<MatchingRight[]>>;
  disabled?: boolean;
};

export const QuizQuestion: React.FC<Props> = ({
  question,
  answer,
  onAnswer,
  rightsOrder,
  setRightsOrder,
  disabled = false,
}) => {
  // ✅ RIGHT — hooks at top level
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  useSensor(TouchSensor,   { activationConstraint: { delay: 120, tolerance: 8 } }),
  useSensor(KeyboardSensor),
);


  const prompt = question.type === 'matching'
    ? 'Match the pairs'
    : question.prompt;

  const showChoices = question.type === 'mcq' || question.type === 'kanjiToHiragana' || question.type === 'hiraganaToKanji';

  const leftPairs = useMemo(() => {
    if (question.type !== 'matching') return [];
    return question.pairs.map(p => ({ id: p.sourceId, text: p.left }));
  }, [question]);

  return (
    <div>
      <Prompt>{prompt}</Prompt>
      <QuestionArea>
      {showChoices && 'choices' in question && (
              <Choices
                choices={question.choices}
                answer={answer}
                onSelect={onAnswer}
                disabled={disabled}
              />
            )}
      </QuestionArea>
      

      {question.type === 'matching' && (
        <DnDWrap>
          <Column>
            {leftPairs.map(pair => (
              <LeftBox key={pair.id}>{pair.text}</LeftBox>
            ))}
          </Column>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event: DragEndEvent) => {
              if (disabled) return;
              const { active, over } = event;
              if (!over || active.id === over.id) return;

              setRightsOrder(prev => {
                const oldIndex = prev.findIndex(item => item.id === String(active.id));
                const newIndex = prev.findIndex(item => item.id === String(over.id));
                if (oldIndex === -1 || newIndex === -1) return prev;
                return arrayMove(prev, oldIndex, newIndex);
              });
            }}
          >
            <SortableContext
              items={rightsOrder.map(r => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <Column>
                {rightsOrder.map(row => (
                  <SortableRightRow key={row.id} id={row.id} text={row.text} />
                ))}
              </Column>
            </SortableContext>
          </DndContext>
        </DnDWrap>
      )}
    </div>
  );
};


const SortableRightRow: React.FC<{ id: string; text: string }> = ({ id, text }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <RightBox
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-dragging={isDragging ? '1' : '0'}
    >
      {text}
    </RightBox>
  );
};
// clamp(1rem, 3vw, 1.3rem)
const Prompt = styled.h2`
  font-size: 1rem;
  margin: 5px 0 10px;
  line-height: 1.3;
  text-align: center;

  @media (max-width: 480px) {
    font-size: clamp(0.9rem, 4vw, 1rem);
  }
`;

const Column = styled.div`
  display: grid;
  gap: 8px;
`;
const MATCH_ROW_H = '56px'; // slightly shorter for mobile
const MatchingBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${MATCH_ROW_H};
  padding: 10px;
  border: 1px solid #444;
  border-radius: 10px;
  text-align: center;
  font-size: clamp(0.85rem, 2.8vw, 1rem);
  background: rgba(255,255,255,0.9);
  color: #0b0f14;
  box-shadow: 0 2px 0 rgba(0,0,0,0.5);
  word-break: break-word;
  overflow-wrap: anywhere;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 8px;
    min-height: 48px;
  }
`;

export const LeftBox = styled(MatchingBox)``;
export const RightBox = styled(MatchingBox)`
  background: rgba(12,21,33,0.92);
  color: #f1f5f9;
  border-color: #000;

  &[data-dragging="1"] {
    opacity: 0.85;
    box-shadow: 0 6px 18px rgba(0,0,0,0.35);
  }
`;

const DnDWrap = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr 1fr;
  text-align: left;
  align-items: start;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;