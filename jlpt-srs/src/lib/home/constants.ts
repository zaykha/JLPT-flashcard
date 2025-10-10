export const LOCAL_LESSON_KEY = 'jlpt.currentLesson';

export const DEFAULT_SCROLLS = [
  {
    id: 'dedication',
    title: 'Scroll of Dedication',
    unlocked: false,
    description: 'Maintain a 7-day streak to unroll this scroll.',
  },
  {
    id: 'wisdom',
    title: 'Scroll of Wisdom',
    unlocked: false,
    description: 'Master 100 words to earn this honor.',
  },
  {
    id: 'silence',
    title: 'Scroll of Silence',
    unlocked: false,
    description: 'Score perfect marks in 5 quizzes in a row.',
  },
] as const;
