import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../scan/schema';
import { translate, type StringKey } from '../i18n/strings';
import { store } from '../lib/storage';

export interface Prefs { lang: Lang; contrast: boolean; rate: number; scale: number }
const DEFAULTS: Prefs = { lang: 'en', contrast: false, rate: 1, scale: 1 };
const KEY = 'remed.prefs';

interface Ui extends Prefs {
  set: (p: Partial<Prefs>) => void;
  setLang: (l: Lang) => void;
  reset: () => void;
  t: (k: StringKey, vars?: Record<string, string | number>) => string;
}
const Ctx = createContext<Ui | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Prefs>(() => {
    // Drop the retired Simple Mode flag from older saved prefs.
    const saved: Partial<Prefs> & { simple?: unknown } = { ...store.get<Partial<Prefs>>(KEY, {}) };
    delete saved.simple;
    return { ...DEFAULTS, ...saved };
  });
  useEffect(() => {
    const h = document.documentElement;
    h.lang = p.lang;
    h.classList.toggle('high-contrast', p.contrast);
    h.style.setProperty('--text-scale', String(p.scale));
    store.set(KEY, p);
  }, [p]);
  const value = useMemo<Ui>(() => {
    const set = (x: Partial<Prefs>) => setP((o) => ({ ...o, ...x }));
    return {
      ...p, set,
      setLang: (lang) => set({ lang }),
      reset: () => setP(DEFAULTS),
      t: (k, v) => translate(p.lang, k, v),
    };
  }, [p]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUi(): Ui {
  const v = useContext(Ctx);
  if (!v) throw new Error('UiProvider missing');
  return v;
}
