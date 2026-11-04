import { lazy, Suspense, useEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { canUse3D, motionNeedsPermission, prefersReducedMotion, requestMotionPermission, useReducedMotion } from '../lib/device';
import { zentrovaFront, svgDataUrl } from '../scan/sampleArt';

const HeroScene = lazy(() => import('../three/HeroScene'));

/** Zoom the phone forward until its screen becomes the demo, then land on #demo. */
export function zoomToDemo(from: HTMLElement | null) {
  const demo = document.getElementById('demo');
  if (!demo) return;
  const land = () => {
    demo.scrollIntoView({ behavior: 'auto', block: 'start' });
    (document.getElementById('demo-title') as HTMLElement | null)?.focus({ preventScroll: true });
  };
  const r = from?.getBoundingClientRect();
  if (prefersReducedMotion() || !r || r.bottom < 0 || r.top > innerHeight) return land();
  const o = document.createElement('div');
  Object.assign(o.style, {
    position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, zIndex: '85',
    borderRadius: '2.6rem', background: 'radial-gradient(ellipse at 50% 40%, #12302a, #07090a 70%)',
    boxShadow: '0 0 0 10px #15191b, 0 0 120px rgba(94,255,200,.5)', pointerEvents: 'none',
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(o);
  gsap.to(o, {
    left: 0, top: 0, width: innerWidth, height: innerHeight, borderRadius: 0, duration: 0.6, ease: 'power3.in',
    onComplete: () => {
      land();
      gsap.to(o, { opacity: 0, duration: 0.4, delay: 0.05, onComplete: () => o.remove() });
    },
  });
}

function CssStrip() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const art = useRef(svgDataUrl(zentrovaFront().svg));
  useEffect(() => {
    if (reduced) return;
    const on = (e: PointerEvent) => {
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      if (ref.current) ref.current.style.transform = `perspective(900px) rotateX(${32 - y * 20}deg) rotateY(${-18 + x * 30}deg) rotateZ(10deg) translateZ(40px)`;
    };
    addEventListener('pointermove', on);
    return () => removeEventListener('pointermove', on);
  }, [reduced]);
  return (
    <div className="absolute right-[4%] top-[48%] w-[62vw] max-w-[440px] md:right-[8%] md:top-[18%] md:w-[34vw]">
      <div ref={ref} className="transition-transform duration-300" style={{ transform: 'perspective(900px) rotateX(32deg) rotateY(-18deg) rotateZ(10deg) translateZ(40px)' }}>
        <img src={art.current} alt="" className="w-full rounded-2xl" style={{ filter: 'drop-shadow(0 40px 40px rgba(0,0,0,.7)) drop-shadow(0 0 30px rgba(94,255,200,.25))' }} />
      </div>
    </div>
  );
}

export function Hero({ phoneRef }: { phoneRef: RefObject<HTMLDivElement | null> }) {
  const [use3D] = useState(canUse3D);
  const [visible, setVisible] = useState(true);
  const [needTilt, setNeedTilt] = useState(false);
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    setNeedTilt(use3D && motionNeedsPermission());
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    if (section.current) io.observe(section.current);
    return () => io.disconnect();
  }, [use3D]);

  return (
    <section ref={section} id="top" className="relative min-h-[100svh] overflow-hidden pb-28" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute inset-0" aria-hidden
        style={{ background: 'radial-gradient(60% 45% at 70% 60%, rgba(94,255,200,.13), transparent 70%), radial-gradient(40% 30% at 15% 10%, rgba(255,90,70,.12), transparent 70%)' }} />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 pt-20 md:grid-cols-[1.25fr_1fr] md:items-center md:px-10 md:pt-28">
        <div>
          <p className="kicker">Remed-AI · live demo</p>
          <h1 id="hero-title" className="mt-4 font-extrabold" style={{ fontStretch: '118%', lineHeight: 0.9, letterSpacing: '-0.035em', fontSize: 'clamp(2.9rem, 12.4vw, 8.4rem)' }}>
            Scan any medicine.{' '}
            <span className="glow-mint">Understand it</span> in your language.
          </h1>
          <p className="underheading mt-5 text-lg" data-testid="underheading">Not professional medical advice.</p>
          <p className="mt-3 max-w-xl text-lg text-white/75">
            Point a phone at a tablet strip, the back of a strip, a prescription or a lab report. Remed-AI separates what is printed from what it means, in English, हिन्दी and ਪੰਜਾਬੀ.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button type="button" className="btn-coral min-h-14 px-7 text-xl" onClick={() => zoomToDemo(phoneRef.current)} data-testid="hero-try">
              Try a sample scan
            </button>
            {needTilt && (
              <button type="button" className="min-h-12 rounded-full px-4 text-white/80 ring-1 ring-white/25" onClick={async () => setNeedTilt(!(await requestMotionPermission()))}>
                Tilt to play
              </button>
            )}
          </div>
        </div>

        <div className="relative mx-auto w-[64vw] max-w-[330px] md:w-full">
          <div ref={phoneRef} className="phone-frame" data-testid="hero-phone">
            <div className="phone-screen">
              <div className="depth-box" aria-hidden>
                <div className="wall floor" /><div className="wall ceil" /><div className="wall lw" /><div className="wall rw" />
                <div className="scanline" />
              </div>
              <div className="absolute inset-x-0 bottom-6 text-center text-sm font-semibold tracking-[0.3em] text-mint/80">SCANNING</div>
            </div>
            {/* glass crack where the strip breaks out */}
            <svg className="crack -right-3 -top-3 w-28" viewBox="0 0 100 100" aria-hidden>
              <g stroke="#bfffe9" strokeWidth="1.4" fill="none" opacity=".8">
                <path d="M70 30 L95 5 M70 30 L98 34 M70 30 L60 2 M70 30 L40 20 M70 30 L52 55 M70 30 L88 70" />
                <path d="M80 18 L90 24 M58 26 L52 12 M62 44 L48 40" opacity=".6" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
        {use3D ? (
          <Suspense fallback={<CssStrip />}>
            <HeroScene active={visible} />
          </Suspense>
        ) : (
          <CssStrip />
        )}
      </div>
    </section>
  );
}
