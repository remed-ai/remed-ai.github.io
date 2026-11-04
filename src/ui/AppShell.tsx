import type { ReactNode } from 'react';
import { Link, usePath } from '../lib/router';
import { useUi } from './UiContext';
import { BrandMark, IconHistory, IconHome, IconLines, IconPill, IconSettings, IconBack } from './icons';
import type { StringKey } from '../i18n/strings';

const NAV: { to: string; label: StringKey; Icon: typeof IconHome }[] = [
  { to: '/', label: 'navHome', Icon: IconHome },
  { to: '/history', label: 'navHistory', Icon: IconHistory },
  { to: '/medicines', label: 'navMeds', Icon: IconPill },
  { to: '/settings', label: 'navSettings', Icon: IconSettings },
];

/** Sticky header, centred column, fixed bottom navigation. */
export function AppShell({ children, title, back }: { children: ReactNode; title?: string; back?: string }) {
  const { t, simple, set } = useUi();
  const path = usePath();
  const active = (to: string) => (to === '/' ? path === '/' || path === '/scan' : path.startsWith(to));
  return (
    <div className="min-h-[100svh]" style={{ paddingBottom: 'calc(var(--nav-h) + var(--safe-b))' }}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-raised">Skip to content</a>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-line bg-paper px-4 py-3" style={{ paddingTop: 'calc(.75rem + var(--safe-t))' }}>
        <Link to="/" className="flex items-center gap-2 rounded-md p-0.5" aria-label="Remed-AI, home">
          <BrandMark />
          <span className="font-display text-xl font-semibold tracking-tight">Remed-AI</span>
        </Link>
        <button type="button" className="btn-ghost bg-raised text-sm" aria-pressed={simple} onClick={() => set({ simple: !simple })}>
          <IconLines size={18} />{t('simpleMode')}
        </button>
      </header>
      <main id="main" className="mx-auto max-w-[560px] px-4 pt-4 md:max-w-[640px]">
        {(title || back) && (
          <div className="mb-4 grid grid-cols-[44px_1fr_44px] items-center">
            {back ? <Link to={back} className="icon-btn" aria-label="Back"><IconBack /></Link> : <span />}
            {title && <h1 className="m-0 text-center text-xl">{title}</h1>}
            <span />
          </div>
        )}
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[640px] border-t border-line bg-raised px-1.5 pt-1.5 md:rounded-t-2xl md:border-x" style={{ paddingBottom: 'calc(.45rem + var(--safe-b))' }} aria-label="Primary">
        {NAV.map(({ to, label, Icon }) => (
          <Link key={to} to={to} aria-current={active(to) ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-xs font-bold ${active(to) ? 'text-marigold-deep' : 'text-ink-faint'}`}>
            <Icon size={21} />{t(label)}
          </Link>
        ))}
      </nav>
    </div>
  );
}
