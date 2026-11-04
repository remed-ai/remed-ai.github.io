import { store } from '../lib/storage';
import type { ScanResult } from './schema';

/** "My Medicines": printed details of scanned medicines, saved only on this device. */
export interface SavedMedicine {
  id: string;
  savedAt: string;
  name: string;
  strength?: string;
  expiry?: string;
  directions?: string;
  sampleId?: string;
  thumb?: string;
}
const KEY = 'remed.medicines';

export const listMedicines = () => store.get<SavedMedicine[]>(KEY, []);
export const removeMedicine = (id: string) => store.set(KEY, listMedicines().filter((m) => m.id !== id));

export function saveMedicine(r: ScanResult, from: { sampleId?: string | null; image?: string | null; source?: string }, now = new Date()): SavedMedicine {
  const v = (f: string) => r.printed.find((p) => p.field === f)?.value;
  const m: SavedMedicine = {
    id: now.getTime().toString(36),
    savedAt: now.toISOString(),
    name: v('name') ?? 'Medicine',
    strength: v('strength') ?? v('ingredient'),
    expiry: v('expiry'),
    directions: v('directions'),
    sampleId: from.sampleId ?? undefined,
  };
  const rest = listMedicines().filter((x) => x.name !== m.name);
  store.set(KEY, [m, ...rest].slice(0, 50));
  return m;
}

/** Reads printed expiry like "EXP 08/2028" or "10/2027". Returns the last day of that month. */
export function parseExpiry(s?: string): Date | null {
  const m = s?.match(/(\d{1,2})\s*[/.-]\s*(\d{2,4})/);
  if (!m) return null;
  const month = Number(m[1]);
  let year = Number(m[2]);
  if (year < 100) year += 2000;
  if (month < 1 || month > 12) return null;
  return new Date(year, month, 0);
}

export function expiryStatus(s?: string, now = new Date()): 'expired' | 'soon' | 'ok' | 'unknown' {
  const d = parseExpiry(s);
  if (!d) return 'unknown';
  if (d < now) return 'expired';
  return d.getTime() - now.getTime() < 60 * 864e5 ? 'soon' : 'ok';
}
