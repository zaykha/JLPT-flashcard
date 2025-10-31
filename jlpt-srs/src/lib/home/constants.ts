export const LOCAL_LESSON_KEY = 'jlpt.currentLesson'; // legacy (kept for compatibility)
export const LOCAL_LESSON_NO  = 'jlpt.currentLessonNo';   // number as string
export const LOCAL_LESSON_DAY = 'jlpt.currentLessonDay';  // YYYY-MM-DD

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
  }
] as const;
