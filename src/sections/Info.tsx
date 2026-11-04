import { useEffect, useState } from 'react';
import { CONFIG } from '../config';

type Status = 'Live' | 'Sample' | 'Coming soon';
const FEATURES: { title: string; body: string; status: Status }[] = [
  { title: 'Read medicine strips', body: 'Front and back of tablet strips: name, strength, expiry, directions and warnings as printed.', status: 'Live' },
  { title: 'Read prescriptions', body: 'Handwriting is read with a confidence level and a reminder to confirm with a pharmacist.', status: 'Live' },
  { title: 'Lab report ranges', body: 'Values flagged only against the range printed on the report.', status: 'Live' },
  { title: 'English, Hindi, Punjabi', body: 'Instant switching. Hindi and Punjabi text awaits human review.', status: 'Live' },
  { title: 'Read aloud & large text', body: 'Uses the phone’s own voices; says clearly when a voice is missing.', status: 'Live' },
  { title: 'Ask about this item', body: 'Follow-up questions limited to the scanned document, under the same safety rules.', status: 'Live' },
  { title: 'Sample items', body: 'Fictional medicines, a synthetic prescription and lab report that work offline.', status: 'Sample' },
  { title: 'Interaction warning', body: 'Shown when both fictional sample medicines are scanned.', status: 'Sample' },
  { title: 'Real drug database', body: 'Verified ingredient and interaction data.', status: 'Coming soon' },
  { title: 'Dose reminders & refills', body: 'Reminders based on your own prescription.', status: 'Coming soon' },
  { title: 'Family profiles', body: 'Keep scans for parents and children apart.', status: 'Coming soon' },
  { title: 'WhatsApp scanning', body: 'Send a photo, get the explanation back.', status: 'Coming soon' },
];

const ROADMAP = [
  'Backend key storage', 'Real drug database', 'Duplicate ingredient alerts', 'Recall alerts', 'Same-salt alternatives', 'Price comparison',
  'Family profiles', 'Dose reminders', 'Refill alerts', 'Caregiver alerts', 'Record vault', 'Emergency card', 'WhatsApp scanning',
  'Pharmacist review', 'Suspicious packaging warnings', 'Clinic dashboard',
];

const badge = (s: Status) => (s === 'Live' ? 'badge-live' : s === 'Sample' ? 'badge-sample' : 'badge-soon');

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24 md:px-10" aria-labelledby="features-title">
      <p className="kicker">Features</p>
      <h2 id="features-title" className="huge mt-3">What works today.</h2>
      <p className="mt-3 text-white/70">“Live” uses Google Gemini on this site. “Sample” is prepared and offline. “Coming soon” is not built yet.</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <li key={f.title} className={`rounded-3xl p-5 ring-1 ${f.status === 'Coming soon' ? 'border border-dashed border-white/25 ring-transparent' : 'bg-ink-2 ring-white/10'}`}>
            <span className={`badge ${badge(f.status)}`}>{f.status}</span>
            <h3 className="mt-3 text-2xl font-bold leading-tight">{f.title}</h3>
            <p className="mt-2 text-white/70">{f.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Qr() {
  const [svg, setSvg] = useState('');
  const url = location.origin + import.meta.env.BASE_URL;
  useEffect(() => {
    import('qrcode').then((q) => q.toString(url, { type: 'svg', margin: 1, color: { dark: '#07090a', light: '#ffffff' } }).then(setSvg)).catch(() => {});
  }, [url]);
  return (
    <figure className="w-48 rounded-3xl bg-white p-3 text-center text-ink" data-testid="qr">
      {svg ? <div dangerouslySetInnerHTML={{ __html: svg }} role="img" aria-label={`QR code for ${url}`} /> : <div className="aspect-square" />}
      <figcaption className="mt-1 break-all text-xs">{url}</figcaption>
    </figure>
  );
}

export function InfoBlocks() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-10">
      <div className="grid gap-5 lg:grid-cols-2">
        <section id="safety" className="rounded-[2rem] bg-paper p-7 text-[#121816]" aria-labelledby="safety-title">
          <h2 id="safety-title" className="text-4xl font-extrabold">Safety</h2>
          <p className="mt-1 font-semibold text-black/60">Not professional medical advice.</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-lg">
            <li>Never diagnoses, prescribes, sets a dose or suggests changing treatment. Directions are shown only as printed.</li>
            <li>Printed details are kept apart from explanations. Every explanation says “AI explanation. Not verified.”</li>
            <li>Low confidence or a similar-name conflict stops the result and asks for a rescan or a pharmacist.</li>
            <li>Loose tablets are never identified by appearance.</li>
            <li>Words suggesting overdose, poisoning, a child swallowing medicine, a severe reaction or self-harm show urgent-help guidance to call {CONFIG.emergencyNumber}.</li>
          </ul>
        </section>
        <section id="privacy" className="rounded-[2rem] bg-ink-2 p-7 ring-1 ring-white/10" aria-labelledby="privacy-title">
          <h2 id="privacy-title" className="text-4xl font-extrabold">Privacy</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-lg text-white/80">
            <li>Sample scans never leave your phone.</li>
            <li>Live scans send a downscaled photo to Google Gemini. Please scan only the sample items, never real personal documents.</li>
            <li>Remed-AI has no server and keeps no images. “Report a wrong result” saves a short note on this device only.</li>
            <li>This demo uses a temporary key that is visible in the browser and will be deleted after the competition.</li>
          </ul>
        </section>
        <section id="testing" className="rounded-[2rem] bg-ink-2 p-7 ring-1 ring-white/10" aria-labelledby="testing-title">
          <h2 id="testing-title" className="text-4xl font-extrabold">Testing status</h2>
          <p className="mt-2 inline-block rounded-full bg-[#fff1c9] px-3 py-0.5 text-sm font-bold text-[#6a4b00]">In progress</p>
          <ul className="mt-4 space-y-2 text-lg text-white/80">
            <li>✓ Automated phone-size tests run on every update.</li>
            <li>✓ Safety rules (urgent words, dose questions, low confidence) have unit tests.</li>
            <li>… Accuracy on real packaging has not been measured yet.</li>
            <li>… Hindi and Punjabi wording awaits review by native speakers.</li>
          </ul>
        </section>
        <section id="team" className="rounded-[2rem] bg-ink-2 p-7 ring-1 ring-white/10" aria-labelledby="team-title">
          <h2 id="team-title" className="text-4xl font-extrabold">Team & contact</h2>
          <p className="mt-4 text-lg text-white/80">Built by the Remed-AI team for this competition. Come and talk to us at the booth: we would love to hear what confused you about your own medicines.</p>
          <p className="mt-3 text-lg">
            Source code: <a className="text-mint underline underline-offset-4" href={CONFIG.repoUrl} rel="noreferrer" target="_blank">github.com/remed-ai/remed-ai.github.io</a>
          </p>
          <div className="mt-5"><Qr /></div>
        </section>
      </div>
      <section id="roadmap" className="mt-16" aria-labelledby="roadmap-title">
        <p className="kicker">Roadmap</p>
        <h2 id="roadmap-title" className="huge mt-3">Planned next.</h2>
        <ul className="mt-8 flex flex-wrap gap-2">
          {ROADMAP.map((r) => (
            <li key={r} className="rounded-full px-4 py-2 text-base ring-1 ring-white/20">{r} <span className="ml-1 text-xs text-white/50">Planned</span></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
