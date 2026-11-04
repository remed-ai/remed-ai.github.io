import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../scan/schema';
import { translate, type StringKey } from '../i18n/strings';
import { store } from '../lib/storage';

export interface Prefs { lang: Lang; simple: boolean; contrast: boolean; rate: number; scale: number }
const DEFAULTS: Prefs = { lang: 'en', simple: false, contrast: false, rate: 1, scale: 1 };
const KEY = 'remed.prefs';

interface Ui extends Prefs {
  set: (p: Partial<Prefs>) => void;
  setLang: (l: Lang) => void;
  /** Legacy toggle used by booth mode: large text = scale 1.25. */
  large: boolean;
  setLarge: (b: boolean) => void;
  reset: () => void;
  t: (k: StringKey, vars?: Record<string, string | number>) => string;
}
const Ctx = createContext<Ui | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Prefs>(() => ({ ...DEFAULTS, ...store.get<Partial<Prefs>>(KEY, {}) }));
  useEffect(() => {
    const h = document.documentElement;
    h.lang = p.lang;
    h.classList.toggle('simple-mode', p.simple);
    h.classList.toggle('high-contrast', p.contrast);
    h.style.setProperty('--text-scale', String(p.scale));
    store.set(KEY, p);
  }, [p]);
  const value = useMemo<Ui>(() => {
    const set = (x: Partial<Prefs>) => setP((o) => ({ ...o, ...x }));
    return {
      ...p, set,
      setLang: (lang) => set({ lang }),
      large: p.scale > 1.1,
      setLarge: (b) => set({ scale: b ? 1.25 : 1 }),
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
