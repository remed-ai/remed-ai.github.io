import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Confidence, FollowUpAnswer, ScanResult, Tri } from '../scan/schema';
import { asksForDose, flagLab, gateResult, isUrgent } from '../scan/safety';
import { doseRefusal, sampleFollowUp, OUT_OF_SCOPE } from '../scan/followup';
import { cooldownLeft, markLiveCall } from '../scan/rateLimit';
import { saveReport } from '../scan/reports';
import { saveMedicine } from '../scan/medicines';
import { summarize } from '../scan/summary';
import { canListen, listen, speak, speechSupported, stopSpeaking } from '../lib/speech';
import { STRINGS, type StringKey } from '../i18n/strings';
import { useUi } from '../ui/UiContext';
import { IconCheck, IconFlag, IconMic, IconPause, IconPlay, IconRepeat, IconClock, IconWarn } from '../ui/icons';
import { getLiveProvider, type ScanState } from './useScanner';
import { UrgentHelp } from './UrgentHelp';
import { LangSwitch } from '../ui/LangSwitch';

const CONF_DOT: Record<Confidence, string> = { high: 'bg-teal', medium: 'bg-marigold', low: 'bg-brick' };

function ConfBadge({ c }: { c: Confidence }) {
  const { t } = useUi();
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
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
  autoRead?: boolean;
  /** Hide the "save to My Medicines" action. */
  noSave?: boolean;
}

