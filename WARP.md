# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Context

JLPT Flashcard is a React + TypeScript + Vite application for studying Japanese vocabulary and grammar using a spaced-repetition system (SRS). The app uses Firebase for authentication and Firestore for data persistence.

## Common Commands

All commands should be run from the `jlpt-srs/` directory.

### Development
```bash
npm run dev                    # Start development server (port 5173)
```

### Testing
```bash
npm test                       # Run all tests once (Vitest)
npm run test:watch            # Run tests in watch mode
```

### Linting & Building
```bash
npm run lint                   # Lint all files with ESLint
npm run build                  # Type-check and build for production
npm run preview                # Preview production build locally
```

### Code Analysis
```bash
npm run analyze:unused         # Analyze unused exports
npm run analyze:unused:move    # Move unused exports to archive
npm run tools:build            # Build analysis tools
npm run tools:run              # Run project analysis (outputs cleanup-report.json)
npm run tools:dev              # Run analysis tools in dev mode
```

## Architecture Overview

### State Management
- **Zustand stores** manage global state:
  - `store/auth.ts`: Firebase authentication state
  - `store/session.ts`: Study session state (vocab flashcards, quiz flow, grammar study)
  - `store/topics.ts`: Topic management
  - `store/walletStore.ts`: User wallet and transactions
  - `store/themeMode.ts`: Theme preferences
  - `store/slices/srsSlice.ts`: SRS-specific state

### Data Flow Architecture

#### Bootstrap Pattern
- **Bootstrap bundle** (`lib/bootstrap.ts`): Central in-memory cache stored in localStorage (`koza.bootstrap.v1`)
- Contains: profile, lessonCatalog, lessonProgress, wallet, srsSummary, srsToday
- **Key concept**: Single source of truth synced from Firestore on app load
- Changes to bootstrap trigger `bootRevision` increments to force re-renders

#### Progress & Daily Queue System
- **Progress tracking** (`services/progressV1.ts`): Firestore operations for lesson completion/failure
- **Daily queue reconciliation** (`services/StudyPlanV1.ts`):
  - `ensureDailyQueue()`: Rolls over stale lessons from `current` → `failed`, assigns new lessons based on `perDay` quota
  - Runs once on app entry in `App.tsx > RequireProfile > reconcileProgress()`
  - Only writes to Firestore when material changes detected
- **Progress reconciliation** (`services/progressReconcileV1.ts`): Syncs bootstrap cache with Firestore

#### SRS (Spaced Repetition System)
- **SRS summary** (`helpers/srsV1.ts`): Tracks lessons across 5 stages (Apprentice I-III, Guru I-II)
- Review intervals: 3d → 7d → 14d → 20d → 30d
- `srsDueOnDate()`: Returns lesson IDs due for review on a given date
- `recordPerfectLessonToSrs()` (`services/srsV1.ts`): Promotes perfect-score lessons to SRS stage 1

### Study Flow State Machine

The `session.ts` store orchestrates the study flow through stages:

1. **studying**: Flashcard review (vocab)
2. **quiz**: Vocabulary quiz (MCQ, kana matching)
3. **summary**: Vocab quiz results
4. **grammar**: Grammar point study
5. **grammarQuiz**: Grammar quiz
6. **grammarSummary**: Grammar quiz results
7. **examFresher**: Daily exam preparation screen
8. **examSummary**: Daily exam results
9. **srsFresher/srsExam/srsSummary**: SRS review flow

Stage transitions managed by `helpers/stage.ts > computeNextStage()`.

### Firestore Document Structure

User data stored at `/users/{uid}/`:
- `meta/profile`: User profile (nickname, avatarKey, jlptLevel, accountType)
- `progress/lessons`: Lesson progress (completed[], failed[], current[], examsStats[])
- `wallet/main`: Wallet balance and transactions
- `srs/summary`: SRS stages and review schedule

### Quiz System

Quiz builders in `lib/quiz/`:
- `builders.ts`: Vocab quiz (MCQ, kana matching), grammar quiz from pool
- `grammarBuilder.ts`: Grammar MCQ generation (buildGrammarMixed)
- `distractors.ts`: Generates plausible wrong answers for MCQs

