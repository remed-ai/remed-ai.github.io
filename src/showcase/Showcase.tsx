import { useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';
import { Camera } from '../demo/Camera';
import { ResultView } from '../demo/ResultView';
import { SampleChips, Scanning } from '../demo/ScanDemo';
import { useScanner } from '../demo/useScanner';
import { LangBar } from '../demo/LangBar';
import { keepAwake } from '../lib/wakeLock';
import { prefersReducedMotion, vibrate } from '../lib/device';
import { useUi } from '../ui/UiContext';

const WORDS = ['TRY SCAN!', 'SCAN ME!', 'DO IT!'];
const PHRASES = ['Take after food', 'खाने के बाद लें', 'ਖਾਣੇ ਤੋਂ ਬਾਅਦ ਲਓ'];

function PinPad({ onOk, onCancel }: { onOk: () => void; onCancel: () => void }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  const press = (d: string) => {
    const p = (pin + d).slice(0, 8);
    setErr(false);
    if (p.length < CONFIG.staffPin.length) return setPin(p);
    if (p === CONFIG.staffPin) onOk();
    else { setErr(true); setPin(''); }
  };
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-label="Staff exit" data-testid="pin-pad">
      <div className="card w-full max-w-xs p-5">
        <p className="text-center text-lg font-bold">Staff PIN</p>
        <p className="mt-2 text-center text-3xl tracking-[0.5em]" aria-live="polite">{'•'.repeat(pin.length) || ' '}</p>
        {err && <p className="text-center font-semibold text-accent-dark" role="alert">Wrong PIN</p>}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((d) =>
            d === '' ? <span key="blank" /> : (
              <button key={d} type="button" className="min-h-14 rounded-2xl bg-sand text-2xl" aria-label={d === '⌫' ? 'Delete' : d}
                onClick={() => (d === '⌫' ? setPin(pin.slice(0, -1)) : press(d))}>{d}</button>
            ))}
        </div>
        <button type="button" className="btn-quiet mt-4 w-full" onClick={onCancel}>Stay in booth mode</button>
      </div>
    </div>
  );
}

