// src/lib/firestore/content.ts
import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CHUNK = 10; // Firestore 'in' limitation

function chunk<T>(arr: T[], size = CHUNK) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function getDocsByIds<T = any>(col: string, ids: string[]): Promise<Array<T & { id: string }>> {
  if (!ids?.length) return [];
  const parts = chunk(ids);
  const results: Array<T & { id: string }> = [];

  for (const p of parts) {
    const q = query(collection(db, col), where(documentId(), 'in', p));
    const snap = await getDocs(q);
    snap.forEach(d => results.push({ id: d.id, ...(d.data() as T) }));
  }
  return results;
}

export const getVocabByIds = (ids: string[]) => getDocsByIds('vocab', ids);
export const getGrammarByIds = (ids: string[]) => getDocsByIds('grammarPoints', ids);
