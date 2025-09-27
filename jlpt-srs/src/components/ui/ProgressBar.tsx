// TODO: Segmented progress bar
import styled from 'styled-components';

export type ProgressSegment = {
  key: string;           // e.g. 'new' | 'due' | 's1' | 's2'...
  label: string;         // legend label
  count: number;         // how many items in this bucket
  color?: string;        // optional custom color (falls back to default palette)
};

type Props = {
  segments: ProgressSegment[];
  total?: number;        // if omitted, sum(segments.count)
  height?: number;       // px, default 12
  rounded?: boolean;     // default true
  showLegend?: boolean;  // default true (mini legend)
  compact?: boolean;     // smaller font/spacing
  onClickSegment?: (key: string) => void; // optional handler to make it interactive
  ariaLabel?: string;
};

const BarWrap = styled.div<{height:number; rounded:boolean; clickable:boolean}>`
  width: 100%;
  background: rgba(255,255,255,.06);
  border: 1px solid var(--border);
  border-radius: ${({rounded})=> rounded ? '9999px' : '6px'};
  height: ${({height})=> `${height}px`};
  overflow: hidden;
  display: flex;
  position: relative;
  cursor: ${({clickable}) => clickable ? 'pointer' : 'default'};
`;

const Segment = styled.div<{w:number; bg:string; clickable:boolean}>`
  width: ${({w})=> `${w}%`};
  background: ${({bg}) => bg};
  height: 100%;
  transition: opacity .15s ease, transform .06s ease;
  &:hover {
    opacity: ${({clickable}) => clickable ? .9 : 1 };
  }
  &:active {
    transform: ${({clickable}) => clickable ? 'scale(0.998)' : 'none'};
  }
`;

const Legend = styled.div<{compact:boolean}>`
  display: flex; flex-wrap: wrap; gap: .5rem .75rem;
  margin-top: .35rem;
  font-size: ${({compact}) => compact ? '.68rem' : '.75rem'};
  color: var(--muted);
`;

const Dot = styled.span<{bg:string}>`
  display:inline-block; width:.65rem; height:.65rem; border-radius:50%;
  margin-right:.35rem; background:${({bg})=> bg}; border:1px solid rgba(0,0,0,.2);
`;

// default palette for SRS-like buckets
const COLOR_MAP: Record<string,string> = {
  new:       '#ef4444', // red
  due:       '#f59e0b', // amber
  s0:        '#06b6d4', // cyan
  s1:        '#10b981', // emerald
  s2:        '#8b5cf6', // violet
  s3:        '#22c55e', // green
  s4:        '#0ea5e9', // sky
  future:    '#94a3b8', // slate
};

function colorFor(key:string, fallback?:string){
  return fallback || COLOR_MAP[key] || '#64748b';
}

export const ProgressBar: React.FC<Props> = ({
  segments,
  total,
  height = 12,
  rounded = true,
  showLegend = true,
  compact = true,
  onClickSegment,
  ariaLabel = 'progress',
}) => {
  const sum = total ?? segments.reduce((a, s) => a + (s.count || 0), 0);
  const safe = sum > 0 ? sum : 1;

  return (
    <div aria-label={ariaLabel}>
      <BarWrap height={height} rounded={rounded} clickable={!!onClickSegment}>
        {segments.map((s) => {
          const w = Math.max(0, Math.min(100, (s.count / safe) * 100));
          const bg = colorFor(s.key, s.color);
          return (
            <Segment
              key={s.key}
              w={w}
              bg={bg}
              clickable={!!onClickSegment}
              title={`${s.label}: ${s.count}`}
              onClick={() => onClickSegment?.(s.key)}
            />
          );
        })}
      </BarWrap>

      {showLegend && (
        <Legend compact={compact}>
          {segments.map(s => (
            <span key={`legend-${s.key}`}>
              <Dot bg={colorFor(s.key, s.color)} />
              {s.label} <span style={{opacity:.75}}>({s.count})</span>
            </span>
          ))}
          <span style={{marginLeft:'auto', opacity:.7}}>
            Total: {sum}
          </span>
        </Legend>
      )}
    </div>
  );
};