export function ResultView({ state, onCorrect, onRescan, onAnother, anotherLabel, autoRead, noSave }: Props) {
  const { t, lang, rate } = useUi();
  const r = state.result as ScanResult;
  const gate = useMemo(() => gateResult(r), [r]);
  const summary = useMemo(() => summarize(r, lang), [r, lang]);
  const [sel, setSel] = useState<number | null>(null);
  const [urgent, setUrgent] = useState(false);
  const [voiceMsg, setVoiceMsg] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [slow, setSlow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [saved, setSaved] = useState(false);
  const tr = (x: Tri) => x[lang] || x.en;

  const boxes = useMemo(() => [...r.printed.map((p) => p.box ?? null), ...r.labValues.map((v) => v.box ?? null)], [r]);
  const selBox = sel != null ? boxes[sel] : null;
  const warnings = r.printed.filter((p) => p.field === 'warnings');

  const readAloud = async () => {
    const L = STRINGS[lang];
    const lines = [`${summary.title}.`, ...summary.lines.map((l) => `${l}.`)];
    if (gate.stop) lines.push(L.notSure);
    else {
      warnings.forEach((w) => lines.push(`${L.f_warnings}: ${w.value}`));
      r.labValues.forEach((v) => lines.push(`${v.test}: ${v.value} ${v.unit}. ${L[`flag_${flagLab(v)}` as StringKey]}.`));
      r.explanations.forEach((e) => lines.push(`${L.aiExplanation} ${tr(e.text)}`));
    }
    lines.push(L.notAdvice);
    const ok = await speak(lines.join(' '), lang, (slow ? 0.7 : 1) * rate, () => setSpeaking(false));
    setSpeaking(ok);
    setVoiceMsg(ok ? '' : t('noVoice', { lang: STRINGS[lang].langName }));
  };
  const stop = () => {
    stopSpeaking();
    setSpeaking(false);
  };

  useEffect(() => {
    if (autoRead) void readAloud();
    return () => void stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r]);

  return (
    <div className="rise" data-testid="result">
      {urgent && <UrgentHelp onClose={() => setUrgent(false)} />}

      {state.image && (
        <figure className="mb-4">
          <div className="relative mx-auto w-full overflow-hidden bg-sunken" style={{ aspectRatio: String(state.aspect), borderRadius: 'var(--radius-card)', maxHeight: 320, maxWidth: 320 * state.aspect }}>
            <img src={state.image} alt={t('whatScanned')} className="absolute inset-0 size-full object-contain" />
            {selBox && (
              <div className="src-highlight absolute" data-testid="highlight" aria-hidden
                style={{ left: `${selBox[0] * 100}%`, top: `${selBox[1] * 100}%`, width: `${selBox[2] * 100}%`, height: `${selBox[3] * 100}%` }} />
            )}
          </div>
          <figcaption className="mt-1.5 text-center text-xs text-ink-faint">{t('whatScanned')}</figcaption>
        </figure>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className={`badge ${state.source === 'sample' ? 'badge-sample' : 'badge-live'}`} data-testid="result-source">
          {state.source === 'sample' ? t('sampleResult') : t('liveResult')}
        </span>
        {!gate.stop && <ConfBadge c={r.overallConfidence} />}
      </div>
      <div className="mt-3"><LangSwitch /></div>

      {gate.stop ? (
        <div className="card mt-4 p-5 text-center" role="alert" data-testid="not-sure">
          <IconWarn size={34} className="mx-auto mb-2 text-brick" />
          <h2 className="text-2xl">{t('notSure')}</h2>
          <p className="mt-2 text-ink-soft">{t(`reason_${gate.reason}` as StringKey)}</p>
          {r.unclear.map((u, i) => <p key={i} className="mt-1 text-sm text-ink-faint">{tr(u)}</p>)}
          <button type="button" onClick={onRescan} className="btn-primary mt-4 w-full">{t('rescan')}</button>
        </div>
      ) : (
        <>
          {r.unclear.length > 0 && (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-brick-tint px-3 py-2 text-sm font-bold text-brick">
              <IconWarn size={18} /> {t('unclearFlag')}
            </p>
          )}
          <h2 className="mb-1 mt-4"><span className="result-title">{summary.title}</span></h2>

          <section className="mt-5" data-testid="summary">
            <h3 className="eyebrow mb-2">{t('whatThisIs')}</h3>
            <span className="sr-only">{summary.title}</span>
            <ul className="dot-list grid gap-1.5 text-lg">{summary.lines.map((l, i) => <li key={i}>{l}</li>)}</ul>
          </section>

          {(warnings.length > 0 || r.explanations.length > 0 || state.interaction) && (
            <section className="mt-6">
              <h3 className="eyebrow mb-2">{t('whatToKnow')}</h3>
              {state.interaction && (
                <div className="mb-3 rounded-xl border border-marigold bg-marigold-tint p-3" role="note" data-testid="interaction">
                  <p className="font-bold">{t('interaction')}</p>
                  <p className="mt-1">{tr(state.interaction)}</p>
                </div>
              )}
              <ul className="dot-list grid gap-2">
                {warnings.map((w, i) => <li key={`w${i}`}><strong>{t('f_warnings')}:</strong> {w.value}</li>)}
                {r.explanations.map((e, i) => (
                  <li key={`e${i}`}><AiLabel /> <span className="font-bold">{e.topic}.</span> {tr(e.text)}</li>
                ))}
              </ul>
            </section>
          )}

          {r.labValues.length > 0 && (
            <section className="mt-6" data-testid="lab">
              <h3 className="eyebrow mb-1">{t('lab')}</h3>
              <p className="mb-2 text-sm text-ink-soft">{t('labNote')}</p>
              <ul className="grid gap-2">
                {r.labValues.map((v, k) => {
                  const f = flagLab(v);
                  const i = r.printed.length + k;
                  return (
                    <li key={k}>
                      <button type="button" onClick={() => setSel(sel === i ? null : i)} aria-pressed={sel === i} className={`detail ${sel === i ? 'detail-on' : ''}`}>
                        <span className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-bold">{v.test}</span>
                          <span className={`flag flag-${f}`}>{t(`flag_${f}` as StringKey)}</span>
                        </span>
                        <span className="mt-1 block text-lg">{v.value} {v.unit} <span className="text-ink-faint">· {v.printedRange || '—'}</span></span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {r.printed.length > 0 && (
            <section className="mt-6">
              <button type="button" className="eyebrow flex w-full items-center justify-between py-1" aria-expanded={showDetails} onClick={() => setShowDetails(!showDetails)} data-testid="toggle-details">
                {t('details')} <span className="text-ink-faint normal-case tracking-normal">{showDetails ? t('fewerDetails') : t('moreDetails')}</span>
              </button>
              {showDetails && (
                <>
                  <p className="mb-2 text-sm text-ink-soft">{t('tapDetail')}</p>
                  <ul className="grid gap-2">
                    {r.printed.map((p, i) => (
                      <DetailRow key={i} index={i} selected={sel === i} onSelect={() => setSel(sel === i ? null : i)}
                        label={t(`f_${p.field}` as StringKey)} value={p.value} confidence={p.confidence} corrected={!!p.corrected}
                        hasBox={!!p.box} asPrinted={p.field === 'directions'} onCorrect={(v) => (isUrgent(v) ? setUrgent(true) : onCorrect(i, v))} />
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}

          {r.doctorQuestions.length > 0 && (
            <section className="mt-6">
              <h3 className="eyebrow mb-2">{t('doctorQs')}</h3>
              <ul className="dot-list grid gap-1.5">{r.doctorQuestions.map((q, i) => <li key={i}>{tr(q)}</li>)}</ul>
            </section>
          )}

          <FollowUp result={r} source={state.source} onUrgent={() => setUrgent(true)} />
        </>
      )}

      <p className="mt-6 text-sm italic text-ink-faint">{t('guideNote')} Not professional medical advice.</p>

      {speechSupported() && (
        <div className="readaloud mt-4">
          <button type="button" className="ra-btn ra-play" onClick={speaking ? stop : readAloud} aria-label={speaking ? t('pause') : t('play')} data-testid="read-aloud">
            {speaking ? <IconPause size={20} /> : <IconPlay size={20} />}
          </button>
          <button type="button" className="ra-btn" onClick={() => { stop(); void readAloud(); }} aria-label={t('repeat')}><IconRepeat size={18} /></button>
          <button type="button" className="ra-btn" aria-pressed={slow} onClick={() => setSlow(!slow)}><IconClock size={18} />{t('slower')}</button>
          {speaking && <span className="eq" aria-hidden><span /><span /><span /></span>}
        </div>
      )}
      {(voiceMsg || !speechSupported()) && <p role="status" className="mt-2 text-center text-xs text-ink-faint">{voiceMsg || t('noVoice', { lang: STRINGS[lang].langName })}</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {!noSave && !gate.stop && r.kind === 'medicine' && (
          <button type="button" className="btn-secondary" disabled={saved} data-testid="save-med" onClick={() => { saveMedicine(r, state); setSaved(true); }}>
            {saved && <IconCheck size={18} />}
            {saved ? t('savedMed') : t('saveMed')}
          </button>
        )}
        {onAnother && <button type="button" className="btn-primary" onClick={onAnother} data-testid="scan-another">{anotherLabel ?? t('scanElse')}</button>}
      </div>

      <ReportWrong source={state.source} kind={r.kind} onUrgent={() => setUrgent(true)} />
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
    <li className={`detail ${p.selected ? 'detail-on' : ''}`}>
      <button type="button" onClick={p.onSelect} aria-pressed={p.selected} className="block w-full text-left" data-testid={`detail-${p.index}`}>
        <span className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">{p.label}{p.asPrinted && ` · ${t('asPrinted')}`}</span>
          <ConfBadge c={p.confidence} />
        </span>
        <span className="mt-0.5 block text-lg leading-snug">{p.value}</span>
        {p.corrected && <span className="mt-1 block text-sm text-teal-deep">{t('corrected')}</span>}
        {p.selected && !p.hasBox && <span className="mt-1 block text-sm text-ink-faint">{t('noLocation')}</span>}
      </button>
      {editing ? (
        <form className="mt-2 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); if (draft.trim()) p.onCorrect(draft.trim()); setEditing(false); }}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} aria-label={`${t('edit')}: ${p.label}`} className="field flex-1" maxLength={160} />
          <button className="btn-ink" type="submit">{t('save')}</button>
          <button className="btn-ghost" type="button" onClick={() => setEditing(false)}>{t('cancel')}</button>
        </form>
      ) : (
        <button type="button" className="mt-1 text-sm font-bold text-teal-deep underline underline-offset-4" onClick={() => { setDraft(p.value); setEditing(true); }}>{t('edit')}</button>
      )}
    </li>
  );
}

function FollowUp({ result, source, onUrgent }: { result: ScanResult; source: 'sample' | 'live'; onUrgent: () => void }) {
  const { t, lang } = useUi();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [hearing, setHearing] = useState(false);
  const [ans, setAns] = useState<FollowUpAnswer | null>(null);
  const [note, setNote] = useState('');

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
      <h3 className="eyebrow mb-1">{t('askTitle')}</h3>
      <p className="mb-2 text-sm text-ink-soft">{t('askHint')}</p>
      <form onSubmit={submit} className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} className="field min-w-0 flex-1" placeholder={t('askPlaceholder')} aria-label={t('askTitle')} maxLength={300} data-testid="ask-input" />
        {canListen() && (
          <button type="button" className="btn-ghost" aria-pressed={hearing} aria-label={hearing ? t('listening') : t('speak')} data-testid="mic"
            onClick={async () => { setHearing(true); const heard = await listen(lang); setHearing(false); if (heard) { setQ(heard); void ask(heard); } }}>
            <IconMic size={20} />
          </button>
        )}
        <button className="btn-ink" type="submit" disabled={busy}>{busy ? '…' : t('ask')}</button>
      </form>
      {note && <p className="mt-2 text-sm" role="status">{note}</p>}
      {ans && (
        <div className="card mt-3 p-4" role="status" data-testid="answer">
          <AiLabel />
          <p className="mt-1">{ans.answer[lang] || ans.answer.en}</p>
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
    <section className="mt-5 border-t border-line pb-2 pt-4">
      {!open ? (
        <button type="button" className="inline-flex items-center gap-2 text-sm font-bold text-ink-soft" onClick={() => { setOpen(true); setSaved(false); }} data-testid="report-open">
          <IconFlag size={16} />
          {t('report')}
        </button>
      ) : saved ? (
        <p role="status" className="inline-flex items-center gap-2 text-teal-deep" data-testid="report-saved"><IconCheck size={18} />{t('reportSaved')}</p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (isUrgent(note)) return onUrgent(); if (!note.trim()) return; saveReport({ source, kind, note }); setNote(''); setSaved(true); }}>
          <label className="block font-bold" htmlFor="report-note">{t('report')}</label>
          <p className="text-sm text-ink-soft">{t('reportHint')}</p>
          <textarea id="report-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={280} rows={2} className="field mt-2" />
          <div className="mt-2 flex gap-2">
            <button className="btn-ink" type="submit">{t('send')}</button>
            <button className="btn-ghost" type="button" onClick={() => setOpen(false)}>{t('cancel')}</button>
          </div>
        </form>
      )}
    </section>
  );
}
