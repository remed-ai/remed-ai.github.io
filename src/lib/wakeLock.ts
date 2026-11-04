type Sentinel = { release: () => Promise<void> };

/** Keep the booth screen awake where Screen Wake Lock is supported. Returns a cleanup. */
export function keepAwake(): () => void {
  const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<Sentinel> } };
  if (!nav.wakeLock) return () => {};
  let lock: Sentinel | null = null;
  let stopped = false;
  const get = async () => {
    try {
      if (!stopped && document.visibilityState === 'visible') lock = await nav.wakeLock!.request('screen');
    } catch {
      /* denied or unsupported */
    }
  };
  const onVis = () => void get();
  void get();
  document.addEventListener('visibilitychange', onVis);
  return () => {
    stopped = true;
    document.removeEventListener('visibilitychange', onVis);
    void lock?.release().catch(() => {});
  };
}
