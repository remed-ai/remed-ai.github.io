import { useMemo, useState } from 'react';
import { Link, navigate } from '../lib/router';
import { clearHistory, deleteHistory, getHistory, listHistory, type HistoryItem } from '../scan/history';
import { sampleById } from '../scan/samples';
import { svgDataUrl } from '../scan/sampleArt';
import { summarize } from '../scan/summary';
import { ResultView } from '../scanner/ResultView';
import { AppShell } from '../ui/AppShell';
import { useUi } from '../ui/UiContext';
import { IconHistory, IconTrash } from '../ui/icons';

export const historyImage = (h: HistoryItem) => h.thumb ?? (h.sampleId ? svgDataUrl(sampleById(h.sampleId)?.art.svg ?? '') : null);

export function HistoryPage({ id }: { id?: string }) {
  const { t, lang } = useUi();
  const [items, setItems] = useState(listHistory);
  const item = useMemo(() => (id ? getHistory(id) : undefined), [id]);

  if (id && item) {
    const state = { phase: 'result' as const, source: item.source, image: historyImage(item), aspect: item.aspect, result: item.result, sampleId: null, cooldownS: 0, interaction: null };
    return (
      <AppShell back="/history">
        <p className="mb-3 text-sm text-ink-faint">{new Date(item.at).toLocaleString()} · {t('historyNote')}</p>
        <ResultView state={state} onCorrect={() => {}} onRescan={() => navigate('/scan')} onAnother={() => navigate('/scan')} />
        <button type="button" className="btn-ghost mt-2" onClick={() => { deleteHistory(item.id); navigate('/history', true); }}><IconTrash size={18} />{t('delete')}</button>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-3 grid grid-cols-[44px_1fr_44px] items-center">
        <span />
        <h1 className="m-0 text-center text-xl">{t('history')}</h1>
        {items.length > 0 ? (
          <button type="button" className="icon-btn" aria-label={t('clearHistory')} onClick={() => { clearHistory(); setItems([]); }}><IconTrash size={20} /></button>
        ) : <span />}
      </div>
      {items.length === 0 ? (
        <div className="px-4 pb-4 pt-10 text-center" data-testid="history-empty">
          <IconHistory size={40} className="mx-auto mb-3 text-ink-faint" />
          <h2 className="text-xl">{t('histEmptyTitle')}</h2>
          <p className="mx-auto mb-5 max-w-[34ch] text-ink-soft">{t('histEmptyBody')}</p>
          <Link to="/scan" className="btn-primary">{t('histEmptyCta')}</Link>
        </div>
      ) : (
        <ul className="grid gap-3" data-testid="history-list">
          {items.map((h) => {
            const img = historyImage(h);
            return (
              <li key={h.id}>
                <Link to={`/history/${h.id}`} className="detail flex items-center gap-3 p-3">
                  {img ? <img src={img} alt="" className="size-14 flex-none rounded-lg bg-sunken object-cover" /> : <span className="size-14 flex-none rounded-lg bg-sunken" />}
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{summarize(h.result, lang).title}</span>
                    <span className="block text-xs text-ink-faint">{new Date(h.at).toLocaleString()} · {h.source === 'sample' ? t('sampleResult') : t('liveResult')}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
