import { useCallback, useEffect, useState } from 'react';
import { ScanPanel } from '../demo/ScanDemo';
import { useScanner } from '../demo/useScanner';
import { LangBar } from '../demo/LangBar';
import { Link } from '../lib/router';
import type { Sample } from '../scan/samples';
import type { Lang } from '../scan/schema';
import { useUi } from '../ui/UiContext';

interface Step { at: string; title: string; say: string; sample?: Sample['id']; lang?: Lang; secs: number }
const STEPS: Step[] = [
  { at: '0:00', title: 'What it does', say: 'Remed-AI reads medicine strips, prescriptions and lab reports and explains them in plain language. Not professional medical advice.', secs: 10 },
  { at: '0:10', title: 'Scan a strip', say: 'A plain summary first. Printed details stay word for word with a confidence level; tap one to see where it is printed.', sample: 'zentrova', lang: 'en', secs: 20 },
  { at: '0:30', title: 'Your language', say: 'One tap switches to Hindi or Punjabi. Printed text never changes.', lang: 'hi', secs: 12 },
  { at: '0:42', title: 'Two medicines', say: 'Scanning a second sample medicine shows a sample interaction warning.', sample: 'kelvora', lang: 'pa', secs: 14 },
  { at: '0:56', title: 'Honest when unsure', say: 'A blurry photo stops: “I’m not sure. Please rescan or ask a pharmacist.”', sample: 'blurry', lang: 'en', secs: 14 },
  { at: '1:10', title: 'Lab reports', say: 'Values are flagged only against the range printed on the report, with questions to ask a doctor.', sample: 'lab', secs: 16 },
  { at: '1:26', title: 'Safety', say: 'No diagnosis, no doses. Emergency words show call-112 guidance. Loose tablets are never identified by looks. History stays on the phone.', secs: 16 },
  { at: '1:42', title: 'Booth mode', say: 'At the booth the phone runs a self-resetting kiosk with one big button and a staff PIN to exit.', secs: 18 },
];

/** Hidden two-minute judge tour (/judge). */
export function JudgePage() {
  const { setLang } = useUi();
  const scanner = useScanner();
  const [i, setI] = useState<number | null>(null);
  const [left, setLeft] = useState(0);

  const go = useCallback((k: number) => {
    const s = STEPS[k];
    setI(k);
    setLeft(s.secs);
    if (s.sample) scanner.runSample(s.sample);
    if (s.lang) setLang(s.lang);
  }, [scanner, setLang]);

  useEffect(() => {
    if (i == null) return;
    const id = window.setInterval(() => setLeft((x) => x - 1), 1000);
    return () => clearInterval(id);
  }, [i]);
  useEffect(() => {
    if (i == null || left > 0) return;
    if (i + 1 < STEPS.length) go(i + 1);
    else setI(null);
  }, [left, i, go]);

  const step = i != null ? STEPS[i] : null;
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Judge tour · 2 minutes</h1>
        <LangBar />
      </div>
      {step && i != null ? (
        <div className="card sticky top-2 z-20 mt-4 p-5" data-testid="judge-panel">
          <p className="text-sm font-semibold text-accent-dark">Step {i + 1} of {STEPS.length} · {step.at} · {left}s</p>
          <p className="mt-1 text-2xl font-bold">{step.title}</p>
          <p className="mt-1">{step.say}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded bg-sand"><div className="h-full bg-accent transition-all" style={{ width: `${((step.secs - left) / step.secs) * 100}%` }} /></div>
          <div className="mt-3 flex gap-2">
            <button type="button" className="btn-quiet" disabled={i === 0} onClick={() => go(i - 1)}>Back</button>
            <button type="button" className="btn-ink" onClick={() => (i + 1 < STEPS.length ? go(i + 1) : setI(null))}>Next</button>
            <button type="button" className="btn-quiet ml-auto" onClick={() => setI(null)}>End</button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn-primary mt-4 min-h-14 w-full text-xl" onClick={() => go(0)} data-testid="judge-start">Start the tour</button>
      )}
      <div className="mt-6"><ScanPanel scanner={scanner} /></div>
      <p className="mt-6 text-muted"><Link to="/demo" className="underline">Booth mode</Link> · <Link to="/" className="underline">Home</Link></p>
    </div>
  );
}
