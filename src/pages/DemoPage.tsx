import { useEffect, useState } from 'react';
import { CONFIG, geminiKey, geminiModel } from '../config';
import { Showcase } from '../showcase/Showcase';
import { Link, href } from '../lib/router';
import { clearHistory } from '../scan/history';

function Qr({ url }: { url: string }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    import('qrcode').then((q) => q.toString(url, { type: 'svg', margin: 1 }).then(setSvg)).catch(() => {});
  }, [url]);
  return svg ? <div className="w-44 rounded-2xl bg-white p-2" dangerouslySetInnerHTML={{ __html: svg }} role="img" aria-label={`QR code for ${url}`} data-testid="qr" /> : null;
}

/** Hidden staff settings for the booth (/demo). */
export function DemoPage() {
  const [running, setRunning] = useState(() => new URLSearchParams(location.search).get('start') === '1');
  const [cleared, setCleared] = useState(false);
  const site = location.origin + href('/');
  if (running) return <Showcase onExit={() => { history.replaceState(null, '', href('/demo')); setRunning(false); }} />;
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <p className="text-sm font-bold uppercase tracking-widest text-accent">Staff settings</p>
      <h1 className="text-3xl font-extrabold">Booth mode</h1>
      <button type="button" className="btn-primary mt-5 min-h-16 w-full text-2xl" onClick={() => setRunning(true)} data-testid="start-booth">Start booth mode</button>
      <ul className="card mt-5 list-disc space-y-2 p-5 pl-9">
        <li>Exit: hold the bottom-right corner for 5 seconds, then PIN <strong>{CONFIG.staffPin}</strong>.</li>
        <li>Resets itself after {CONFIG.idleMs / 1000} s without a touch.</li>
        <li>iPhone: Share → Add to Home Screen, then Settings → Accessibility → Guided Access.</li>
        <li>Android: Install app from the Chrome menu, then Settings → Security → App pinning.</li>
      </ul>
      <div className="card mt-4 grid gap-2 p-5">
        <p>Live scanning: <strong data-testid="key-status">{geminiKey() ? 'configured' : 'not configured (samples only)'}</strong></p>
        <p>Model: <code>{geminiModel()}</code> (falls back automatically when busy)</p>
        <p><a className="font-semibold text-accent-dark underline" href={href('/booth/print.html')}>Printable sample items</a></p>
        <button type="button" className="btn-quiet justify-self-start" onClick={() => { clearHistory(); setCleared(true); }}>{cleared ? 'History cleared' : 'Clear history on this device'}</button>
      </div>
      <div className="mt-4 flex items-center gap-4"><Qr url={site} /><p className="break-all text-muted">{site}</p></div>
      <p className="mt-6"><Link to="/judge" className="underline">Judge tour</Link> · <Link to="/" className="underline">Home</Link></p>
    </div>
  );
}
