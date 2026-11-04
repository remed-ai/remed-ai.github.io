import type { ReactNode } from 'react';
import { Link, usePath } from '../lib/router';
import { LangBar } from '../demo/LangBar';
import { useUi } from './UiContext';

/** Shared header and footer for the normal pages. */
export function Layout({ children }: { children: ReactNode }) {
  const { t } = useUi();
  const path = usePath();
  const nav: [string, string][] = [['/scan', t('scanNow')], ['/history', t('history')], ['/about', t('about')]];
  return (
    <div className="mx-auto flex min-h-[100svh] max-w-3xl flex-col px-4">
      <header className="flex flex-wrap items-center justify-between gap-3 py-4">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">Remed<span className="text-accent">-AI</span></Link>
        <LangBar />
      </header>
      <nav className="mb-4 flex gap-1 rounded-full bg-sand p-1" aria-label="Main">
        {nav.map(([to, label]) => (
          <Link key={to} to={to} aria-current={path.startsWith(to) ? 'page' : undefined}
            className={`flex-1 rounded-full px-3 py-2 text-center font-semibold ${path.startsWith(to) ? 'bg-white shadow-sm' : 'text-muted'}`}>
            {label}
          </Link>
        ))}
      </nav>
      <main className="flex-1 pb-10">{children}</main>
      <footer className="border-t border-ink/10 py-5 text-center text-sm text-muted">Not professional medical advice.</footer>
    </div>
  );
}
