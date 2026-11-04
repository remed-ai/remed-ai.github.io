import { useState } from 'react';
import { Link } from '../lib/router';
import { expiryStatus, listMedicines, removeMedicine } from '../scan/medicines';
import { sampleById } from '../scan/samples';
import { svgDataUrl } from '../scan/sampleArt';
import { AppShell } from '../ui/AppShell';
import { useUi } from '../ui/UiContext';
import { IconPill, IconTrash } from '../ui/icons';

export function MedicinesPage() {
  const { t } = useUi();
  const [meds, setMeds] = useState(listMedicines);
  return (
    <AppShell title={t('medsTitle')}>
      {meds.length === 0 ? (
        <div className="px-4 pb-4 pt-10 text-center" data-testid="meds-empty">
          <IconPill size={40} className="mx-auto mb-3 text-ink-faint" />
          <h2 className="text-xl">{t('medsEmptyTitle')}</h2>
          <p className="mx-auto mb-5 max-w-[34ch] text-ink-soft">{t('medsEmptyBody')}</p>
          <Link to="/scan" className="btn-primary">{t('medsEmptyCta')}</Link>
        </div>
      ) : (
        <ul className="grid gap-3" data-testid="meds-list">
          {meds.map((m) => {
            const status = expiryStatus(m.expiry);
            const img = m.sampleId ? svgDataUrl(sampleById(m.sampleId)?.art.svg ?? '') : m.thumb;
            return (
              <li key={m.id} className="card p-3.5">
                <div className="flex items-center gap-3">
                  {img ? <img src={img} alt="" className="size-12 flex-none rounded-lg bg-sunken object-cover" /> : <span className="grid size-12 flex-none place-items-center rounded-lg bg-sunken text-ink-faint"><IconPill /></span>}
                  <div className="min-w-0 flex-1">
                    <p className="m-0 font-bold">{m.name}</p>
                    {m.strength && <p className="m-0 text-sm text-ink-soft">{m.strength}</p>}
                  </div>
                  <button type="button" className="icon-btn text-ink-faint" aria-label={`${t('remove')} ${m.name}`} onClick={() => { removeMedicine(m.id); setMeds(listMedicines()); }}><IconTrash size={20} /></button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  {m.expiry && (
                    <span className={`rounded-full px-3 py-1 font-bold ${status === 'expired' ? 'bg-brick-tint text-brick' : status === 'soon' ? 'bg-marigold-tint text-marigold-deep' : 'bg-teal-tint text-teal-deep'}`}>
                      {t('expiresOn')}: {m.expiry}{status === 'expired' ? ` · ${t('expiredFlag')}` : status === 'soon' ? ` · ${t('expiringFlag')}` : ''}
                    </span>
                  )}
                </div>
                {m.directions && <p className="mb-0 mt-2 text-sm text-ink-soft"><span className="font-bold">{t('asPrinted')}:</span> {m.directions}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
