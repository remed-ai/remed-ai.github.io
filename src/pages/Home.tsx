import { useMemo } from 'react';
import { Link } from '../lib/router';
import { quoteFor } from '../i18n/quotes';
import { listHistory } from '../scan/history';
import { summarize } from '../scan/summary';
import { AppShell } from '../ui/AppShell';
import { useUi } from '../ui/UiContext';
import { IconScan } from '../ui/icons';
import { historyImage } from './HistoryPage';

export function Home() {
  const { t, lang } = useUi();
  const quote = useMemo(() => quoteFor(lang), [lang]);
  const recent = useMemo(() => listHistory().slice(0, 3), []);
  return (
    <AppShell>
      <h1 className="sr-only">Remed-AI</h1>
      <p className="mb-6 mt-2 min-h-[2.7em] max-w-[22ch] font-display text-2xl leading-snug" data-testid="quote">{quote}</p>
      <Link to="/scan" className="scan-card" data-testid="scan-now">
        <span className="scan-ring"><IconScan size={34} /></span>
        <span className="font-display text-xl font-semibold">{t('scanCta')}</span>
      </Link>
      <p className="mt-3 text-center text-sm text-ink-soft">{t('scanSub')}</p>
      <p className="mt-1 text-center text-sm text-ink-faint" data-testid="underheading">Not professional medical advice.</p>

      {recent.length > 0 && (
        <section className="mt-8" aria-labelledby="recent-h">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 id="recent-h" className="eyebrow m-0">{t('recent')}</h2>
            <Link to="/history" className="text-sm font-bold text-teal-deep">{t('seeAll')}</Link>
          </div>
          <ul className="grid gap-2.5">
            {recent.map((h) => {
              const img = historyImage(h);
              return (
                <li key={h.id}>
                  <Link to={`/history/${h.id}`} className="detail flex items-center gap-3">
                    {img ? <img src={img} alt="" className="size-12 flex-none rounded-md bg-sunken object-cover" /> : <span className="size-12 flex-none rounded-md bg-sunken" />}
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{summarize(h.result, lang).title}</span>
                      <span className="block text-xs text-ink-faint">{new Date(h.at).toLocaleString()}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
