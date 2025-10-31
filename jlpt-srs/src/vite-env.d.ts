/// <reference types="vite/client" />
// Here’s a quick inventory of source files that don’t appear to be referenced by the app, based on a static scan of imports/identifiers across jlpt-srs/src. Treat this as a starting point; some items might be intentional (e.g., dev tools, future features, or dynamically imported by name).

// Likely unused (no inbound references)

// Declarations/assets

// jlpt-srs/src/vite-env.d.ts
// jlpt-srs/src/fonts/AkashiiPersonalUseOnly.ttf
// jlpt-srs/src/fonts/Gaijin Shodo.ttf
// Dev/tests

// jlpt-srs/src/store/tests/walletStore.test.ts
// jlpt-srs/src/lib/api/tests/http.test.ts
// jlpt-srs/src/lib/seed.ts
// UI components not referenced

// jlpt-srs/src/components/home/DailySummaryCard.tsx
// jlpt-srs/src/components/home/ProgressModal.tsx
// jlpt-srs/src/components/home/StreakRings.tsx
// jlpt-srs/src/components/study/TopicCard.tsx
// jlpt-srs/src/components/layout/BottomBar.tsx
// jlpt-srs/src/components/wallet/ConfirmSpendDialog.tsx
// jlpt-srs/src/features/wallet/WalletDebugPanel.tsx
// Hooks not referenced

// jlpt-srs/src/hooks/useIsMobile.ts
// jlpt-srs/src/hooks/useLessonCatalog.ts
// jlpt-srs/src/hooks/useGrammarFlashcard.ts
// jlpt-srs/src/hooks/useLessonProgress.ts
// jlpt-srs/src/hooks/useTodaySet.ts
// Libs not referenced

// jlpt-srs/src/lib/curriculum.ts
// jlpt-srs/src/lib/jlpt-level.ts
// jlpt-srs/src/lib/srs-intervals.ts
// jlpt-srs/src/lib/tts.ts
// jlpt-srs/src/lib/progress/todayQueue.ts
// Notes and caveats

// Some files might be used indirectly or dynamically. If something is loaded at runtime by name (e.g., via window import or a string key), a static scan won’t catch it.
// Test and seed files are often intentionally present for local use and can be kept around.
// Fonts: if they’re referenced only from CSS that gets tree-shaken, they may still be needed; verify by checking jlpt-srs/src/fonts/fonts.css usage.
// Wallet files: ConfirmSpendDialog and WalletDebugPanel aren’t referenced by the current route map or wallet components; if you intend to surface them later, keep them.
// todayQueue helpers: you migrated to writing current as objects directly; if you’ve fully replaced ensureTodayQueue/append/remove flows, they can be retired. If you want to keep them, update them to the new object format (already done in prior steps if you used them).