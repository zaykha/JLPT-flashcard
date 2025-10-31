import React, { useEffect, useState } from 'react';
import { decideStageFromProgress } from '@/logic/stageGate';

type CheckResult = { name: string; ok: boolean; details?: string };

export const DiagnosticsPage: React.FC = () => {
  const [rows, setRows] = useState<CheckResult[]>([]);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    const out: CheckResult[] = [];
    try {
      const [{ loadBootstrap }, { jstTodayISO }] = await Promise.all([
        import('@/lib/bootstrap'),
        import('@/lib/cache/lessons'),
      ]);
      const boot = loadBootstrap();
      const today = jstTodayISO();
      const prog = boot?.lessonProgress ?? { completed:[], failed:[], current:[], examsStats:[] };

      out.push({ name:'bootstrap loaded', ok: !!boot, details: boot ? 'ok' : 'no bootstrap' });
      out.push({ name:'examsStats present', ok: Array.isArray(prog.examsStats), details: `len=${(prog.examsStats||[]).length}` });

      // Stage recommendation
      const gate = decideStageFromProgress(prog as any, today, 2);
      out.push({ name:'stage decision', ok: true, details: `${gate.stage} (${gate.reason})` });

      setRows(out);
    } catch (e: any) {
      out.push({ name:'diagnostics failure', ok:false, details: String(e?.message ?? e) });
      setRows(out);
    } finally { setBusy(false); }
  }

  useEffect(() => { run(); }, []);

  return (
    <div style={{ padding: 24, color: '#e5e7eb' }}>
      <h1>Diagnostics</h1>
      <button
        onClick={run}
        disabled={busy}
        style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #334155', background:'#1f2937', color:'#fff' }}
      >
        {busy ? 'Running…' : 'Run checks'}
      </button>

      <div style={{ marginTop:16 }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:12, margin:'8px 0', border:'1px solid #334155', borderRadius:10,
            background: r.ok ? 'rgba(34,197,94,.08)' : 'rgba(239,68,68,.08)'
          }}>
            <div><b>{r.name}</b></div>
            <div style={{opacity:.9}}>{r.details}</div>
            <div style={{ fontWeight:700, color: r.ok ? '#22c55e' : '#f87171' }}>{r.ok ? 'PASS' : 'FAIL'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
