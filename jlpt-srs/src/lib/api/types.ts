import type { JLPTLevelStr } from '@/types/userV1';
import type { Timestamp } from 'firebase/firestore';

export type FirebaseTimestamp = Timestamp;

export type Wallet = {
  shards: number;
  updatedAt: FirebaseTimestamp;
  premium?: {
    status: 'none'|'active'|'past_due'|'canceled';
    subscriptionId?: string;
    currentPeriodEnd?: FirebaseTimestamp;
  };
};

export type WalletTransaction = {
  // Firestore doc id (optional for UI convenience)
  id?: string;
  type: 'shard_topup'|'spend'|'reward'|'refund';
  amount: number;
  balanceAfter?: number;
  source?: { provider: 'stripe'|'system'; paymentIntentId?: string; orderId?: string; };
  note?: string;
  createdAt: FirebaseTimestamp;
};

export type WalletOrder = {
  priceId: string;
  shards: number;
  status: 'pending'|'completed'|'canceled'|'failed';
  sessionId?: string;
  paymentIntentId?: string;
  createdAt: FirebaseTimestamp;
  completedAt?: FirebaseTimestamp;
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
