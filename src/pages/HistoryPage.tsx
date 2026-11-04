import { useMemo, useState } from 'react';
import { Link, navigate } from '../lib/router';
import { clearHistory, deleteHistory, getHistory, listHistory, type HistoryItem } from '../scan/history';
import { sampleById } from '../scan/samples';
import { svgDataUrl } from '../scan/sampleArt';
import { summarize } from '../scan/summary';
import { ResultView } from '../demo/ResultView';
import { Layout } from '../ui/Layout';
import { useUi } from '../ui/UiContext';

const imageFor = (h: HistoryItem) => h.thumb ?? (h.sampleId ? svgDataUrl(sampleById(h.sampleId)?.art.svg ?? '') : null);

export function HistoryPage({ id }: { id?: string }) {
  const { t, lang } = useUi();
  const [items, setItems] = useState(listHistory);
  const item = useMemo(() => (id ? getHistory(id) : undefined), [id]);

  if (id && item) {
    const state = { phase: 'result' as const, source: item.source, image: imageFor(item), aspect: item.aspect, result: item.result, sampleId: null, cooldownS: 0, interaction: null };
    return (
      <Layout>
        <p className="mb-3 text-muted">{new Date(item.at).toLocaleString()} · {t('historyNote')}</p>
        <ResultView state={state} onCorrect={() => {}} onRescan={() => navigate('/scan')} onAnother={() => navigate('/scan')} />
        <div className="mt-4 flex gap-2">
          <Link to="/history" className="btn-quiet">← {t('history')}</Link>
          <button type="button" className="btn-quiet" onClick={() => { deleteHistory(item.id); navigate('/history', true); }}>{t('delete')}</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="mb-1 text-3xl font-extrabold">{t('history')}</h1>
      <p className="mb-4 text-muted">{t('historyNote')}</p>
      {items.length === 0 ? (
        <div className="card p-6 text-center" data-testid="history-empty">
          <p className="text-lg">{t('historyEmpty')}</p>
          <Link to="/scan" className="btn-primary mt-4">{t('scanNow')}</Link>
        </div>
      ) : (
        <>
          <ul className="grid gap-3" data-testid="history-list">
            {items.map((h) => {
              const s = summarize(h.result, lang);
              const img = imageFor(h);
              return (
                <li key={h.id}>
                  <Link to={`/history/${h.id}`} className="card flex w-full min-w-0 items-center gap-3 p-3">
                    {img ? <img src={img} alt="" className="h-16 w-20 shrink-0 rounded-xl bg-sand object-contain" /> : <span className="h-16 w-20 shrink-0 rounded-xl bg-sand" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg font-bold">{s.title}</span>
                      <span className="block truncate text-muted">{s.lines[0] ?? ''}</span>
                      <span className="block text-sm text-muted">{new Date(h.at).toLocaleString()} · {h.source === 'sample' ? t('sampleResult') : t('liveResult')}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <button type="button" className="btn-quiet mt-5" onClick={() => { clearHistory(); setItems([]); }}>{t('clearHistory')}</button>
        </>
      )}
    </Layout>
  );
}
