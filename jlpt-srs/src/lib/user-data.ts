import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export type Pace = 10 | 20 | 30 | 50;
export type JLPTLevelStr = 'N5'|'N4'|'N3'|'N2'|'N1';

export type UserProfile = {
  nickname: string;
  avatarKey?: string;     // you’ll supply static assets later
  vocabLevel: JLPTLevelStr;
  grammarLevel: JLPTLevelStr;
  pace: Pace;
  createdAt?: any;
  updatedAt?: any;
};

export async function getProfile(uid: string) {
  const ref = doc(db, 'users', uid, 'meta', 'profile');
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function upsertProfile(uid: string, data: Partial<UserProfile>) {
  const ref = doc(db, 'users', uid, 'meta', 'profile');
  const snap = await getDoc(ref);
  const payload = { ...data, updatedAt: serverTimestamp() };
  if (snap.exists()) {
    await updateDoc(ref, payload as any);
  } else {
    await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() } as any);
  }
}

/** SRS progress document per user (flat map keyed by wordId) */
export type SRSItem = {
  step: number;           // 0..4 (maps to 1d/3d/7d/14d/30d)
  due: string;            // ISO date
  last: string;           // ISO date
};

export type SRSMap = Record<string, SRSItem>;

export async function getSrsMap(uid: string): Promise<SRSMap> {
  const ref = doc(db, 'users', uid, 'progress', 'vocabSrs');
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as SRSMap) : {};
}

export async function saveSrsMap(uid: string, map: SRSMap) {
  const ref = doc(db, 'users', uid, 'progress', 'vocabSrs');
  await setDoc(ref, map, { merge: true });
}
