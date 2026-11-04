import { useEffect, useState } from 'react';

export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useReducedMotion(): boolean {
  const [r, setR] = useState(prefersReducedMotion);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const m = matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setR(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return r;
}

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Light mode for weak phones: few cores, little memory, data saver, or ?lite=1. */
export function isLiteDevice(): boolean {
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (new URLSearchParams(location.search).has('lite')) return true;
  if (n.connection?.saveData) return true;
  if ((n.deviceMemory ?? 8) <= 2) return true;
  return (n.hardwareConcurrency ?? 8) <= 2;
}

export const canUse3D = () => !prefersReducedMotion() && !isLiteDevice() && hasWebGL();

export function vibrate(ms: number | number[]) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* unsupported */
  }
}

/** iOS needs a user tap before device orientation events fire. */
export async function requestMotionPermission(): Promise<boolean> {
  const D = (globalThis as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
  if (!D?.requestPermission) return true;
  try {
    return (await D.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}
export const motionNeedsPermission = () =>
  typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches &&
  typeof (globalThis as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } }).DeviceOrientationEvent?.requestPermission === 'function';