/** Self-running booth mode. Opened from /demo. */
export function Showcase({ onExit }: { onExit: () => void }) {
  const { t, setLang, setLarge } = useUi();
  const scanner = useScanner();
  const { state } = scanner;
  const [screen, setScreen] = useState<'attract' | 'camera'>('attract');
  const [word, setWord] = useState(0);
  const [bursting, setBursting] = useState(false);
  const [consented, setConsented] = useState(false);
  const [still, setStill] = useState(false);
  const [pin, setPin] = useState(false);
  const [hold, setHold] = useState(0);
  const idle = useRef<number | undefined>(undefined);
  const resetT = useRef<number | undefined>(undefined);
  const holdT = useRef<number | undefined>(undefined);
  const holdTick = useRef<number | undefined>(undefined);

  useEffect(() => keepAwake(), []);
  useEffect(() => {
    if (screen !== 'attract') return;
    const id = setInterval(() => setWord((w) => w + 1), 1700);
    return () => clearInterval(id);
  }, [screen]);

  const resetAll = useCallback(() => {
    clearTimeout(idle.current); clearTimeout(resetT.current);
    setStill(false);
    scanner.reset();
    setLang('en');
    setLarge(false);
    setConsented(false);
    setBursting(false);
    setScreen('attract');
    window.scrollTo(0, 0);
  }, [scanner, setLang, setLarge]);

  const armIdle = useCallback(() => {
    clearTimeout(idle.current); clearTimeout(resetT.current);
    setStill(false);
    if (screen === 'attract') return;
    idle.current = window.setTimeout(() => {
      setStill(true);
      resetT.current = window.setTimeout(resetAll, CONFIG.stillThereMs);
    }, CONFIG.idleMs);
  }, [screen, resetAll]);

  useEffect(() => {
    armIdle();
    const on = () => armIdle();
    const evs = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const;
    evs.forEach((e) => addEventListener(e, on, { passive: true }));
    return () => { evs.forEach((e) => removeEventListener(e, on)); clearTimeout(idle.current); clearTimeout(resetT.current); };
  }, [armIdle]);

  const tryScan = () => {
    vibrate(35);
    try {
      if (!document.fullscreenElement) void document.documentElement.requestFullscreen?.().catch(() => {});
    } catch { /* iPhone Safari: use Add to Home Screen */ }
    setBursting(true);
    window.setTimeout(() => { setScreen('camera'); setBursting(false); }, prefersReducedMotion() ? 0 : 400);
  };

  const startHold = () => {
    const t0 = Date.now();
    setHold(0.001);
    holdTick.current = window.setInterval(() => setHold(Math.min(1, (Date.now() - t0) / CONFIG.exitHoldMs)), 100);
    holdT.current = window.setTimeout(() => { clearInterval(holdTick.current); setHold(0); setPin(true); }, CONFIG.exitHoldMs);
  };
  const endHold = () => { clearTimeout(holdT.current); clearInterval(holdTick.current); setHold(0); };
  const busy = state.phase === 'scanning' || state.phase === 'result';

  return (
    <main className="fixed inset-0 overflow-y-auto bg-cream" data-testid="showcase" style={{ touchAction: 'manipulation' }}>
      {screen === 'attract' && (
        <div className="relative grid min-h-[100svh] place-items-center overflow-hidden px-4 text-center">
          <p className="pointer-events-none absolute inset-x-0 bottom-[8%] text-[8vw] font-extrabold text-ink/10" aria-hidden data-testid="attract-bg">
            {PHRASES[word % 3]}
          </p>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <p className="text-3xl font-extrabold">Remed<span className="text-accent">-AI</span></p>
            <button type="button" onClick={tryScan} aria-label="Try scan" data-testid="try-scan" className="relative"
              style={{ width: 'min(84vw, 58vh, 560px)', height: 'min(38vh, 64vw, 420px)' }}>
              <span className={`scan-orb absolute inset-0 grid place-items-center ${bursting ? 'burst' : 'try-motion'}`} style={{ borderRadius: '42%' }}>
                <span key={word} className="slam block text-[clamp(2.8rem,14vw,7rem)] leading-none" aria-hidden>{WORDS[word % 3]}</span>
                <span key={`s${word}`} className="shockwave" style={{ borderRadius: '42%' }} aria-hidden />
              </span>
            </button>
            <p className="text-xl font-semibold">{t('welcome')}</p>
            <p className="underheading">Not professional medical advice.</p>
          </div>
        </div>
      )}

      {screen === 'camera' && (
        <div className="fade-in mx-auto min-h-[100svh] max-w-3xl px-4 pb-28 pt-5">
          <div className="mb-3 flex justify-end"><LangBar /></div>
          {!busy && state.phase !== 'unavailable' && (
            <>
              <p className="text-center text-[clamp(1.8rem,7vw,2.8rem)] font-extrabold leading-tight" data-testid="point-me">{t('pointMe')}</p>
              {!consented && (
                <div className="card mt-4 p-4" data-testid="consent">
                  <p className="text-lg">{t('privacyShort')}</p>
                  <button type="button" className="btn-primary mt-3 w-full text-xl" onClick={() => setConsented(true)} data-testid="consent-ok">{t('ok')}</button>
                </div>
              )}
              <div className="mt-4"><Camera big armed={consented} onCapture={(b) => void scanner.runLive(b)} /></div>
              {state.phase === 'cooldown' && <p className="mt-3 text-center" role="status">{t('cooldown', { s: state.cooldownS })}</p>}
            </>
          )}
          {state.phase === 'unavailable' && (
            <p role="alert" className="rounded-3xl bg-accent/10 p-5 text-center text-2xl font-bold text-accent-dark" data-testid="live-unavailable">{t('liveUnavailable')}</p>
          )}
          {state.phase === 'scanning' && <Scanning image={state.image} aspect={state.aspect} />}
          {state.phase === 'result' && state.result && (
            <div className="lift">
              <ResultView compact state={state} onCorrect={scanner.correct} onRescan={scanner.back} onAnother={scanner.back} anotherLabel={t('scanMe')} />
            </div>
          )}
          {!busy && (
            <div className="mt-6">
              <p className="mb-2 text-center text-muted">{t('orSample')}</p>
              <div className="flex justify-center"><SampleChips onPick={scanner.runSample} prefix="sc-sample" /></div>
            </div>
          )}
        </div>
      )}

      {still && (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-cream/95 p-6 text-center" role="alertdialog" aria-label={t('stillThere')} data-testid="still-there">
          <div>
            <p className="text-6xl font-extrabold">{t('stillThere')}</p>
            <button type="button" className="btn-primary mt-6 min-h-16 px-10 text-2xl" onClick={armIdle}>{t('imHere')}</button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 right-0 z-[96] size-20 select-none" data-testid="exit-hotspot" aria-hidden
        onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold} onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: 'none', WebkitTouchCallout: 'none' }}>
        {hold > 0 && <div className="absolute inset-3 rounded-full border-4 border-accent/70" style={{ clipPath: `inset(${100 - hold * 100}% 0 0 0)` }} />}
      </div>
      {pin && <PinPad onOk={() => { setPin(false); resetAll(); onExit(); }} onCancel={() => setPin(false)} />}
    </main>
  );
}
