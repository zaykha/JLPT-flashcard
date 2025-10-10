import React from 'react';

type Props = {
  title?: string;
  payloads: Array<{ label: string; value: unknown }>;
  onClose?: () => void;
};

function safeStringify(obj: unknown) {
  try { return JSON.stringify(obj, null, 2); } catch { return '[unserializable]'; }
}

export const DebugOverlay: React.FC<Props> = ({ title = 'KOZA Debug', payloads, onClose }) => {
  return (
    <div style={{
      position: 'fixed', right: 12, bottom: 12, zIndex: 9999,
      width: 'min(92vw, 560px)', maxHeight: '70vh', overflow: 'auto',
      background: 'rgba(4,8,12,0.96)', color: '#e5e7eb',
      border: '2px solid #000', borderRadius: 12, boxShadow: '0 18px 40px rgba(0,0,0,.5)',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, lineHeight: 1.4
    }}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding: '10px 12px', borderBottom:'1px solid rgba(255,255,255,.08)'}}>
        <strong style={{letterSpacing:'.04em'}}>{title}</strong>
        <button onClick={onClose} style={{
          border:'1px solid #444', background:'transparent', color:'#e5e7eb',
          borderRadius:8, padding:'4px 8px', cursor:'pointer'
        }}>Close</button>
      </div>
      {payloads.map((p, i) => (
        <section key={i} style={{padding:'10px 12px', borderTop: i ? '1px dashed rgba(255,255,255,.08)' : 'none'}}>
          <div style={{opacity:.85, marginBottom:6}}>{p.label}</div>
          <pre style={{whiteSpace:'pre-wrap', overflowWrap:'anywhere', margin:0}}>
            {safeStringify(p.value)}
          </pre>
        </section>
      ))}
    </div>
  );
};