Quiz types:
- `mcq`: Multiple-choice questions
- `kanjiToHiragana`: Kanji → reading
- `hiraganaToKanji`: Reading → kanji
- `matching`: Drag-and-drop word matching

### Data Types

Key types in `types/`:
- `lessonV1.ts`: LessonProgress, LessonCompletion, LessonFailure, ExamStatsEntry, SrsSummary
- `userV1.ts`: UserProfile, AccountType, JLPTLevelStr ('N5' | 'N4' | 'N3' | 'N2' | 'N1')
- `session.ts`: SessionState (study flow state machine)
- `quiz.ts`: QuizItem, QuizResult

## Path Aliases

Use the `@/` alias for imports:
```typescript
import { useAuth } from '@/store/auth';
import { jstTodayISO } from '@/helpers/dateV1';
```

Configured in `vite.config.ts` and `vitest.config.ts` as `'@': path.resolve(__dirname, 'src')`.

## Testing

- **Framework**: Vitest + React Testing Library
- **Setup**: `src/test/setupTests.ts`
- **Utilities**: `test-utils/renderWithTheme.tsx` for themed component testing
- **Location**: Tests in `src/__tests__/` directory
- Test files follow the pattern `*.spec.ts` or `*.spec.tsx`

Key test files cover:
- Study flow logic (decideDailyQueue, ensureDailyQueue, rollover behavior)
- Exam statistics (appendExamStats)
- Quiz timing
- Stage gate logic

## Firebase Configuration

- **Config**: `firebase.json` (Firestore rules, indexes at `firestore.indexes.json`)
- **Region**: asia-northeast2
- **Emulator**: Not configured; app connects to live Firebase

## Dynamic Imports

The codebase uses dynamic imports to reduce initial bundle size:
```typescript
const { loadBootstrap } = await import('@/lib/bootstrap'); // @dynamic-import
```

These imports are marked with `// @dynamic-import` comments.

## Code Organization Patterns

### Services Layer
Files in `services/` handle business logic and Firestore operations:
- Prefix `V1` indicates version (e.g., `progressV1.ts`, `srsV1.ts`)
- Pure functions in `helpers/` (date, arrays, text, kana)
- Firestore wrappers in `lib/firestore/`

### Component Organization
- `components/`: Reusable UI components organized by domain (home, study, flashcards, quiz, srs)
- `pages/`: Top-level route components (HomePage, FlashcardsPage, QuizPage, etc.)
- `styles/Pages/`: Styled-components for page-level styling

### Naming Conventions
- Firestore document helpers use snake_case for keys (e.g., `lessons`, `profile`)
- Type suffixes: `V1` for versioned types, `State` for Zustand stores
- ISO date strings: Always YYYY-MM-DD format (JST timezone via `jstTodayISO()`)

## Important Implementation Details

### Date Handling
- **Always use JST timezone** for daily queue operations via `jstTodayISO()` from `helpers/dateV1.ts` or `lib/cache/lessons.ts`
- ISO strings stored as `YYYY-MM-DD` for date comparisons
- Firestore timestamps converted to ISO for client-side processing

### Lesson Queue Behavior
- `current` array holds today's assigned lessons as `{ lessonNo: number, LessonDate: string }`
- Stale lessons (from previous days) automatically rolled over to `failed[]` on next app load
- Backfill policy controls how missed days are handled (default: `through-yesterday`)

### Local Attempts Cache
- Vocab quiz attempts stored in localStorage (not Firestore) via `lib/attempts.ts`
- Used for retry logic and "perfect streak" detection
- Cleared after successful lesson completion

### Styled Components
- Uses `babel-plugin-styled-components` for better debugging
- Styled files in `styles/` directory
- Theme toggling via `store/themeMode.ts` and `components/layout/ThemeToggle.tsx`

## Development Notes

- **Port**: Dev server runs on `0.0.0.0:5173` (exposed to local network)
- **Node environment**: Check `process.env.NODE_ENV` for dev-specific debugging
- **Global debug object**: In dev mode, `window.__KOZA_BOOTSTRAP__` exposes current bootstrap state
- **Test button**: Dev environment includes `components/dev/TestButtons.tsx` for manual testing
