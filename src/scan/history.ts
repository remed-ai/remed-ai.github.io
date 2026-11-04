import { store } from '../lib/storage';
import type { ScanResult } from './schema';

/** Scan history, saved only on this device. */
export interface HistoryItem {
  id: string;
  at: string;
  source: 'sample' | 'live';
  sampleId?: string;
  /** Small JPEG preview (live scans only). */
  thumb?: string;
  aspect: number;
  result: ScanResult;
}
const KEY = 'remed.history';
const MAX = 30;

export const listHistory = (): HistoryItem[] => store.get<HistoryItem[]>(KEY, []);
export const getHistory = (id: string) => listHistory().find((h) => h.id === id);

export function saveHistory(item: Omit<HistoryItem, 'id' | 'at'>, now = new Date()): HistoryItem {
  const entry: HistoryItem = { ...item, id: `${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 6)}`, at: now.toISOString() };
  let all = [entry, ...listHistory()].slice(0, MAX);
  store.set(KEY, all);
  // If storage is full, drop previews and retry.
  if (listHistory()[0]?.id !== entry.id) {
    all = all.map((h) => ({ ...h, thumb: undefined }));
    store.set(KEY, all);
  }
  return entry;
}
export const deleteHistory = (id: string) => store.set(KEY, listHistory().filter((h) => h.id !== id));
export const clearHistory = () => store.remove(KEY);
