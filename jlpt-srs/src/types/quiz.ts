// src/types/quiz.ts

export type QuizType =
  | 'mcq'
  | 'matching'
  | 'kanjiToHiragana'
  | 'hiraganaToKanji';

/** Per-question timing override.
 * If omitted, fall back to QuizConfig.perQuestionSec.
 */
export type QuizTiming = {
  perQuestionSec?: number;
};

export type QuizItem =
  | ({
      id: string;
      type: 'mcq';
      prompt: string;
      choices: string[];
      correct: string;
      /** For analytics/snapshots; usually the vocab/grammar id behind this question. */
      sourceId: string;
    } & QuizTiming)
  | ({
      id: string;
      type: 'matching';
      /** Each pair may reference a distinct sourceId (e.g., each word). */
      pairs: Array<{ left: string; right: string; rightId: string; sourceId: string }>;
    } & QuizTiming)
  | ({
      id: string;
      type: 'kanjiToHiragana';
      prompt: string;
      choices: string[];
      correct: string;
      sourceId: string;
    } & QuizTiming)
  | ({
      id: string;
      type: 'hiraganaToKanji';
      prompt: string;
      choices: string[];
      correct: string;
      sourceId: string;
    } & QuizTiming)
  | ({
      id: string;
      type: 'enToKanji';
      prompt: string;
      choices: string[];
      correct: string;
      sourceId: string;
    } & QuizTiming);

export type QuizConfig = {
  types: QuizType[];       // enabled types
  perQuestionSec: number;  // default timer (used if item.perQuestionSec is undefined)
  size: number;            // how many questions
  maxSize?: number;
};

export type QuizResultItem = {
  id: string;
  correct: boolean;
  your?: string;
  expected?: string;
  /** elapsed time spent on this question (ms). */
  timeMs?: number;
  /** set true when the item auto-submitted due to timeout */
  fromTimeout?: boolean;
};