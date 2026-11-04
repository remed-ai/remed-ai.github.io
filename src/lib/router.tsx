import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react';

/** Tiny history router. Works under any Vite base path; GitHub Pages serves 404.html = index.html. */
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function currentPath(): string {
  let p = location.pathname;
  if (base && p.startsWith(base)) p = p.slice(base.length);
  p = p.replace(/\/+$/, '');
  return p || '/';
}

export const href = (to: string) => `${base}${to}`;

export function navigate(to: string, replace = false) {
  history[replace ? 'replaceState' : 'pushState'](null, '', href(to));
  dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}

const subscribe = (cb: () => void) => {
  addEventListener('popstate', cb);
  return () => removeEventListener('popstate', cb);
};
export const usePath = () => useSyncExternalStore(subscribe, currentPath, () => '/');

export function Link({ to, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={href(to)} onClick={go} {...rest} />;
}
