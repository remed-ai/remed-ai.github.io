import { CONFIG } from '../config';
import { Layout } from '../ui/Layout';

const SOON = ['Real drug database', 'Dose and refill reminders', 'Family profiles', 'Recall alerts', 'Same-salt alternatives', 'WhatsApp scanning', 'Pharmacist review'];

export function AboutPage() {
  return (
    <Layout>
      <h1 className="text-3xl font-extrabold">About Remed-AI</h1>
      <p className="mt-2 text-lg">Scan a medicine strip, the back of a strip, a prescription or a lab report. Remed-AI reads what is printed and explains it in English, Hindi or Punjabi.</p>

      <section className="card mt-5 p-5" id="safety">
        <h2 className="text-2xl font-bold">Safety</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Not professional medical advice. It never diagnoses, prescribes or sets a dose.</li>
          <li>Directions are shown only as printed. Explanations are marked “AI explanation. Not verified.”</li>
          <li>If it is unsure, it stops and asks you to rescan or ask a pharmacist.</li>
          <li>Loose tablets are never identified by how they look.</li>
          <li>In an emergency, call {CONFIG.emergencyNumber}.</li>
        </ul>
      </section>

      <section className="card mt-4 p-5" id="privacy">
        <h2 className="text-2xl font-bold">Privacy</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Photos are sent to Google Gemini to be read. Remed-AI has no server and keeps no photos.</li>
          <li>History and notes stay on this phone. You can clear them any time.</li>
          <li>Hindi and Punjabi wording is still being reviewed.</li>
        </ul>
      </section>

      <section className="card mt-4 p-5">
        <h2 className="text-2xl font-bold">Coming soon</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {SOON.map((s) => <li key={s} className="rounded-full bg-sand px-3 py-1">{s}</li>)}
        </ul>
      </section>
    </Layout>
  );
}
