// // src/pages/BuyTodayPage.tsx
// import * as React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSession } from '@/store/session';
// import type { JLPTLevelStr } from '@/types/userV1';

// // Reuse your styled components if you have them:
// import {
//   Screen, PixelFrame, Title, Small, List, Btn
// } from '@/styles/Pages/GrammarQuizSummaryPage.styles';
// import { Row } from '@/styles/Pages/QuizSummaryPage.styles';

// export default function BuyTodayPage() {
//   // ✅ Hooks at the top level, inside a component
//   const nav = useNavigate();
//   const quizMode = useSession(s => s.quizMode); // example state if you need it
//   const setStage = useSession(s => s.setStage);

//   const [buying, setBuying] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);

//   // Example: compute cost once
//   const cost = React.useMemo(() => {
//     // put your pricing logic here
//     return 50; // shards
//   }, []);

//   // Confirm purchase → assign next block for today (override your normal gate)
//   const handleConfirm = React.useCallback(async () => {
//     try {
//       setBuying(true);
//       setError(null);

//       // Get bootstrap for level + uid
//       const [{ loadBootstrap, loadBootCatalog }, { useAuth }] = await Promise.all([
//         import('@/lib/bootstrap'),
//         import('@/store/auth'),
//       ]);

//       const boot = loadBootstrap();
//       const level = boot?.catalogLevel as JLPTLevelStr | undefined;
//       const uid = useAuth.getState().user?.uid;

//       if (!uid || !level) {
//         throw new Error('Missing user or level');
//       }

//       const cat = await loadBootCatalog(level);
//       const range = (cat?.lessonRange ?? undefined) as { start: number; end: number } | undefined;
//       if (!range) throw new Error('Missing lesson range');

//       // Use a dedicated override that assigns even if quota is met.
//       const { ensureDailyQueue } = await import('@/services/StudyPlanV1');
//       await ensureDailyQueue(uid, { levelRange: range, perDay: 2});

//       // After buying, go back to study flow
//       setStage('studying');
//       nav('/flashcards');
//     } catch (e: any) {
//       setError(e?.message || 'Failed to buy more lessons today.');
//     } finally {
//       setBuying(false);
//     }
//   }, [nav, setStage]);

//   const handleCancel = React.useCallback(() => {
//     // Back to home
//     // setStage('homePage');
//     nav('/');
//   }, [nav, setStage]);

//   return (
//     <Screen>
//       <PixelFrame>
//         <Title>Buy More Lessons Today</Title>
//         <Small>
//           Buying more lessons will immediately add another block to today’s queue.
//         </Small>

//         <List style={{ marginTop: 16 }}>
//           <Row>
//             <div>Cost</div>
//             <b>{cost} shards</b>
//           </Row>
//           <Row>
//             <div>Quantity</div>
//             <b>+2 lessons</b>
//           </Row>
//         </List>

//         {error ? <Small style={{ color: 'red', marginTop: 8 }}>{error}</Small> : null}

//         <div style={{
//           position: 'sticky',
//           bottom: 0,
//           display: 'flex',
//           gap: 12,
//           marginTop: 24,
//           paddingTop: 12,
//           paddingBottom: 12,
//           background: 'var(--bg, #0b0b0f)',
//           zIndex: 9999
//         }}>
//           <Btn $variant="secondary" onClick={handleCancel} disabled={buying}>← Back</Btn>
//           <Btn $variant="primary" onClick={handleConfirm} disabled={buying}>
//             {buying ? 'Processing…' : 'Buy & Add Lessons →'}
//           </Btn>
//         </div>
//       </PixelFrame>
//     </Screen>
//   );
// }
