import { CONFIG } from '../config';
import { store } from '../lib/storage';

const KEY = 'remed.lastLiveCall';

/** Milliseconds until the next live call is allowed on this device (0 = allowed now). */
export function cooldownLeft(now = Date.now(), last = store.get<number>(KEY, 0)): number {
  return Math.max(0, last + CONFIG.scanCooldownMs - now);
}
export function markLiveCall(now = Date.now()) {
  store.set(KEY, now);
}
