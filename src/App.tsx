import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG } from './config';
import { useScanner } from './demo/useScanner';
import { ScanDemo } from './demo/ScanDemo';
import { LangBar } from './demo/LangBar';
import { Hero, zoomToDemo } from './sections/Hero';
import { Problem, Steps } from './sections/Story';
import { Beam, Explode, LanguageMorph } from './sections/ScrollFx';
import { Features, InfoBlocks } from './sections/Info';
import { JudgeTour } from './sections/JudgeTour';

const Showcase = lazy(() => import('./showcase/Showcase').then((m) => ({ default: m.Showcase })));

const inShowcaseUrl = () => new URLSearchParams(location.search).get('showcase') === '1';

/** Five taps in the top-left corner within 3 seconds opens showcase mode. */
function EntryHotspot({ onEnter }: { onEnter: () => void }) {
  const taps = useRef<number[]>([]);
  return (
    <div
      className="fixed left-0 top-0 z-[75] size-16"
      data-testid="entry-hotspot"
      aria-hidden
      onPointerDown={() => {
        const now = Date.now();
        taps.current = [...taps.current.filter((x) => now - x < CONFIG.entryWindowMs), now];
        if (taps.current.length >= CONFIG.entryTaps) {
          taps.current = [];
          onEnter();
        }
      }}
    />
  );
}

function Site({ onShowcase }: { onShowcase: () => void }) {
  const scanner = useScanner();
  const phone = useRef<HTMLDivElement>(null);
  return (
    <div className="grain">
      <EntryHotspot onEnter={onShowcase} />
      <a href="#demo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-mint focus:px-4 focus:py-2 focus:text-ink">Skip to live demo</a>
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-4 md:px-10">
        <span className="pl-12 text-lg font-extrabold tracking-tight md:pl-0" style={{ fontStretch: '125%' }}>Remed<span className="text-mint">-AI</span></span>
        <nav className="hidden gap-6 text-white/75 md:flex" aria-label="Sections">
          <a href="#demo">Demo</a><a href="#how">How</a><a href="#features">Features</a><a href="#safety">Safety</a><a href="#judge">Judges</a>
        </nav>
      </header>
      <main>
        <Hero phoneRef={phone} />
        <section id="demo" className="relative mx-auto max-w-7xl scroll-mt-4 px-4 py-20 md:px-10" aria-labelledby="demo-title">
          <p className="kicker">Live demo</p>
          <h2 id="demo-title" tabIndex={-1} className="huge mt-3 outline-none">Try it yourself.</h2>
          <p className="underheading mt-3">Not professional medical advice.</p>
          <div className="mt-4"><LangBar dark /></div>
          <div className="mt-8"><ScanDemo scanner={scanner} /></div>
        </section>
        <Problem />
        <Steps />
        <Explode />
        <Beam />
        <LanguageMorph />
        <Features />
        <InfoBlocks />
        <JudgeTour scanner={scanner} />
      </main>
      <footer className="px-4 pb-40 pt-10 text-center text-white/60 md:px-10">
        <p className="font-semibold text-white/80">Remed-AI demo · Not professional medical advice.</p>
        <p className="mt-1 text-sm">All sample medicines, the prescription and the lab report are fictional and marked DEMO ONLY.</p>
        <p className="mt-1 text-sm">
          Printable sample items: <a className="underline" href={`${import.meta.env.BASE_URL}booth/print.html`}>booth/print.html</a>
        </p>
      </footer>
      <div className="fixed inset-x-0 bottom-0 z-[72] flex justify-center px-4" style={{ paddingBottom: 'calc(12px + var(--safe-b))' }}>
        <button type="button" className="btn-coral min-h-14 w-full max-w-md text-xl md:w-auto md:px-10" onClick={() => zoomToDemo(phone.current)} data-testid="sticky-try">
          Try a sample scan
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [showcase, setShowcase] = useState(inShowcaseUrl);
  useEffect(() => {
    const on = () => setShowcase(inShowcaseUrl());
    addEventListener('popstate', on);
    return () => removeEventListener('popstate', on);
  }, []);
  const enter = useCallback(() => {
    history.pushState(null, '', `${location.pathname}?showcase=1`);
    setShowcase(true);
  }, []);
  const exit = useCallback(() => {
    history.replaceState(null, '', location.pathname);
    document.title = 'Remed-AI · Scan any medicine';
    setShowcase(false);
    window.scrollTo(0, 0);
  }, []);
  if (showcase) {
    return (
      <Suspense fallback={<div className="grid min-h-[100svh] place-items-center text-mint">Remed-AI</div>}>
        <Showcase onExit={exit} />
      </Suspense>
    );
  }
  return <Site onShowcase={enter} />;
}
