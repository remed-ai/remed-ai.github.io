import { useEffect, useState } from 'react';
import { SAMPLES, type Sample } from '../scan/samples';
import { svgDataUrl } from '../scan/sampleArt';
import { store } from '../lib/storage';
import { useUi } from '../ui/UiContext';
import { IconWarn } from '../ui/icons';
import { Camera } from './Camera';
import { ResultView } from './ResultView';
import type { Scanner } from './useScanner';

export const CONSENT_KEY = 'remed.consent';

/** Sample items as quiet list rows (used as a fallback when live scanning fails). */
export function SampleChips({ onPick, prefix = 'sample' }: { onPick: (id: Sample['id']) => void; prefix?: string }) {
  const { lang } = useUi();
  return (
    <ul className="grid gap-2" data-testid="sample-cards">
      {SAMPLES().map((s) => (
        <li key={s.id}>
          <button type="button" onClick={() => onPick(s.id)} data-testid={`${prefix}-${s.id}`} className="detail flex items-center gap-3">
            <img src={svgDataUrl(s.art.svg)} alt="" className="h-11 w-14 flex-none rounded-md bg-sunken object-contain" />
            <span className="min-w-0">
              <span className="block font-bold">{s.label[lang] || s.label.en}</span>
              <span className="block text-sm text-ink-faint">{s.hint[lang] || s.hint.en}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Scanning({ image }: { image: string | null; aspect?: number }) {
  const { t } = useUi();
  return (
    <div className="flex flex-col items-center gap-6 pt-10" role="status" aria-live="polite">
      <div className="relative h-[270px] w-[210px] overflow-hidden bg-sunken" style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}>
        {image && <img src={image} alt="" className="size-full object-cover" />}
        <div className="scan-sweep" aria-hidden />
      </div>
      <h2 className="text-xl">{t('readingNow')}</h2>
    </div>
  );
}

/** The scan flow: privacy note (once) → viewfinder → reading → result. */
export function ScanPanel({ scanner, autoRead = false }: { scanner: Scanner; autoRead?: boolean }) {
  const { t } = useUi();
  const { state, runSample, runLive, correct, back } = scanner;
  const [consented, setConsented] = useState(() => store.get(CONSENT_KEY, false));

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('sample') as Sample['id'] | null;
    if (id && SAMPLES().some((s) => s.id === id)) runSample(id);
  }, [runSample]);

  if (state.phase === 'scanning') return <Scanning image={state.image} />;
  if (state.phase === 'result' && state.result) {
    return <ResultView state={state} onCorrect={correct} onRescan={back} onAnother={back} autoRead={autoRead} />;
  }
  if (state.phase === 'unavailable') {
    return (
      <div className="rise">
        <div className="card p-6 text-center" role="alert">
          <IconWarn size={34} className="mx-auto mb-2 text-brick" />
          <h2 className="text-xl" data-testid="live-unavailable">{t('liveUnavailable')}</h2>
          <button type="button" className="btn-primary mt-4 w-full" onClick={back}>{t('tryAgain')}</button>
        </div>
        <p className="eyebrow mb-2 mt-6">{t('tryTheseInstead')}</p>
        <SampleChips onPick={runSample} />
      </div>
    );
  }
  if (!consented) {
    return (
      <div className="card rise p-6" data-testid="consent">
        <p className="text-lg">{t('privacyShort')}</p>
        <button type="button" className="btn-primary mt-5 w-full" data-testid="consent-ok" onClick={() => { setConsented(true); store.set(CONSENT_KEY, true); }}>{t('ok')}</button>
      </div>
    );
  }
  return (
    <div className="rise">
      {state.phase === 'cooldown' && <p role="status" className="mb-3 rounded-xl bg-marigold-tint px-3 py-2 font-bold text-marigold-deep">{t('cooldown', { s: state.cooldownS })}</p>}
      <Camera onCapture={(b) => void runLive(b)} />
    </div>
  );
}
