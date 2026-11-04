import { useCallback, useMemo, useRef, useState } from 'react';
import { geminiKey, geminiModel } from '../config';
import { GeminiProvider } from '../scan/gemini';
import { makeThumb, prepareImage } from '../scan/image';
import { saveHistory, type HistoryItem } from '../scan/history';
import { LiveUnavailableError, type ScanProvider } from '../scan/provider';
import { cooldownLeft, markLiveCall } from '../scan/rateLimit';
import { medicineNames, sampleInteraction } from '../scan/followup';
import { sampleById, type Sample } from '../scan/samples';
import { svgDataUrl } from '../scan/sampleArt';
import type { ScanResult, Tri } from '../scan/schema';
import { prefersReducedMotion } from '../lib/device';

export type Phase = 'idle' | 'scanning' | 'result' | 'unavailable' | 'cooldown';

export interface ScanState {
  phase: Phase;
  source: 'sample' | 'live';
  image: string | null;
  aspect: number;
  result: ScanResult | null;
  sampleId: Sample['id'] | null;
  cooldownS: number;
  interaction: Tri | null;
}

const EMPTY: ScanState = { phase: 'idle', source: 'sample', image: null, aspect: 1, result: null, sampleId: null, cooldownS: 0, interaction: null };

let liveProvider: ScanProvider | null = null;
export const getLiveProvider = () => (liveProvider ??= new GeminiProvider(geminiKey(), geminiModel()));

export function useScanner(opts: { history?: boolean } = {}) {
  const keepHistory = opts.history ?? false;
  const [s, setS] = useState<ScanState>(EMPTY);
  const seen = useRef<string[]>([]);
  const abort = useRef<AbortController | null>(null);

  const finish = useCallback((base: Partial<ScanState>, result: ScanResult) => {
    seen.current = [...seen.current, ...medicineNames(result)];
    setS((p) => ({ ...p, ...base, phase: 'result', result, interaction: sampleInteraction(seen.current) }));
    if (!keepHistory) return;
    const item = { source: base.source ?? 'sample', sampleId: base.sampleId ?? undefined, aspect: base.aspect ?? 1, result };
    if (base.source === 'live' && base.image) {
      void makeThumb(base.image).then((thumb) => saveHistory({ ...item, thumb })).catch(() => saveHistory(item));
    } else saveHistory(item);
  }, [keepHistory]);

  /** Show a saved scan from history. */
  const open = useCallback((h: HistoryItem, image: string | null) => {
    setS({ ...EMPTY, phase: 'result', source: h.source, image, aspect: h.aspect, result: h.result, sampleId: (h.sampleId as Sample['id']) ?? null });
  }, []);

  const runSample = useCallback(
    (id: Sample['id']) => {
      const sm = sampleById(id);
      if (!sm) return;
      abort.current?.abort();
      const base = { source: 'sample' as const, image: svgDataUrl(sm.art.svg), aspect: sm.art.width / sm.art.height, sampleId: sm.id };
      setS((p) => ({ ...p, ...base, phase: 'scanning', result: null }));
      // Short beam pass so the scan feels real; always resolves, no network.
      window.setTimeout(() => finish(base, sm.result), prefersReducedMotion() ? 50 : 900);
    },
    [finish],
  );

  const runLive = useCallback(
    async (blob: Blob) => {
      const provider = getLiveProvider();
      if (!provider.available()) {
        setS((p) => ({ ...p, phase: 'unavailable', image: null, result: null }));
        return;
      }
      const left = cooldownLeft();
      if (left > 0) {
        setS((p) => ({ ...p, phase: 'cooldown', cooldownS: Math.ceil(left / 1000) }));
        return;
      }
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      try {
        const img = await prepareImage(blob);
        const base = { source: 'live' as const, image: img.dataUrl, aspect: img.width / img.height, sampleId: null };
        setS((p) => ({ ...p, ...base, phase: 'scanning', result: null }));
        markLiveCall();
        const result = await provider.scanImage(img, ctrl.signal);
        if (!ctrl.signal.aborted) finish(base, result);
      } catch (e) {
        if (ctrl.signal.aborted) return;
        if (!(e instanceof LiveUnavailableError)) console.warn('live scan failed');
        setS((p) => ({ ...p, phase: 'unavailable', result: null }));
      }
    },
    [finish],
  );

  const correct = useCallback((index: number, value: string) => {
    setS((p) => {
      if (!p.result) return p;
      const printed = p.result.printed.map((d, i) => (i === index ? { ...d, value, confidence: 'high' as const, corrected: true } : d));
      return { ...p, result: { ...p.result, printed } };
    });
  }, []);

  /** Clear the current scan (keeps the session list for the sample interaction). */
  const back = useCallback(() => {
    abort.current?.abort();
    setS((p) => ({ ...EMPTY, interaction: p.interaction }));
  }, []);

  /** Forget everything: images, results, interaction history. */
  const reset = useCallback(() => {
    abort.current?.abort();
    seen.current = [];
    setS(EMPTY);
  }, []);

  return useMemo(() => ({ state: s, runSample, runLive, correct, back, reset, open }), [s, runSample, runLive, correct, back, reset, open]);
}
export type Scanner = ReturnType<typeof useScanner>;
