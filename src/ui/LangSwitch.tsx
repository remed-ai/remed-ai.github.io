import type { Lang } from '../scan/schema';
import { STRINGS } from '../i18n/strings';
import { useUi } from './UiContext';

/** Compact language switch for staff and booth screens. */
export function LangSwitch() {
  const { lang, setLang } = useUi();
  return (
    <div className="flex gap-1.5" role="group" aria-label="Language">
      {(['en', 'hi', 'pa'] as Lang[]).map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={lang === l} onClick={() => setLang(l)} className="btn-ghost min-h-10 px-3 text-sm">{STRINGS[l].langName}</button>
      ))}
    </div>
  );
}
