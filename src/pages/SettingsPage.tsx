import { CONFIG } from '../config';
import { STRINGS } from '../i18n/strings';
import type { Lang } from '../scan/schema';
import { AppShell } from '../ui/AppShell';
import { useUi } from '../ui/UiContext';

function Switch({ on, onChange, label }: { on: boolean; onChange: (b: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className="switch" onClick={() => onChange(!on)}><span /></button>;
}

export function SettingsPage() {
  const { t, lang, setLang, contrast, rate, scale, set } = useUi();
  const pill = (on: boolean) => `min-h-[46px] rounded-full border-[1.5px] px-4 font-bold ${on ? 'border-ink bg-ink text-raised' : 'border-line bg-raised'}`;
  return (
    <AppShell title={t('settingsTitle')}>
      <section className="border-b border-line pb-5">
        <h2 className="eyebrow mb-3">{t('language')}</h2>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('language')}>
          {(['en', 'hi', 'pa'] as Lang[]).map((l) => (
            <button key={l} type="button" role="radio" aria-checked={lang === l} lang={l} className={pill(lang === l)} onClick={() => setLang(l)}>{STRINGS[l].langName}</button>
          ))}
        </div>
      </section>

      <section className="border-b border-line py-5">
        <h2 className="eyebrow mb-1">{t('accessibility')}</h2>
        <div className="flex items-center justify-between gap-4 py-3">
          <div><p className="m-0 font-bold">{t('highContrast')}</p><p className="m-0 text-sm text-ink-soft">{t('highContrastDesc')}</p></div>
          <Switch on={contrast} onChange={(b) => set({ contrast: b })} label={t('highContrast')} />
        </div>
        <p className="mb-2 mt-3 font-bold">{t('voiceSpeed')}</p>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('voiceSpeed')}>
          {([[1, 'speedNormal'], [0.8, 'speedSlow'], [0.6, 'speedSlower']] as const).map(([r, k]) => (
            <button key={r} type="button" role="radio" aria-checked={rate === r} className={pill(rate === r)} onClick={() => set({ rate: r })}>{t(k)}</button>
          ))}
        </div>
        <label className="mb-1 mt-5 block font-bold" htmlFor="scale">{t('textSize')}</label>
        <input id="scale" type="range" min={0.9} max={1.6} step={0.1} value={scale} onChange={(e) => set({ scale: Number(e.target.value) })} className="w-full accent-[var(--marigold)]" />
      </section>

      <section className="py-5">
        <h2 className="eyebrow mb-2">{t('aboutTitle')}</h2>
        <p className="text-ink-soft">{t('aboutBody')}</p>
        <p className="text-sm text-ink-soft">{t('privacyBody')}</p>
        <p className="text-sm font-bold">{t('emergencyLine', { n: CONFIG.emergencyNumber })}</p>
        <p className="text-sm text-ink-faint">Not professional medical advice.</p>
      </section>
    </AppShell>
  );
}
