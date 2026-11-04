import type { Lang } from '../scan/schema';
import { STRINGS } from '../i18n/strings';
import { useUi } from '../ui/UiContext';

const LANGS: Lang[] = ['en', 'hi', 'pa'];

/** Instant language switch + large text toggle. */
export function LangBar() {
  const { lang, setLang, large, setLarge } = useUi();
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)}
          className={`min-h-10 rounded-full px-3 text-base font-semibold ${lang === l ? 'bg-ink text-white' : 'bg-white text-ink border border-ink/10'}`}>
          {STRINGS[l].langName}
        </button>
      ))}
      <button type="button" aria-pressed={large} aria-label="Large text" onClick={() => setLarge(!large)}
        className={`min-h-10 rounded-full px-3 text-base font-bold ${large ? 'bg-ink text-white' : 'bg-white border border-ink/10'}`}>
        A+
      </button>
    </div>
  );
}
