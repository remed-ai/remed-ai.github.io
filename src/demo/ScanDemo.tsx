import { useRef, useState } from 'react';
import { SAMPLES, type Sample } from '../scan/samples';
import { svgDataUrl } from '../scan/sampleArt';
import { useUi } from '../ui/UiContext';
import { Camera } from './Camera';
import { ResultView } from './ResultView';
import type { Scanner } from './useScanner';

export function SampleCards({ onPick, dark = true }: { onPick: (id: Sample['id']) => void; dark?: boolean }) {
  const { t, lang } = useUi();
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" data-testid="sample-cards">
      {SAMPLES().map((s) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => onPick(s.id)}
            data-testid={`sample-${s.id}`}
            className={`group flex h-full w-full flex-col overflow-hidden rounded-2xl text-left ring-1 transition active:scale-[.98] ${dark ? 'bg-white/[0.06] ring-white/15 hover:ring-mint' : 'bg-white ring-black/10'}`}
          >
            <span className="block aspect-[4/3] w-full bg-white p-2">
              <img src={svgDataUrl(s.art.svg)} alt="" className="size-full object-contain" loading="lazy" />
            </span>
            <span className="flex flex-1 flex-col gap-1 p-3">
              <span className="badge badge-sample self-start">Sample</span>
              <span className="text-base font-bold leading-tight">{s.label[lang] || s.label.en}</span>
              <span className={`text-sm ${dark ? 'text-white/60' : 'text-black/60'}`}>{s.hint[lang] || s.hint.en}</span>
            </span>
          </button>
        </li>
      ))}
      <li className="col-span-2 self-center text-sm text-white/60 sm:col-span-1">{t('tapSample')}</li>
    </ul>
  );
}

export function ConsentGate({ onOk }: { onOk: () => void }) {
  const { t } = useUi();
  return (
    <div className="rounded-3xl border border-coral/50 bg-coral/10 p-5" data-testid="consent">
      <p className="text-lg font-semibold leading-snug">{t('consent')}</p>
      <button type="button" onClick={onOk} className="btn-coral mt-4 min-h-14 px-6 text-lg" data-testid="consent-ok">{t('consentOk')}</button>
    </div>
  );
}

export function Scanning({ image, aspect }: { image: string | null; aspect: number }) {
  const { t } = useUi();
  return (
    <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white/5" role="status" aria-live="polite">
      {image && (
        <div className="relative w-full" style={{ aspectRatio: String(aspect) }}>
          <img src={image} alt="" className="absolute inset-0 size-full object-contain opacity-80" />
          <div className="beam-sweep" aria-hidden />
        </div>
      )}
      <p className="p-4 text-center text-lg text-mint">{t('reading')}</p>
    </div>
  );
}

type Mode = 'samples' | 'camera' | 'upload';

/** The live demo section: samples, camera, upload → calm result. */
export function ScanDemo({ scanner }: { scanner: Scanner }) {
  const { t } = useUi();
  const { state, runSample, runLive, correct, back } = scanner;
  const [mode, setMode] = useState<Mode>('samples');
  const [consented, setConsented] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const focusTop = () => top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  const pick = (id: Sample['id']) => { runSample(id); setTimeout(focusTop, 50); };

  return (
    <div ref={top} className="scroll-mt-20">
      {state.phase === 'scanning' && <Scanning image={state.image} aspect={state.aspect} />}
      {state.phase === 'result' && state.result && (
        <ResultView state={state} onCorrect={correct} onRescan={back} onAnother={back} />
      )}

      {(state.phase === 'idle' || state.phase === 'unavailable' || state.phase === 'cooldown') && (
        <div className="grid gap-5">
          {state.phase === 'unavailable' && (
            <p role="alert" className="rounded-2xl bg-coral/15 p-4 text-xl font-bold text-coral" data-testid="live-unavailable">{t('liveUnavailable')}</p>
          )}
          {state.phase === 'cooldown' && (
            <p role="status" className="rounded-2xl bg-white/10 p-4 text-lg">{t('cooldown', { s: state.cooldownS })}</p>
          )}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Scan method">
            {(['samples', 'camera', 'upload'] as Mode[]).map((m) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
                className={`min-h-12 rounded-full px-5 text-base font-semibold ring-1 ${mode === m ? 'bg-mint text-ink ring-mint' : 'ring-white/25'}`}>
                {m === 'samples' ? t('samples') : m === 'camera' ? t('camera') : t('upload')}
                {m !== 'samples' && <span className="ml-2 text-xs opacity-70">Live</span>}
              </button>
            ))}
          </div>
          {(mode === 'samples' || state.phase === 'unavailable') && <SampleCards onPick={pick} />}
          {mode !== 'samples' && state.phase !== 'unavailable' && !consented && <ConsentGate onOk={() => setConsented(true)} />}
          {mode === 'camera' && consented && <Camera onCapture={(b) => void runLive(b)} />}
          {mode === 'upload' && consented && (
            <label className="btn-coral flex min-h-16 cursor-pointer items-center justify-center text-xl">
              {t('upload')}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && void runLive(e.target.files[0])} data-testid="upload-input" />
            </label>
          )}
          <p className="text-sm text-white/60">{t('consent')}</p>
        </div>
      )}
    </div>
  );
}
