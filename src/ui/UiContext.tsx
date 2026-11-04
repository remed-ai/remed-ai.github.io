import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../scan/schema';
import { translate, type StringKey } from '../i18n/strings';

interface Ui {
  lang: Lang;
  setLang: (l: Lang) => void;
  large: boolean;
  setLarge: (b: boolean) => void;
  t: (k: StringKey, vars?: Record<string, string | number>) => string;
}
const Ctx = createContext<Ui | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const [large, setLarge] = useState(false);
  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : lang;
    document.documentElement.classList.toggle('text-large', large);
  }, [lang, large]);
  const value = useMemo<Ui>(() => ({ lang, setLang, large, setLarge, t: (k, v) => translate(lang, k, v) }), [lang, large]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUi(): Ui {
  const v = useContext(Ctx);
  if (!v) throw new Error('UiProvider missing');
  return v;
}
