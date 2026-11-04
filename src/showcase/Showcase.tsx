import { useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';
import { Camera } from '../demo/Camera';
import { ResultView } from '../demo/ResultView';
import { Scanning } from '../demo/ScanDemo';
import { useScanner } from '../demo/useScanner';
import { keepAwake } from '../lib/wakeLock';
import { prefersReducedMotion, vibrate } from '../lib/device';
import { SAMPLES } from '../scan/samples';
import { svgDataUrl } from '../scan/sampleArt';
import { useUi } from '../ui/UiContext';

const WORDS = ['TRY SCAN!', 'SCAN ME!', 'DO IT!'];
type Screen = 'attract' | 'camera';

/** Dimmed, untappable attract-loop background. */
function AttractBackground() {
  const arts = SAMPLES().slice(0, 4).map((s) => svgDataUrl(s.art.svg));
  const words = [['Take after food', 'खाने के बाद लें', 'ਖਾਣੇ ਤੋਂ ਬਾਅਦ ਲਓ'], ['Expiry', 'समाप्ति तिथि', 'ਮਿਆਦ']];
  const [k, setK] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setK((x) => x + 1), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-35" aria-hidden data-testid="attract-bg">
      {arts.map((src, i) => (
        <img key={i} src={src} alt="" className="drift absolute w-[46vw] max-w-[360px] rounded-xl" style={{ top: `${8 + i * 22}%`, animationDuration: `${16 + i * 5}s`, animationDelay: `${-i * 4}s`, filter: 'blur(1px)' }} />
      ))}
      <div className="absolute inset-x-0 top-0 h-full">
        <div className="absolute inset-x-0 h-1 bg-mint shadow-[0_0_40px_10px_rgba(94,255,200,.6)]" style={{ animation: 'scanline 3.4s ease-in-out infinite alternate' }} />
      </div>
      <div className="absolute bottom-[6%] left-[5%] right-[5%] text-center text-[9vw] font-extrabold leading-none">
        {words.map((w, j) => (
          <p key={j} lang={['en', 'hi', 'pa'][k % 3]} className="morph-word" style={{ opacity: 0.8 }}>{w[k % 3]}</p>
        ))}
      </div>
      <div className="absolute left-[6%] top-[4%] rounded-xl bg-white/90 p-3 text-ink" style={{ width: '42vw', maxWidth: 300 }}>
        <p className="text-xs font-bold">DEMO CLINIC</p>
        <p className="mt-1 text-lg" style={{ fontFamily: 'cursive', filter: k % 2 ? 'none' : 'blur(2px)', transition: 'filter .8s' }}>Tab. Zentrova 500</p>
        <p className="text-lg" style={{ fontFamily: 'cursive', filter: k % 2 ? 'none' : 'blur(2px)', transition: 'filter .8s' }}>1 – 0 – 1 after food</p>
      </div>
    </div>
  );
}

function PinPad({ onOk, onCancel }: { onOk: () => void; onCancel: () => void }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  const submit = (p: string) => {
    if (p === CONFIG.staffPin) onOk();
    else { setErr(true); setPin(''); }
  };
  const press = (d: string) => {
    const p = (pin + d).slice(0, 8);
    setPin(p);
    setErr(false);
    if (p.length === CONFIG.staffPin.length) submit(p);
  };
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4" role="dialog" aria-modal="true" aria-label="Staff exit" data-testid="pin-pad">
      <div className="w-full max-w-xs rounded-3xl bg-ink-2 p-5 ring-1 ring-white/15">
        <p className="text-center text-lg font-bold">Staff PIN</p>
        <p className="mt-2 text-center text-3xl tracking-[0.5em]" aria-live="polite">{'•'.repeat(pin.length) || ' '}</p>
        {err && <p className="text-center text-coral" role="alert">Wrong PIN</p>}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((d) =>
            d === '' ? <span key="blank" /> : (
              <button key={d} type="button" className="min-h-14 rounded-2xl bg-white/10 text-2xl" aria-label={d === '⌫' ? 'Delete' : d}
                onClick={() => (d === '⌫' ? setPin(pin.slice(0, -1)) : press(d))}>{d}</button>
            ))}
        </div>
        <p className="mt-4 text-xs text-white/60">iPhone: for full screen, use Share → Add to Home Screen, then Guided Access. Android: install the app and use App Pinning. See docs/BOOTH.md.</p>
        <button type="button" className="mt-3 min-h-12 w-full rounded-2xl ring-1 ring-white/25" onClick={onCancel}>Stay in showcase</button>
      </div>
    </div>
  );
}

