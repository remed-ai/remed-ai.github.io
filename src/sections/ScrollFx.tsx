import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../lib/device';

gsap.registerPlugin(ScrollTrigger);

const LAYERS = [
  { tag: 'Name', title: 'ZENTROVA 500', body: 'Printed name, read word for word.', tone: 'bg-[#e9fff7] text-[#0b3d36]' },
  { tag: 'Ingredients', title: 'Zentrofen 500 mg', body: 'Printed ingredient and strength.', tone: 'bg-[#f3f6f7] text-[#14201d]' },
  { tag: 'Uses', title: 'AI explanation. Not verified.', body: 'A short, general description of the printed ingredient. Fictional in this demo.', tone: 'bg-[#fff6d9] text-[#3d2e00]' },
  { tag: 'Warnings', title: 'Keep out of reach of children.', body: 'Printed warnings, never softened or reworded.', tone: 'bg-[#ffe7e2] text-[#5a0f07]' },
];

/** Section 5: the strip explodes into floating layers on scroll. */
export function Explode() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray<HTMLElement>('.xl');
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: '+=140%', scrub: 0.6, pin: true } });
      layers.forEach((el, i) => {
        const k = i - (layers.length - 1) / 2;
        tl.fromTo(el, { z: 0, y: 0, rotateX: 58, rotateZ: -24, opacity: i === 0 ? 1 : 0.9 }, { z: k * -60, y: k * 118, rotateX: 22, rotateZ: -8, opacity: 1, ease: 'power2.out' }, 0);
      });
      tl.fromTo('.xl-label', { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: 0.08 }, 0.35);
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="layers" className="relative min-h-[100svh] overflow-hidden px-4 py-16 md:px-10" aria-labelledby="layers-title">
      <p className="kicker">Inside one strip</p>
      <h2 id="layers-title" className="huge mt-3 max-w-4xl">One strip. <span className="glow-mint">Four layers</span> of meaning.</h2>
      <div className={reduced ? 'mt-10 grid gap-4' : 'relative mx-auto mt-6 h-[68svh] max-w-lg'} style={reduced ? undefined : { perspective: '1100px' }}>
        {LAYERS.map((l, i) => (
          <div key={l.tag} className={`xl ${reduced ? '' : 'absolute inset-x-4 top-1/2 -mt-16'}`} style={{ zIndex: 10 - i, transformStyle: 'preserve-3d' }}>
            <div className={`rounded-3xl p-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,.9)] ring-1 ring-black/10 ${l.tone}`}>
              <span className="xl-label inline-block rounded-full bg-black/80 px-3 py-0.5 text-xs font-bold uppercase tracking-widest text-mint">{l.tag}</span>
              <p className="mt-2 text-2xl font-extrabold leading-tight" style={{ fontStretch: '110%' }}>{l.title}</p>
              <p className="mt-1 text-base opacity-75">{l.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Section 6: a messy prescription becomes clear text as the beam passes. */
export function Beam() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(stage.current, { '--p': '0%' }, { '--p': '100%', ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: '+=120%', scrub: 0.4, pin: true } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const lines = ['Tab. Zentrova 500', '1 – 0 – 1 after food × 5 days', 'Tab. Kelvora 10', '0 – 0 – 1 at night × 10 days'];
  return (
    <section ref={root} id="beam" className="relative min-h-[100svh] px-4 py-16 md:px-10" aria-labelledby="beam-title">
      <p className="kicker">Scan beam</p>
      <h2 id="beam-title" className="huge mt-3 max-w-4xl">Messy in. <span className="text-coral">Clear out.</span></h2>
      <p className="mt-3 max-w-xl text-white/70">Synthetic prescription. Handwriting is read with a confidence level, and medium confidence always says “please confirm with your pharmacist.”</p>
      <div ref={stage} className={`relative mx-auto mt-8 max-w-2xl ${reduced ? 'grid gap-4' : ''}`} style={{ ['--p' as string]: reduced ? '100%' : '0%' }}>
        <div className="rounded-3xl bg-[#fffdf6] p-6 text-[#1a2a6c] shadow-2xl" aria-hidden={!reduced}>
          <svg width="0" height="0" className="absolute"><filter id="wobble"><feTurbulence baseFrequency="0.035" numOctaves="2" seed="3" /><feDisplacementMap in="SourceGraphic" scale="7" /></filter></svg>
          <p className="text-sm font-bold tracking-widest text-[#0b3d36]">DEMO CLINIC · NOT VALID</p>
          {lines.map((l, i) => (
            <p key={l} className="mt-3 text-2xl sm:text-3xl" style={{ fontFamily: "'Segoe Print','Bradley Hand','Comic Sans MS',cursive", filter: 'url(#wobble) blur(0.6px)', transform: `rotate(${[-3, -1.5, 2, 1][i]}deg) translateX(${[6, 22, 2, 18][i]}px)` }}>{l}</p>
          ))}
        </div>
        <div className={`${reduced ? '' : 'absolute inset-0'} rounded-3xl bg-white p-6 text-[#121816] shadow-2xl`} style={reduced ? undefined : { clipPath: 'inset(0 calc(100% - var(--p)) 0 0)' }}>
          <p className="text-sm font-bold tracking-widest text-[#0f7b6c]">READ AS · MEDIUM CONFIDENCE</p>
          {lines.map((l) => (
            <p key={l} className="mt-3 text-2xl font-semibold sm:text-3xl">{l}</p>
          ))}
        </div>
        {!reduced && <div className="pointer-events-none absolute -bottom-4 -top-4 w-1 bg-mint shadow-[0_0_30px_8px_rgba(94,255,200,.7)]" style={{ left: 'var(--p)' }} aria-hidden />}
      </div>
    </section>
  );
}

const PHRASES = [
  { en: 'Take after food', hi: 'खाने के बाद लें', pa: 'ਖਾਣੇ ਤੋਂ ਬਾਅਦ ਲਓ' },
  { en: 'Keep out of reach of children', hi: 'बच्चों की पहुँच से दूर रखें', pa: 'ਬੱਚਿਆਂ ਦੀ ਪਹੁੰਚ ਤੋਂ ਦੂਰ ਰੱਖੋ' },
  { en: 'Ask your pharmacist', hi: 'अपने फार्मासिस्ट से पूछें', pa: 'ਆਪਣੇ ਫਾਰਮਾਸਿਸਟ ਨੂੰ ਪੁੱਛੋ' },
];
const ORDER = ['en', 'hi', 'pa'] as const;

/** Section 7: words morph across English, Hindi and Punjabi. */
export function LanguageMorph() {
  const reduced = useReducedMotion();
  const [k, setK] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setK((x) => x + 1), 2200);
    return () => clearInterval(id);
  }, [reduced]);
  const phrase = PHRASES[Math.floor(k / 3) % PHRASES.length];
  const cur = ORDER[k % 3];
  return (
    <section id="languages" className="relative mx-auto max-w-7xl px-4 py-24 md:px-10" aria-labelledby="lang-title">
      <p className="kicker">Your language</p>
      <h2 id="lang-title" className="sr-only">English, Hindi and Punjabi</h2>
      {reduced ? (
        <div className="mt-6 grid gap-3">
          {ORDER.map((l) => <p key={l} lang={l} className="huge">{PHRASES[0][l]}</p>)}
        </div>
      ) : (
        <div className="relative mt-6 min-h-[2.2em] text-[clamp(2.6rem,11vw,8rem)] font-extrabold leading-[1.05]" aria-live="off">
          {ORDER.map((l) => (
            <p key={l} lang={l} className={`morph-word absolute inset-x-0 top-0 ${l === cur ? (l === 'en' ? 'text-white' : l === 'hi' ? 'glow-mint' : 'text-coral') : 'morph-hide'}`} aria-hidden={l !== cur}>
              {phrase[l]}
            </p>
          ))}
        </div>
      )}
      <p className="mt-8 max-w-2xl text-lg text-white/70">
        Switch instantly between English, हिन्दी and ਪੰਜਾਬੀ. Printed text stays exactly as printed; explanations change language. Read-aloud uses your phone’s voices
        and says clearly when a voice is missing. Hindi and Punjabi text is awaiting human review.
      </p>
    </section>
  );
}
