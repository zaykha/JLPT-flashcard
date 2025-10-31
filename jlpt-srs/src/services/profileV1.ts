import { getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { userDoc } from '@/lib/firestore/firestoreV1';
import type { UserProfile } from '@/types/userV1';


export async function ensureProfile(uid: string, defaults: Partial<UserProfile> = {}): Promise<UserProfile> {
const ref = userDoc(uid, 'meta', 'profile');
const snap = await getDoc(ref);
if (!snap.exists()) {
const payload: UserProfile = {
nickname: defaults.nickname ?? 'Explorer',
avatarKey: defaults.avatarKey ?? 'default',
accountType: defaults.accountType ?? 'normal',
jlptLevel: defaults.jlptLevel ?? 'N5',
createdAt: serverTimestamp(),
updatedAt: serverTimestamp(),
};
await setDoc(ref, payload);
return payload;
}
const data = snap.data() as UserProfile;
if (!data.accountType) {
await updateDoc(ref, { accountType: defaults.accountType ?? 'normal', updatedAt: serverTimestamp() });
data.accountType = defaults.accountType ?? 'normal';
}
return data;
}


export const getProfile = ensureProfile; // de-duplicate wrapper


export async function upsertProfile(uid: string, data: Partial<UserProfile>) {
const ref = userDoc(uid, 'meta', 'profile');
const snap = await getDoc(ref);
const payload = { ...data, updatedAt: serverTimestamp() } as Partial<UserProfile> & { updatedAt: unknown };
if (snap.exists()) {
await updateDoc(ref, payload as any);
} else {
await setDoc(ref, {
...data,
accountType: data.accountType ?? 'normal',
createdAt: serverTimestamp(),
updatedAt: serverTimestamp(),
} as any);
}
}