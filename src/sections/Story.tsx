export function Problem() {
  return (
    <section id="problem" className="relative mx-auto max-w-5xl px-4 py-24 md:px-10" aria-labelledby="problem-title">
      <p className="kicker">The problem</p>
      <h2 id="problem-title" className="huge mt-4">A drawer full of strips. <span className="text-coral">No one to ask.</span></h2>
      <div className="mt-10 grid gap-6 text-xl leading-relaxed text-white/85 md:grid-cols-2">
        <p>
          It is late. A grandmother opens the kitchen drawer and finds three tablet strips, cut in half to save space. The name sits on one piece. The expiry
          date sits on another. The print is tiny, silver on silver.
        </p>
        <p>
          Her prescription is in handwriting she cannot read, in a language she does not use at home. The lab report next to it is a wall of numbers. Her
          grandson, who usually explains everything, lives in another city.
        </p>
        <p className="md:col-span-2 text-2xl font-semibold text-white">
          Remed-AI is for that moment: read what is printed, say clearly what is not sure, and explain the rest in her language. Then send her to the pharmacist
          with better questions.
        </p>
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: '01', title: 'Scan', body: 'Point the camera at a strip, the back of a strip, a prescription or a lab report. Or tap a sample.',
    icon: (<g><rect x="10" y="10" width="60" height="60" rx="12" /><path d="M10 40 H70" className="text-mint" stroke="currentColor" strokeWidth="4" /></g>),
  },
  {
    n: '02', title: 'Verify', body: 'Printed text is kept separate, word for word, each with a confidence level. Unsure? It stops and asks you to rescan or see a pharmacist.',
    icon: (<g><circle cx="40" cy="40" r="30" /><path d="M26 41 l10 10 l19 -22" strokeWidth="5" /></g>),
  },
  {
    n: '03', title: 'Understand', body: 'Plain-language explanations in English, Hindi or Punjabi, clearly labelled as AI explanations, plus questions to ask your doctor.',
    icon: (<g><path d="M12 18 h40 v28 h-22 l-12 10 v-10 h-6 z" /><path d="M40 34 h28 v24 h-6 v8 l-10 -8 h-12 z" /></g>),
  },
];

export function Steps() {
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-24 md:px-10" aria-labelledby="how-title">
      <p className="kicker">How it works</p>
      <h2 id="how-title" className="huge mt-4">Scan. Verify. Understand.</h2>
      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.n} className="relative overflow-hidden rounded-[2rem] bg-ink-2 p-7 ring-1 ring-white/10" style={{ transform: `rotate(${[-1.2, 0.8, -0.5][i]}deg)` }}>
            <span className="absolute -right-4 -top-8 text-[9rem] font-extrabold leading-none text-white/[0.04]" aria-hidden>{s.n}</span>
            <svg viewBox="0 0 80 80" className="size-16 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{s.icon}</svg>
            <h3 className="mt-5 text-4xl font-extrabold" style={{ fontStretch: '115%' }}>{s.title}</h3>
            <p className="mt-3 text-lg text-white/75">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
