import { db } from '@/lib/firebase';
import {
serverTimestamp as fsServerTimestamp,
doc,
getDoc,
setDoc,
updateDoc,
type DocumentReference,
} from 'firebase/firestore';


export const serverTimestamp = fsServerTimestamp; // re-export for consistent import site
export { db, doc, getDoc, setDoc, updateDoc };
export type { DocumentReference };


export const userDoc = (uid: string, ...path: string[]) => doc(db, 'users', uid, ...path);

export { arrayUnion } from 'firebase/firestore';
