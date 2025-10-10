import type { JLPTLevelStr } from '@/lib/user-data';

export type WalletDaily = {
  lessonsTaken: number;
  extraLessonsUsed: number;
  missedLessonsRedeemed: number;
};

export type Wallet = {
  shards: number;
  lastResetISO?: string | number | null;
  daily?: WalletDaily;
  quizAttemptsByLesson?: Record<string, number>;
  updatedAt?: number | null;
};

export type WalletTransaction = {
  id: string;
  type: string;
  amount: number;
  createdAt: number | null;
  payload?: Record<string, unknown>;
};

export type WalletResponse = {
  wallet: Wallet;
  transactions: WalletTransaction[];
};

export type EconomyEntry = {
  type: string;
  label?: string;
  hint?: string;
  shards: number;
};

export type Product = {
  sku: string;
  amount: number;
  currency: 'jpy';
  shards: number;
  bonus?: number;
};

export type ProductsResponse = {
  currency: string;
  shardRate?: string;
  products: Product[];
  economy?: EconomyEntry[];
};

export type CreateOrderResponse = {
  orderId: string;
};

export type CreatePIResponse = {
  clientSecret: string;
};

export type SetupIntentResponse = {
  clientSecret: string;
};

export type DailyLesson = {
  lessonNo: number;
  topic?: string | null;
  // level?: JLPTLevelStr | null;
  grammarIds?: string[];
  vocabIds?: string[];
};

export type LessonCatalog = {
  level: JLPTLevelStr;
  lessonRange: { start: number; end: number };
  updatedAt: number | null;
  lessons: DailyLesson[];   
};

export type ApiError = {
  code?: string;
  message: string;
  status?: number;
  cause?: unknown;
};
