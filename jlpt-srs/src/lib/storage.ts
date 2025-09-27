// TODO: generic storage helpers
import localforage from 'localforage';

localforage.config({ name: 'jlpt-srs', storeName: 'kv' });

export async function kvGet<T>(key: string): Promise<T | null> {
  return (await localforage.getItem<T>(key)) ?? null;
}
export async function kvSet<T>(key: string, value: T): Promise<void> {
  await localforage.setItem(key, value);
}
export async function kvRemove(key: string): Promise<void> {
  await localforage.removeItem(key);
}

export const KEYS = {
  srs: 'srs.map',
  topics: 'prefs.topics',
  perDay: 'prefs.perDay',
};
