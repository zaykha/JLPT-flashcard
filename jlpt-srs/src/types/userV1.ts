export type AccountType = 'normal' | 'premium';
export type JLPTLevelStr = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
// Strict validator (throws if invalid)
export function assertJLPTLevel(x: unknown): asserts x is JLPTLevelStr {
  if (typeof x !== 'string' || !JLPT_LEVELS.includes(x as any)) {
    throw new Error(`Invalid JLPT level: ${x}`);
  }
}

// Safe coercer (falls back to N5)
export function coerceJLPTLevel(x: unknown, fallback: JLPTLevelStr = 'N5'): JLPTLevelStr {
  return (typeof x === 'string' && (JLPT_LEVELS as readonly string[]).includes(x as any))
    ? (x as JLPTLevelStr)
    : fallback;
}
export type TimestampLike = unknown; // If you want strict types: import { Timestamp } from 'firebase/firestore'


export type UserProfile = {
nickname: string;
avatarKey?: string;
accountType: AccountType;
jlptLevel: JLPTLevelStr;
createdAt?: TimestampLike;
updatedAt?: TimestampLike;
};