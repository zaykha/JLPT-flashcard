import React from 'react';
import { jstTodayISO, debugListAllTodayLessons } from '@/lib/cache/lessons';

export const TodayPeek: React.FC = () => {
  const [dump, setDump] = React.useState<any>(null);
  React.useEffect(() => {
    try {
      const arr = debugListAllTodayLessons();
      const today = jstTodayISO();
      setDump({ todayISO: today, cacheCount: arr.length, records: arr });
    } catch (e) {
      setDump({ error: String(e) });
    }
  }, []);
  if (!dump) return null;
  return (
    <div style={{
      position: 'fixed', right: 12, top: 12, zIndex: 9999,
      width: 'min(92vw, 520px)', maxHeight: '70vh', overflow: 'auto',
      background: 'rgba(4,8,12,0.96)', color: '#e5e7eb',
      border: '2px solid #000', borderRadius: 12, padding: 10,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12
    }}>
      <div style={{fontWeight:'bold', marginBottom:6}}>Today Lesson Peek</div>
      <pre style={{whiteSpace:'pre-wrap', margin:0}}>
        {JSON.stringify(dump, null, 2)}
      </pre>
    </div>
  );
};
