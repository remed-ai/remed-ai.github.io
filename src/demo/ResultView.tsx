import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Confidence, FollowUpAnswer, ScanResult, Tri } from '../scan/schema';
import { asksForDose, flagLab, gateResult, isUrgent } from '../scan/safety';
import { doseRefusal, sampleFollowUp, OUT_OF_SCOPE } from '../scan/followup';
import { cooldownLeft, markLiveCall } from '../scan/rateLimit';
import { saveReport } from '../scan/reports';
import { canListen, listen, speak, speechSupported, stopSpeaking } from '../lib/speech';
import { STRINGS, type StringKey } from '../i18n/strings';
import { useUi } from '../ui/UiContext';
import { getLiveProvider, type ScanState } from './useScanner';
import { UrgentHelp } from './UrgentHelp';
import { summarize } from '../scan/summary';

const CONF_DOT: Record<Confidence, string> = { high: 'bg-[#0f7b6c]', medium: 'bg-[#c98a00]', low: 'bg-[#b3121f]' };

function ConfBadge({ c }: { c: Confidence }) {
  const { t } = useUi();
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-black/70">
      <span className={`inline-block size-2.5 rounded-full ${CONF_DOT[c]}`} aria-hidden />
      {t(`conf_${c}` as StringKey)}
    </span>
  );
}

function AiLabel() {
  const { t } = useUi();
  return <span className="ai-label">{t('aiExplanation')}</span>;
}

interface Props {
  state: ScanState;
  onCorrect: (i: number, v: string) => void;
  onRescan: () => void;
  onAnother?: () => void;
  anotherLabel?: string;
  compact?: boolean;
  /** Read the summary aloud as soon as the result appears. */
  autoRead?: boolean;
}

