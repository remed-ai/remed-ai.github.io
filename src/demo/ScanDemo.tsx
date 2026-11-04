import { useState } from 'react';
import { SAMPLES, type Sample } from '../scan/samples';
import { svgDataUrl } from '../scan/sampleArt';
import { store } from '../lib/storage';
import { useUi } from '../ui/UiContext';
import { Camera } from './Camera';
import { ResultView } from './ResultView';
import type { Scanner } from './useScanner';

/** One-tap sample chips. Always work offline. */
export function SampleChips({ onPick, prefix = 'sample' }: { onPick: (id: Sample['id']) => void; prefix?: string }) {
  const { lang } = useUi();
  return (
    <ul className="flex flex-wrap gap-2" data-testid="sample-cards">
      {SAMPLES().map((s) => (
        <li key={s.id}>
          <button type="button" onClick={() => onPick(s.id)} data-testid={`${prefix}-${s.id}`}
            className="flex items-center gap-2 rounded-full border border-ink/10 bg-white py-1.5 pl-1.5 pr-4 text-base shadow-sm active:scale-[.98]">
            <img src={svgDataUrl(s.art.svg)} alt="" className="h-9 w-12 rounded-full bg-cream object-contain" />
            {s.label[lang] || s.label.en}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Scanning({ image, aspect }: { image: string | null; aspect: number }) {
  const { t } = useUi();
  return (
    <div className="card mx-auto w-full max-w-xl overflow-hidden" role="status" aria-live="polite">
      {image && (
        <div className="relative w-full bg-sand" style={{ aspectRatio: String(aspect) }}>
          <img src={image} alt="" className="absolute inset-0 size-full object-contain" />
          <div className="beam-sweep" aria-hidden />
        </div>
      )}
      <p className="p-4 text-center text-lg font-semibold text-accent-dark">{t('reading')}</p>
    </div>
  );
}

const VOICE_KEY = 'remed.voice';

/** The /scan page: take or upload a photo, or tap a sample. */
export function ScanPanel({ scanner }: { scanner: Scanner }) {
  const { t } = useUi();
  const { state, runSample, runLive, correct, back } = scanner;
  const [consented, setConsented] = useState(() => store.get(CONSENT_KEY, false));
  const [camera, setCamera] = useState(false);
  const [voice, setVoice] = useState(() => store.get(VOICE_KEY, false));

  const toggleVoice = () => { setVoice(!voice); store.set(VOICE_KEY, !voice); };
  const okConsent = () => { setConsented(true); store.set(CONSENT_KEY, true); };
  const live = (b: Blob) => { setCamera(false); void runLive(b); };

  if (state.phase === 'scanning') return <Scanning image={state.image} aspect={state.aspect} />;
  if (state.phase === 'result' && state.result) {
    return <ResultView state={state} onCorrect={correct} onRescan={back} onAnother={back} autoRead={voice} />;
  }

  return (
    <div className="grid gap-5">
      {state.phase === 'unavailable' && (
        <p role="alert" className="rounded-2xl bg-accent/10 p-4 text-xl font-bold text-accent-dark" data-testid="live-unavailable">{t('liveUnavailable')}</p>
      )}
      {state.phase === 'cooldown' && <p role="status" className="rounded-2xl bg-amber/20 p-4 text-lg">{t('cooldown', { s: state.cooldownS })}</p>}

      {!consented ? (
        <div className="card p-5" data-testid="consent">
          <p className="text-lg">{t('privacyShort')}</p>
          <button type="button" onClick={okConsent} className="btn-primary mt-4 w-full text-lg" data-testid="consent-ok">{t('ok')}</button>
        </div>
      ) : camera ? (
        <div className="grid gap-3">
          <Camera onCapture={live} />
          <button type="button" className="btn-quiet" onClick={() => setCamera(false)}>{t('cancel')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setCamera(true)} className="card flex aspect-square flex-col items-center justify-center gap-2 text-xl font-bold" data-testid="take-photo">
            <span className="text-5xl" aria-hidden>📷</span>{t('takePhotoBig')}
          </button>
          <label className="card flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 text-xl font-bold">
            <span className="text-5xl" aria-hidden>🖼️</span>{t('uploadBig')}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && live(e.target.files[0])} data-testid="upload-input" />
          </label>
        </div>
      )}

      <button type="button" className="btn-quiet justify-self-start" aria-pressed={voice} onClick={toggleVoice} data-testid="voice-toggle">
        🔊 {t('voiceOn')}
      </button>

      <div>
        <p className="mb-2 text-muted">{t('orSample')}</p>
        <SampleChips onPick={runSample} />
      </div>
    </div>
  );
}
export const CONSENT_KEY = 'remed.consent';
