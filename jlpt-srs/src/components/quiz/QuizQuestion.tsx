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
import type { QuizItem } from '@/store/session';
import { Choices } from './Choices';

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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
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

      {showChoices && 'choices' in question && (
        <Choices
          choices={question.choices}
          answer={answer}
          onSelect={onAnswer}
          disabled={disabled}
        />
      )}

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
const Prompt = styled.h2`
  font-size: 1.3rem;
  margin: 10px 0 14px;
  line-height: 1.3;
`;

const DnDWrap = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
  text-align: left;
  align-items: start; /* or stretch */
  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  display: grid;
  gap: 8px;
`;
const MATCH_ROW_H = '64px'; // tweak: 56|64|72

const MatchingBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${MATCH_ROW_H};
  padding: 12px;
  border: 1px solid #444;
  border-radius: 10px;
  text-align: center;
  font-size: 1.05rem;
  background: rgba(255,255,255,0.9);
  color: #0b0f14;
  box-shadow: 0 2px 0 rgba(0,0,0,0.5);

  /* better wrapping */
  word-break: break-word;
  overflow-wrap: anywhere;
`;

export const LeftBox = styled(MatchingBox)``;
export const RightBox = styled(MatchingBox)`
  background: rgba(12,21,33,0.92);
  color: #f1f5f9;
  border-color: #000;

  /* nice feedback while dragging */
  &[data-dragging="1"] {
    opacity: 0.85;
    box-shadow: 0 6px 18px rgba(0,0,0,0.35);
  }
`;