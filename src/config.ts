/** Single place for booth and safety settings. */
export const CONFIG = {
  /** Staff PIN to leave showcase mode. */
  staffPin: '2580',
  /** Emergency number shown in urgent-help guidance (India default). */
  emergencyNumber: '112',
  /** Minimum time between live scans on one device. */
  scanCooldownMs: 10_000,
  /** Longest image edge sent to Gemini. */
  maxImageEdge: 1280,
  /** Showcase idle timing. */
  idleMs: 30_000,
  stillThereMs: 5_000,
  /** Showcase entry/exit gestures. */
  entryTaps: 5,
  entryWindowMs: 3_000,
  exitHoldMs: 5_000,
  /** Default Gemini model; override with VITE_GEMINI_MODEL. */
  defaultModel: 'gemini-flash-latest',
  repoUrl: 'https://github.com/remed-ai/remed-ai.github.io',
} as const;

export const geminiKey = (): string => (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() ?? '';
export const geminiModel = (): string =>
  (import.meta.env.VITE_GEMINI_MODEL as string | undefined)?.trim() || CONFIG.defaultModel;
