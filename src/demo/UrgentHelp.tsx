import { useEffect, useRef } from 'react';
import { CONFIG } from '../config';
import { useUi } from '../ui/UiContext';
import { IconPhone } from '../ui/icons';

/** Shown immediately when typed text suggests an emergency. Gives no dose or quantity information. */
export function UrgentHelp({ onClose }: { onClose: () => void }) {
  const { t } = useUi();
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[rgba(20,18,13,.55)] sm:items-center" role="alertdialog" aria-modal="true" aria-labelledby="urgent-title" aria-describedby="urgent-body">
      <div className="w-full max-w-md rounded-t-[18px] bg-raised p-6 sm:rounded-[18px]" style={{ paddingBottom: 'calc(1.5rem + var(--safe-b))' }} data-testid="urgent-help">
        <h2 id="urgent-title" className="text-2xl text-brick">{t('urgentTitle')}</h2>
        <p id="urgent-body" className="mt-2 text-lg">{t('urgentBody')}</p>
        <p className="text-ink-soft">{t('urgentNoInfo')}</p>
        <a ref={ref} href={`tel:${CONFIG.emergencyNumber}`} className="btn-primary mt-3 w-full border-brick bg-brick text-lg"><IconPhone size={20} />{t('urgentCall', { n: CONFIG.emergencyNumber })}</a>
        <button type="button" onClick={onClose} className="btn-ghost mt-3 w-full">{t('close')}</button>
      </div>
    </div>
  );
}
