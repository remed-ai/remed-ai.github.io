import type { Lang } from '../scan/schema';
import { STRINGS } from '../i18n/strings';
import { useUi } from '../ui/UiContext';

const LANGS: Lang[] = ['en', 'hi', 'pa'];

/** Instant language switch + large text toggle. */
export function LangBar({ dark = false }: { dark?: boolean }) {
  const { lang, setLang, large, setLarge, t } = useUi();
  const base = dark ? 'border-white/20 text-white' : 'border-black/15 text-black';
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`min-h-11 rounded-full border px-4 text-base font-semibold transition ${base} ${lang === l ? (dark ? 'bg-mint text-ink border-mint' : 'bg-ink text-white border-ink') : ''}`}
        >
          {STRINGS[l].langName}
        </button>
      ))}
      <button
        type="button"
        aria-pressed={large}
        onClick={() => setLarge(!large)}
        className={`min-h-11 rounded-full border px-4 text-base ${base} ${large ? 'font-bold underline' : ''}`}
      >
        A+ {t('largeText')}
      </button>
    </div>
  );
}
