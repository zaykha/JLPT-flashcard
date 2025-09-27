// TODO: Icon helper
import React from 'react';

type Props = {
  name: string;            // topic key, e.g. "people"
  size?: number;           // px, default 18
  stroke?: string;         // stroke color
  fill?: string;           // fill color (if used)
  style?: React.CSSProperties;
  className?: string;
};

// simple 20x20 icons, consistent strokes
const S = 20;
const st = (color?:string) => ({ fill:'none', stroke: color || 'currentColor', strokeWidth: 1.6, strokeLinecap:'round', strokeLinejoin:'round' } as const);

export const TopicIcon: React.FC<Props> = ({ name, size=18, stroke, fill, style, className }) => {
  const c = stroke || 'currentColor';

  switch (name) {
    case 'people':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" style={style} className={className}>
          <circle cx="6.5" cy="6.5" r="3.5" {...st(c)}/>
          <path d="M1.5 17c0-3 3-5 6-5s6 2 6 5" {...st(c)}/>
          <circle cx="14.5" cy="6.5" r="2.5" {...st(c)}/>
          <path d="M12 12c1.5.4 3 .9 4 2.5 0 0 .8 1.2 1 2.5" {...st(c)}/>
        </svg>
      );

    case 'places':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" style={style} className={className}>
          <path d="M3 9.5L10 3l7 6.5v7.5H3V9.5Z" {...st(c)}/>
          <path d="M7 17V10h6v7" {...st(c)}/>
        </svg>
      );

    case 'food':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" style={style} className={className}>
          <path d="M4 10c0-3.3 2.7-6 6-6s6 2.7 6 6" {...st(c)}/>
          <path d="M3 10h14l-1 6H4l-1-6Z" {...st(c)}/>
          <path d="M10 4v2" {...st(c)}/>
        </svg>
      );

    case 'time':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" style={style} className={className}>
          <circle cx="10" cy="10" r="7" {...st(c)}/>
          <path d="M10 6v5l3 2" {...st(c)}/>
        </svg>
      );

    case 'travel':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" style={style} className={className}>
          <path d="M2 14l6-2 4-7 3 3-7 4-2 6-4-4Z" {...st(c)}/>
          <path d="M12 5l3 3" {...st(c)}/>
        </svg>
      );

    case 'school':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" style={style} className={className}>
          <path d="M2 8l8-4 8 4-8 4-8-4Z" {...st(c)}/>
          <path d="M4 9v5l6 3 6-3V9" {...st(c)}/>
        </svg>
      );

    case 'work':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" style={style} className={className}>
          <rect x="3" y="7" width="14" height="9" rx="2" {...st(c)}/>
          <path d="M7 7V5h6v2" {...st(c)}/>
        </svg>
      );

    case 'feelings':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" style={style} className={className}>
          <path d="M10 17s-6-3.5-6-8a4 4 0 0 1 6-3 4 4 0 0 1 6 3c0 4.5-6 8-6 8Z" {...st(c)}/>
        </svg>
      );

    case 'body':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" style={style} className={className}>
          <circle cx="10" cy="5.5" r="3" {...st(c)}/>
          <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" {...st(c)}/>
        </svg>
      );

    case 'numbers':
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" style={style} className={className}>
          <path d="M4 6h3v8M3 14h4M9 6h5M11.5 6v8M9 14h5" {...st(c)}/>
        </svg>
      );

    default:
      // generic bookmark
      return (
        <svg width={size} height={size} viewBox="0 0 20 20" style={style} className={className}>
          <path d="M6 3h8v14l-4-3-4 3V3Z" {...st(c)}/>
        </svg>
      );
  }
};