export function Showcase({ onExit }: { onExit: () => void }) {
  const { t, setLang, setLarge } = useUi();
  const scanner = useScanner();
  const { state } = scanner;
  const [screen, setScreen] = useState<Screen>('attract');
  const [word, setWord] = useState(0);
  const [slam, setSlam] = useState(0);
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
    document.title = 'Remed-AI · Showcase';
    document.body.style.overscrollBehavior = 'none';
    return () => { document.body.style.overscrollBehavior = ''; };
  }, []);

  // Cycle the button words; each change slams the button against the glass.
  useEffect(() => {
    if (screen !== 'attract') return;
    const id = setInterval(() => { setWord((w) => (w + 1) % WORDS.length); setSlam((s) => s + 1); }, 1700);
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
    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
    try {
      if (!document.fullscreenElement && el.requestFullscreen) void el.requestFullscreen().catch(() => {});
    } catch { /* unsupported (iPhone Safari): Add to Home Screen instead */ }
    setBursting(true);
    window.setTimeout(() => { setScreen('camera'); setBursting(false); }, prefersReducedMotion() ? 0 : 420);
  };

  const startHold = () => {
    clearTimeout(holdT.current); clearInterval(holdTick.current);
    const t0 = Date.now();
    setHold(0.001);
    holdTick.current = window.setInterval(() => setHold(Math.min(1, (Date.now() - t0) / CONFIG.exitHoldMs)), 100);
    holdT.current = window.setTimeout(() => { clearInterval(holdTick.current); setHold(0); setPin(true); }, CONFIG.exitHoldMs);
  };
  const endHold = () => { clearTimeout(holdT.current); clearInterval(holdTick.current); setHold(0); };

  const scanning = state.phase === 'scanning' || state.phase === 'result';

  return (
    <main className="fixed inset-0 overflow-y-auto bg-ink text-white" data-testid="showcase" style={{ touchAction: 'manipulation' }}>
      {screen === 'attract' && (
        <div className="relative grid min-h-[100svh] place-items-center overflow-hidden">
          <AttractBackground />
          <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
            <p className="kicker">Remed-AI</p>
            <button type="button" onClick={tryScan} aria-label="Try scan" data-testid="try-scan"
              className="relative grid place-items-center" style={{ width: 'min(88vw, 62vh, 620px)', height: 'min(40vh, 70vw, 440px)' }}>
              <span className={`try-btn absolute inset-0 grid place-items-center ${bursting ? 'burst' : 'try-motion'}`} style={{ borderRadius: '42%' }}>
                <span key={slam} className="slam block text-[clamp(3rem,15vw,8rem)] leading-none" aria-hidden>{WORDS[word]}</span>
                <span key={`s${slam}`} className="shockwave" style={{ borderRadius: '42%' }} aria-hidden />
              </span>
            </button>
            <p className="text-xl font-semibold text-white/85">Scan any medicine. Understand it in your language.</p>
            <p className="underheading">Not professional medical advice.</p>
          </div>
        </div>
      )}

      {screen === 'camera' && (
        <div className="fade-in mx-auto min-h-[100svh] max-w-3xl px-4 pb-28 pt-6">
          {!scanning && state.phase !== 'unavailable' && (
            <>
              <p className="text-center text-[clamp(1.8rem,7vw,3rem)] font-extrabold leading-tight glow-mint" data-testid="point-me">{t('pointMe')}</p>
              <p className="mt-1 text-center text-sm text-white/60">Not professional medical advice.</p>
              {!consented && (
                <div className="mt-4 rounded-3xl border border-coral/60 bg-coral/10 p-4" data-testid="consent">
                  <p className="text-lg font-semibold">{t('consent')}</p>
                  <button type="button" className="btn-coral mt-3 min-h-14 w-full text-xl" onClick={() => setConsented(true)} data-testid="consent-ok">{t('consentOk')}</button>
                </div>
              )}
              <div className="mt-4"><Camera big armed={consented} onCapture={(b) => void scanner.runLive(b)} /></div>
              {state.phase === 'cooldown' && <p className="mt-3 text-center" role="status">{t('cooldown', { s: state.cooldownS })}</p>}
            </>
          )}
          {state.phase === 'unavailable' && (
            <p role="alert" className="rounded-3xl bg-coral/15 p-5 text-center text-2xl font-bold text-coral" data-testid="live-unavailable">{t('liveUnavailable')}</p>
          )}
          {state.phase === 'scanning' && <div className="mt-4"><Scanning image={state.image} aspect={state.aspect} /></div>}
          {state.phase === 'result' && state.result && (
            <div className="mt-2">
              <div className="mb-4 flex flex-wrap justify-center gap-2" aria-hidden>
                {state.result.printed.slice(0, 4).map((p, i) => (
                  <span key={i} className="lift rounded-full bg-white/10 px-3 py-1 text-sm" style={{ animationDelay: `${i * 0.08}s` }}>{p.value}</span>
                ))}
              </div>
              <div className="lift" style={{ animationDelay: '0.35s' }}>
                <ResultView compact state={state} onCorrect={scanner.correct} onRescan={scanner.back} onAnother={scanner.back} anotherLabel={t('scanMe')} />
              </div>
            </div>
          )}
          {!scanning && (
            <div className="mt-6">
              <p className="text-center text-sm text-white/70">{t('tapSample')}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {SAMPLES().map((s) => (
                  <button key={s.id} type="button" className="min-h-12 rounded-full bg-white/10 px-4 ring-1 ring-white/20" onClick={() => scanner.runSample(s.id)} data-testid={`sc-sample-${s.id}`}>
                    <span className="badge badge-sample mr-2">Sample</span>{s.label.en}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {still && (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-black/80 p-6 text-center" role="alertdialog" aria-label={t('stillThere')} data-testid="still-there">
          <div>
            <p className="text-6xl font-extrabold">{t('stillThere')}</p>
            <button type="button" className="btn-coral mt-6 min-h-16 px-10 text-2xl" onClick={armIdle}>{t('imHere')}</button>
          </div>
        </div>
      )}

      {/* Staff exit: hold bottom-right for 5 s, then PIN. */}
      <div className="fixed bottom-0 right-0 z-[96] size-20 select-none" data-testid="exit-hotspot" aria-hidden
        onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold} onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: 'none', WebkitTouchCallout: 'none' }}>
        {hold > 0 && <div className="absolute inset-3 rounded-full border-4 border-mint/70" style={{ clipPath: `inset(${100 - hold * 100}% 0 0 0)` }} />}
      </div>
      {pin && <PinPad onOk={() => { setPin(false); resetAll(); onExit(); }} onCancel={() => setPin(false)} />}
    </main>
  );
}
