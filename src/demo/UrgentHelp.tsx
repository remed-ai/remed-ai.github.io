import { useEffect, useRef } from 'react';
import { CONFIG } from '../config';
import { useUi } from '../ui/UiContext';

/** Shown immediately when typed text suggests an emergency. Gives no dose or quantity information. */
export function UrgentHelp({ onClose }: { onClose: () => void }) {
  const { t } = useUi();
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4" role="alertdialog" aria-modal="true" aria-labelledby="urgent-title" aria-describedby="urgent-body">
      <div className="card w-full max-w-md p-6" data-testid="urgent-help">
        <h2 id="urgent-title" className="text-3xl font-extrabold text-[#9b1020]">{t('urgentTitle')}</h2>
        <p id="urgent-body" className="mt-3 text-lg leading-relaxed">{t('urgentBody')}</p>
        <p className="mt-2 text-base text-black/70">{t('urgentNoInfo')}</p>
        <a ref={ref} href={`tel:${CONFIG.emergencyNumber}`} className="mt-5 flex min-h-14 items-center justify-center rounded-2xl bg-[#b3121f] px-5 text-xl font-bold text-white">
          {t('urgentCall', { n: CONFIG.emergencyNumber })}
        </a>
        <button type="button" onClick={onClose} className="mt-3 min-h-12 w-full rounded-2xl border border-black/20 text-lg">{t('close')}</button>
      </div>
    </div>
  );
}