export function ResultView({ state, onCorrect, onRescan, onAnother, anotherLabel, compact, autoRead }: Props) {
  const { t, lang } = useUi();
  const r = state.result as ScanResult;
  const gate = useMemo(() => gateResult(r), [r]);
  const [sel, setSel] = useState<number | null>(null);
  const [urgent, setUrgent] = useState(false);
  const [voiceMsg, setVoiceMsg] = useState('');
  const tr = (x: Tri) => x[lang] || x.en;

  const boxes = useMemo(() => [...r.printed.map((p) => p.box ?? null), ...r.labValues.map((v) => v.box ?? null)], [r]);
  const selBox = sel != null ? boxes[sel] : null;

  const summary = useMemo(() => summarize(r, lang), [r, lang]);

  const readAloud = async () => {
    const L = STRINGS[lang];
    const lines: string[] = [`${summary.title}.`, ...summary.lines.map((l) => `${l}.`)];
    if (gate.stop) lines.push(L.notSure);
    else {
      r.printed.forEach((p) => lines.push(`${L[`f_${p.field}` as StringKey]}: ${p.value}.`));
      r.labValues.forEach((v) => lines.push(`${v.test}: ${v.value} ${v.unit}. ${L[`flag_${flagLab(v)}` as StringKey]}.`));
      r.explanations.forEach((e) => lines.push(`${L.aiExplanation} ${tr(e.text)}`));
    }
    lines.push(L.notAdvice);
    const ok = await speak(lines.join(' '), lang);
    setVoiceMsg(ok ? '' : t('noVoice', { lang: STRINGS[lang].langName }));
  };

  useEffect(() => {
    if (autoRead) void readAloud();
    return () => void stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r]);

  return (
    <div className={`grid gap-4 ${compact ? '' : 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]'}`} data-testid="result">
      {urgent && <UrgentHelp onClose={() => setUrgent(false)} />}
      {state.image && (
        <figure className="card relative self-start overflow-hidden">
          <figcaption className="absolute bottom-2 left-2 z-10 rounded-full bg-ink/70 px-2.5 py-0.5 text-xs text-white">{t('original')}</figcaption>
          <div className="relative w-full" style={{ aspectRatio: String(state.aspect) }}>
            <img src={state.image} alt={t('original')} className="absolute inset-0 size-full object-contain" />
            {selBox && (
              <div
                className="src-highlight absolute"
                data-testid="highlight"
                style={{ left: `${selBox[0] * 100}%`, top: `${selBox[1] * 100}%`, width: `${selBox[2] * 100}%`, height: `${selBox[3] * 100}%` }}
                aria-hidden
              />
            )}
          </div>
        </figure>
      )}

      <article className="card p-5 sm:p-7" aria-live="polite">
        <header className="flex flex-wrap items-center gap-2">
          <span className={`badge ${state.source === 'sample' ? 'badge-sample' : 'badge-live'}`} data-testid="result-source">
            {state.source === 'sample' ? t('sampleResult') : t('liveResult')}
          </span>
          {!gate.stop && <ConfBadge c={r.overallConfidence} />}
        </header>
        <section className="mt-3 rounded-2xl bg-sand/70 p-4" data-testid="summary">
          <h2 className="text-2xl font-bold leading-tight">{summary.title}</h2>
          <ul className="mt-2 space-y-1 text-lg">
            {summary.lines.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            {speechSupported() && (
              <>
                <button type="button" className="btn-ink" onClick={readAloud} data-testid="read-aloud">🔊 {t('readAloud')}</button>
                <button type="button" className="btn-quiet" onClick={() => stopSpeaking()}>{t('stop')}</button>
              </>
            )}
          </div>
          {(voiceMsg || !speechSupported()) && <p role="status" className="mt-2 text-sm text-muted">{voiceMsg || t('noVoice', { lang: STRINGS[lang].langName })}</p>}
        </section>
        <p className="mt-2 text-sm font-semibold text-muted">Not professional medical advice.{lang !== 'en' && ` · ${t('notAdvice')}`}</p>

        {state.interaction && (
          <div className="mt-4 rounded-2xl border border-[#c98a00]/50 bg-[#fff4d6] p-4" role="note" data-testid="interaction">
            <p className="font-bold">⚠ {t('interaction')}</p>
            <p className="mt-1">{tr(state.interaction)}</p>
          </div>
        )}

        {gate.stop ? (
          <div className="mt-5 rounded-2xl border-2 border-[#b3121f]/40 bg-[#fff1f0] p-5" role="alert" data-testid="not-sure">
            <p className="text-2xl font-bold leading-snug">{t('notSure')}</p>
            <p className="mt-2 text-lg">{t(`reason_${gate.reason}` as StringKey)}</p>
            {r.unclear.map((u, i) => <p key={i} className="mt-1 text-base text-black/70">{tr(u)}</p>)}
            <button type="button" onClick={onRescan} className="btn-ink mt-4">{t('rescan')}</button>
          </div>
        ) : (
          <>
            {r.printed.length > 0 && (
              <section className="mt-5">
                <h3 className="text-xl font-bold">{t('printed')}</h3>
                <p className="text-sm text-black/60">{t('tapDetail')}</p>
                <ul className="mt-3 grid gap-2">
                  {r.printed.map((p, i) => (
                    <DetailRow key={i} index={i} selected={sel === i} onSelect={() => setSel(sel === i ? null : i)}
                      label={t(`f_${p.field}` as StringKey)} value={p.value} confidence={p.confidence} corrected={!!p.corrected}
                      hasBox={!!p.box} asPrinted={p.field === 'directions'} onCorrect={(v) => (isUrgent(v) ? setUrgent(true) : onCorrect(i, v))} />
                  ))}
                </ul>
              </section>
            )}

            {r.labValues.length > 0 && (
              <section className="mt-6" data-testid="lab">
                <h3 className="text-xl font-bold">{t('lab')}</h3>
                <p className="text-sm text-black/60">{t('labNote')}</p>
                <ul className="mt-3 grid gap-2">
                  {r.labValues.map((v, k) => {
                    const f = flagLab(v);
                    const i = r.printed.length + k;
                    return (
                      <li key={k}>
                        <button type="button" onClick={() => setSel(sel === i ? null : i)} aria-pressed={sel === i}
                          className={`detail w-full text-left ${sel === i ? 'detail-on' : ''}`}>
                          <span className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="font-semibold">{v.test}</span>
                            <span className={`flag flag-${f}`}>{t(`flag_${f}` as StringKey)}</span>
                          </span>
                          <span className="mt-1 block text-lg">{v.value} {v.unit} <span className="text-black/60">· {v.printedRange || '—'}</span></span>
                          <ConfBadge c={v.confidence} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {r.unclear.length > 0 && (
              <section className="mt-6">
                <h3 className="text-xl font-bold">{t('unclearTitle')}</h3>
                {r.unclear.map((u, i) => <p key={i} className="mt-1">{tr(u)}</p>)}
              </section>
            )}

            {r.explanations.length > 0 && (
              <section className="mt-6">
                <h3 className="text-xl font-bold">{t('whatItMeans')}</h3>
                <ul className="mt-3 grid gap-3">
                  {r.explanations.map((e, i) => (
                    <li key={i} className="rounded-2xl bg-black/[0.04] p-4">
                      <AiLabel />
                      <p className="mt-1 font-semibold">{e.topic}</p>
                      <p className="mt-1 leading-relaxed">{tr(e.text)}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {r.doctorQuestions.length > 0 && (
              <section className="mt-6">
                <h3 className="text-xl font-bold">{t('doctorQs')}</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-6">
                  {r.doctorQuestions.map((q, i) => <li key={i}>{tr(q)}</li>)}
                </ol>
              </section>
            )}

            <FollowUp result={r} source={state.source} onUrgent={() => setUrgent(true)} />
          </>
        )}

        <ReportWrong source={state.source} kind={r.kind} onUrgent={() => setUrgent(true)} />

        <div className="mt-6 flex flex-wrap gap-3">
          {onAnother && <button type="button" className="btn-coral min-h-14 px-6 text-xl" onClick={onAnother} data-testid="scan-another">{anotherLabel ?? t('scanAnother')}</button>}
          {!gate.stop && <button type="button" className="btn-quiet" onClick={onRescan}>{t('rescan')}</button>}
        </div>
      </article>
    </div>
  );
}

function DetailRow(p: {
  index: number; selected: boolean; onSelect: () => void; label: string; value: string; confidence: Confidence;
  corrected: boolean; hasBox: boolean; asPrinted: boolean; onCorrect: (v: string) => void;
}) {
  const { t } = useUi();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(p.value);
  return (
    <li>
      <div className={`detail ${p.selected ? 'detail-on' : ''}`}>
        <button type="button" onClick={p.onSelect} aria-pressed={p.selected} className="block w-full text-left" data-testid={`detail-${p.index}`}>
          <span className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="text-sm font-semibold uppercase tracking-wide text-black/60">{p.label}{p.asPrinted && ` · ${t('asPrinted')}`}</span>
            <ConfBadge c={p.confidence} />
          </span>
          <span className="mt-1 block text-lg font-medium leading-snug">“{p.value}”</span>
          {p.corrected && <span className="mt-1 block text-sm text-[#0f7b6c]">✓ {t('corrected')}</span>}
          {p.selected && !p.hasBox && <span className="mt-1 block text-sm text-black/60">{t('noLocation')}</span>}
        </button>
        {editing ? (
          <form className="mt-2 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) p.onCorrect(draft.trim()); setEditing(false); }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} aria-label={`${t('edit')}: ${p.label}`} className="field flex-1" maxLength={160} />
            <button className="btn-ink" type="submit">{t('save')}</button>
            <button className="btn-quiet" type="button" onClick={() => setEditing(false)}>{t('cancel')}</button>
          </form>
        ) : (
          <button type="button" className="mt-1 text-sm underline underline-offset-4" onClick={() => { setDraft(p.value); setEditing(true); }}>{t('edit')}</button>
        )}
      </div>
    </li>
  );
}

function FollowUp({ result, source, onUrgent }: { result: ScanResult; source: 'sample' | 'live'; onUrgent: () => void }) {
  const { t, lang } = useUi();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [ans, setAns] = useState<FollowUpAnswer | null>(null);
  const [note, setNote] = useState('');

  const [hearing, setHearing] = useState(false);
  const ask = async (question: string) => {
    if (!question) return;
    setNote('');
    if (isUrgent(question)) return onUrgent();
    if (asksForDose(question)) return setAns(doseRefusal(result));
    if (source === 'sample') return setAns(sampleFollowUp(result, question));
    const left = cooldownLeft();
    if (left > 0) return setNote(t('cooldown', { s: Math.ceil(left / 1000) }));
    setBusy(true);
    try {
      markLiveCall();
      const a = await getLiveProvider().followUp(result, question);
      setAns(isUrgent(a.answer.en) ? { ...a, answer: OUT_OF_SCOPE } : a);
    } catch {
      setAns(sampleFollowUp(result, question));
      setNote(t('liveUnavailable'));
    } finally {
      setBusy(false);
    }
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    void ask(q.trim());
  };

  return (
    <section className="mt-6">
      <h3 className="text-xl font-bold">{t('askTitle')}</h3>
      <p className="text-sm text-black/60">{t('askHint')}</p>
      <form onSubmit={submit} className="mt-2 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} className="field min-w-0 flex-1" placeholder={t('askPlaceholder')} aria-label={t('askTitle')} maxLength={300} data-testid="ask-input" />
        {canListen() && (
          <button type="button" className="btn-quiet" aria-pressed={hearing} aria-label={t('speak')} data-testid="mic"
            onClick={async () => { setHearing(true); const heard = await listen(lang); setHearing(false); if (heard) { setQ(heard); void ask(heard); } }}>
            🎤 {hearing ? t('listening') : t('speak')}
          </button>
        )}
        <button className="btn-ink" type="submit" disabled={busy}>{busy ? '…' : t('ask')}</button>
      </form>
      {note && <p className="mt-2 text-sm" role="status">{note}</p>}
      {ans && (
        <div className="mt-3 rounded-2xl bg-black/[0.04] p-4" role="status" data-testid="answer">
          <AiLabel />
          <p className="mt-1 leading-relaxed">{ans.answer[lang] || ans.answer.en}</p>
        </div>
      )}
    </section>
  );
}

function ReportWrong({ source, kind, onUrgent }: { source: 'sample' | 'live'; kind: string; onUrgent: () => void }) {
  const { t } = useUi();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  return (
    <section className="mt-6 border-t border-black/10 pt-4">
      {!open ? (
        <button type="button" className="btn-quiet" onClick={() => { setOpen(true); setSaved(false); }} data-testid="report-open">⚑ {t('report')}</button>
      ) : saved ? (
        <p role="status" className="text-[#0f7b6c]" data-testid="report-saved">✓ {t('reportSaved')}</p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (isUrgent(note)) return onUrgent(); if (!note.trim()) return; saveReport({ source, kind, note }); setNote(''); setSaved(true); }}>
          <label className="block font-semibold" htmlFor="report-note">{t('report')}</label>
          <p className="text-sm text-black/60">{t('reportHint')}</p>
          <textarea id="report-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={280} rows={2} className="field mt-2 w-full" />
          <div className="mt-2 flex gap-2">
            <button className="btn-ink" type="submit">{t('send')}</button>
            <button className="btn-quiet" type="button" onClick={() => setOpen(false)}>{t('cancel')}</button>
          </div>
        </form>
      )}
    </section>
  );
}
