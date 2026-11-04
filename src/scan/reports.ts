import { store } from '../lib/storage';

/** "Report a wrong result": a short text note saved on this device only. Never an image. */
export interface WrongResultReport { at: string; source: 'sample' | 'live'; kind: string; note: string }
const KEY = 'remed.reports';

export function saveReport(r: Omit<WrongResultReport, 'at'>, now = new Date()): WrongResultReport {
  const entry: WrongResultReport = { ...r, note: r.note.trim().slice(0, 280), at: now.toISOString() };
  const all = store.get<WrongResultReport[]>(KEY, []);
  store.set(KEY, [...all, entry].slice(-50));
  return entry;
}
export const listReports = () => store.get<WrongResultReport[]>(KEY, []);
