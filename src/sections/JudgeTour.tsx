import { useCallback, useEffect, useRef, useState } from 'react';
import type { Scanner } from '../demo/useScanner';
import type { Sample } from '../scan/samples';
import type { Lang } from '../scan/schema';
import { useUi } from '../ui/UiContext';

interface Step { at: string; title: string; say: string; target: string; sample?: Sample['id']; lang?: Lang; secs: number }

const STEPS: Step[] = [
  { at: '0:00', title: 'The promise', say: 'Remed-AI reads medicine strips, prescriptions and lab reports, and explains them in plain language. Not professional medical advice.', target: 'top', secs: 12 },
  { at: '0:12', title: 'A sample scan', say: 'Printed details stay word for word, each with a confidence level. Tap one to see where it is printed. Explanations are labelled “AI explanation. Not verified.”', target: 'demo', sample: 'zentrova', lang: 'en', secs: 20 },
  { at: '0:32', title: 'Your language', say: 'One tap switches to Hindi or Punjabi. Printed text never changes.', target: 'demo', lang: 'hi', secs: 12 },
  { at: '0:44', title: 'Two medicines', say: 'Scanning the second fictional medicine shows a sample interaction warning.', target: 'demo', sample: 'kelvora', lang: 'pa', secs: 14 },
  { at: '0:58', title: 'Honest when unsure', say: 'A blurry photo stops the result: “I’m not sure. Please rescan or ask a pharmacist.”', target: 'demo', sample: 'blurry', lang: 'en', secs: 14 },
  { at: '1:12', title: 'Lab reports', say: 'Values are flagged only against the range printed on the report, with questions to ask a doctor.', target: 'demo', sample: 'lab', secs: 16 },
  { at: '1:28', title: 'Safety rules', say: 'No diagnosis, no doses, urgent-help guidance for emergencies, loose tablets never identified by looks.', target: 'safety', secs: 16 },
  { at: '1:44', title: 'At the booth', say: 'Showcase mode turns a phone into a self-running kiosk: one huge button, auto-reset after 30 idle seconds, staff PIN to exit.', target: 'judge', secs: 16 },
];

export function JudgeTour({ scanner }: { scanner: Scanner }) {
  const { setLang } = useUi();
  const [i, setI] = useState<number | null>(null);
  const [left, setLeft] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  const go = useCallback((k: number) => {
    const s = STEPS[k];
    setI(k);
    setLeft(s.secs);
    if (s.sample) scanner.runSample(s.sample);
    if (s.lang) setLang(s.lang);
    setTimeout(() => document.getElementById(s.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }, [scanner, setLang]);

  useEffect(() => {
    if (i == null) return;
    timer.current = window.setInterval(() => setLeft((x) => x - 1), 1000);
    return () => clearInterval(timer.current);
  }, [i]);
  useEffect(() => {
    if (i == null || left > 0) return;
    if (i + 1 < STEPS.length) go(i + 1);
    else setI(null);
  }, [left, i, go]);

  const step = i != null ? STEPS[i] : null;
  return (
    <section id="judge" className="mx-auto max-w-7xl px-4 py-24 md:px-10" aria-labelledby="judge-title">
      <p className="kicker">For judges</p>
      <h2 id="judge-title" className="huge mt-3">Two-minute guided tour.</h2>
      <p className="mt-3 max-w-2xl text-lg text-white/75">Eight stops, about 15 seconds each. It runs the sample scans for you. Pause or skip any time.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="btn-coral min-h-14 px-7 text-xl" onClick={() => go(0)} data-testid="judge-start">Start the 2-minute tour</button>
        <a className="inline-flex min-h-14 items-center rounded-full px-6 text-lg ring-1 ring-white/25" href="?showcase=1">Open showcase mode</a>
      </div>
      <ol className="mt-8 grid gap-2 sm:grid-cols-2">
        {STEPS.map((s, k) => (
          <li key={s.title} className={`rounded-2xl p-4 ring-1 ${k === i ? 'bg-mint/10 ring-mint' : 'ring-white/10'}`}>
            <span className="text-sm text-mint">{s.at}</span> <strong className="ml-1">{s.title}</strong>
          </li>
        ))}
      </ol>

      {step && i != null && (
        <div className="fixed inset-x-3 bottom-24 z-[70] mx-auto max-w-xl rounded-3xl bg-ink-2/95 p-5 shadow-2xl ring-1 ring-mint/40 backdrop-blur" role="dialog" aria-label="Judge tour" data-testid="judge-panel">
          <div className="flex items-center justify-between text-sm text-mint">
            <span>Stop {i + 1} of {STEPS.length} · {step.at}</span><span aria-hidden>{left}s</span>
          </div>
          <p className="mt-1 text-2xl font-bold">{step.title}</p>
          <p className="mt-1 text-white/80">{step.say}</p>
          <div className="mt-3 h-1 overflow-hidden rounded bg-white/10"><div className="h-full bg-mint transition-all" style={{ width: `${((step.secs - left) / step.secs) * 100}%` }} /></div>
          <div className="mt-3 flex gap-2">
            <button type="button" className="min-h-11 rounded-full px-4 ring-1 ring-white/25" disabled={i === 0} onClick={() => go(i - 1)}>Back</button>
            <button type="button" className="min-h-11 rounded-full bg-mint px-4 font-bold text-ink" onClick={() => (i + 1 < STEPS.length ? go(i + 1) : setI(null))}>Next</button>
            <button type="button" className="ml-auto min-h-11 rounded-full px-4 ring-1 ring-white/25" onClick={() => setI(null)}>End tour</button>
          </div>
        </div>
      )}
    </section>
  );
}
