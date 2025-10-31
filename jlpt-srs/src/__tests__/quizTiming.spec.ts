
import { calcAvgSec } from '@/helpers/quizTiming';
import { describe, it, expect } from 'vitest';


describe('calcAvgSec', () => {
  it('returns null when not perfect and onlyWhenPerfect=true', () => {
    const r = [{ id:'1', correct:true, timeMs:1000 }, { id:'2', correct:false, timeMs: 3000 }] as any;
    expect(calcAvgSec(r, true)).toBeNull();
  });
  it('computes average in whole seconds', () => {
    const r = [{ id:'1', correct:true, timeMs:1000 }, { id:'2', correct:true, timeMs: 3000 }] as any;
    expect(calcAvgSec(r, true)).toBe(2);
  });
});
