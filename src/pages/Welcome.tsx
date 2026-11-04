import { Link } from '../lib/router';
import { LangBar } from '../demo/LangBar';
import { useUi } from '../ui/UiContext';

export function Welcome() {
  const { t } = useUi();
  return (
    <div className="flex min-h-[100svh] flex-col items-center px-4 text-center">
      <div className="flex w-full max-w-3xl justify-end py-4"><LangBar /></div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">Remed<span className="text-accent">-AI</span></h1>
        <p className="max-w-sm text-xl text-muted" data-testid="welcome-line">{t('welcome')}</p>
        <Link to="/scan" data-testid="scan-now" className="relative mt-4 grid size-56 place-items-center sm:size-64">
          <span className="orb-halo" aria-hidden />
          <span className="scan-orb grid size-full place-items-center text-3xl">{t('scanNow')}</span>
        </Link>
        <p className="underheading mt-2" data-testid="underheading">Not professional medical advice.</p>
      </div>
      <nav className="flex gap-6 pb-8 text-lg font-semibold text-muted" aria-label="More">
        <Link to="/history">{t('history')}</Link>
        <Link to="/about">{t('about')}</Link>
      </nav>
    </div>
  );
}
