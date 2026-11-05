import { useMemo } from 'react';
import { ALL_ART, svgDataUrl } from '../scan/sampleArt';
import { LangSwitch } from '../ui/LangSwitch';
import { useUi } from '../ui/UiContext';
import { BrandMark, IconArrow, IconGlobe, IconLock, IconScan, IconShield } from '../ui/icons';
import type { StringKey } from '../i18n/strings';

const FEATURES: { Icon: typeof IconScan; title: StringKey; body: StringKey }[] = [
  { Icon: IconScan, title: 'featScanT', body: 'featScanB' },
  { Icon: IconGlobe, title: 'featLangT', body: 'featLangB' },
  { Icon: IconShield, title: 'featSafeT', body: 'featSafeB' },
  { Icon: IconLock, title: 'featPrivT', body: 'featPrivB' },
];

/** First-run welcome screen. "Get started" opens the app. */
export function Welcome({ onStart }: { onStart: () => void }) {
  const { t } = useUi();
  const strip = useMemo(() => svgDataUrl(ALL_ART()[0].svg), []);
  return (
    <div className="welcome flex min-h-[100svh] flex-col" data-testid="welcome">
      <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3" style={{ paddingTop: 'calc(.75rem + var(--safe-t))' }}>
        <span className="flex items-center gap-2">
          <BrandMark />
          <span className="font-display text-xl font-semibold tracking-tight">Remed-AI</span>
        </span>
        <LangSwitch />
      </header>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-8">
        <section className="grid items-center gap-8 pt-4 md:grid-cols-[1.05fr_1fr] md:gap-12 md:pt-12">
          <div className="rise">
            <p className="eyebrow mb-3">{t('welcomeEyebrow')}</p>
            <h1 className="m-0 text-[2.5rem] leading-[1.08] md:text-6xl">
              <span className="welcome-hl">{t('welcomeTitle')}</span>
            </h1>
            <p className="mt-5 max-w-[34ch] text-lg text-ink-soft md:text-xl">{t('welcomeLead')}</p>
            <div className="mt-7 hidden md:block">
              <button type="button" className="btn-primary min-h-14 px-7 text-lg" onClick={onStart}>
                {t('getStarted')}<IconArrow size={20} />
              </button>
            </div>
          </div>

          <figure className="welcome-hero m-0" aria-hidden>
            <div className="welcome-frame">
              <img src={strip} alt="" className="block w-full" />
              <span className="welcome-corner tl" /><span className="welcome-corner tr" />
              <span className="welcome-corner bl" /><span className="welcome-corner br" />
              <span className="welcome-sweep" />
            </div>
            <div className="welcome-chip card">
              <span className="welcome-chip-dot"><IconScan size={18} /></span>
              <span>
                <span className="block font-bold">ZENTROVA 500</span>
                <span className="block text-sm text-ink-soft">EXP 08/2028</span>
              </span>
              <span className="badge badge-sample ml-auto">{t('sampleResult')}</span>
            </div>
          </figure>
        </section>

        <section className="mt-12 grid gap-3 sm:grid-cols-2 md:mt-16 md:grid-cols-4" aria-label="Features">
          {FEATURES.map(({ Icon, title, body }) => (
            <div key={title} className="card p-5">
              <span className="welcome-icon"><Icon size={22} /></span>
              <h2 className="mb-1 mt-3 text-lg">{t(title)}</h2>
              <p className="m-0 text-ink-soft">{t(body)}</p>
            </div>
          ))}
        </section>

        <p className="mt-8 rounded-xl border border-line bg-teal-tint px-4 py-3 text-teal-deep">{t('welcomeLimit')}</p>
        <p className="mt-3 text-sm text-ink-faint" data-testid="underheading">Not professional medical advice.</p>
      </main>

      <div className="sticky bottom-0 border-t border-line bg-paper px-4 pt-3 md:hidden" style={{ paddingBottom: 'calc(.75rem + var(--safe-b))' }}>
        <button type="button" className="btn-primary min-h-14 w-full text-lg" onClick={onStart} data-testid="get-started">
          {t('getStarted')}<IconArrow size={20} />
        </button>
      </div>
    </div>
  );
}
