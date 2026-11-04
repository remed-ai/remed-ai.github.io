import type { Lang, ScanResult } from './schema';
import { flagLab, gateResult } from './safety';

type L = Record<Lang, string>;
const pick = (l: Lang, t: L) => t[l] || t.en;

/** Short plain summary built only from what is printed. No AI wording, no advice. */
export function summarize(r: ScanResult, lang: Lang): { title: string; lines: string[] } {
  const printed = (f: string) => r.printed.filter((p) => p.field === f).map((p) => p.value);
  const names = printed('name');
  const gate = gateResult(r);
  if (gate.stop) {
    return {
      title: pick(lang, { en: 'Could not read this clearly', hi: 'यह साफ़ नहीं पढ़ा जा सका', pa: 'ਇਹ ਸਾਫ਼ ਨਹੀਂ ਪੜ੍ਹਿਆ ਜਾ ਸਕਿਆ' }),
      lines: [pick(lang, { en: 'Please rescan or ask a pharmacist.', hi: 'कृपया फिर से स्कैन करें या फार्मासिस्ट से पूछें।', pa: 'ਕਿਰਪਾ ਕਰਕੇ ਮੁੜ ਸਕੈਨ ਕਰੋ ਜਾਂ ਫਾਰਮਾਸਿਸਟ ਨੂੰ ਪੁੱਛੋ।' })],
    };
  }
  const lines: string[] = [];
  if (r.kind === 'lab_report') {
    const out = r.labValues.filter((v) => ['below', 'above'].includes(flagLab(v)));
    lines.push(pick(lang, { en: `${r.labValues.length} test results`, hi: `${r.labValues.length} जाँच परिणाम`, pa: `${r.labValues.length} ਜਾਂਚ ਨਤੀਜੇ` }));
    lines.push(
      out.length
        ? pick(lang, { en: `Outside the printed range: ${out.map((v) => v.test).join(', ')}`, hi: `छपी सीमा से बाहर: ${out.map((v) => v.test).join(', ')}`, pa: `ਛਪੀ ਸੀਮਾ ਤੋਂ ਬਾਹਰ: ${out.map((v) => v.test).join(', ')}` })
        : pick(lang, { en: 'All within the printed ranges', hi: 'सभी छपी सीमा के अंदर', pa: 'ਸਾਰੇ ਛਪੀ ਸੀਮਾ ਦੇ ਅੰਦਰ' }),
    );
    return { title: pick(lang, { en: 'Lab report', hi: 'लैब रिपोर्ट', pa: 'ਲੈਬ ਰਿਪੋਰਟ' }), lines };
  }
  if (r.kind === 'prescription') {
    lines.push(pick(lang, { en: `Medicines listed: ${names.join(', ') || '—'}`, hi: `लिखी दवाएँ: ${names.join(', ') || '—'}`, pa: `ਲਿਖੀਆਂ ਦਵਾਈਆਂ: ${names.join(', ') || '—'}` }));
    lines.push(pick(lang, { en: 'Confirm handwriting with your pharmacist.', hi: 'हाथ की लिखावट फार्मासिस्ट से पक्की करें।', pa: 'ਹੱਥ ਦੀ ਲਿਖਤ ਫਾਰਮਾਸਿਸਟ ਤੋਂ ਪੱਕੀ ਕਰੋ।' }));
    return { title: pick(lang, { en: 'Prescription', hi: 'पर्चा', pa: 'ਪਰਚੀ' }), lines };
  }
  const ingr = printed('strength')[0] ?? printed('ingredient')[0];
  const exp = printed('expiry')[0];
  const dir = printed('directions')[0];
  if (ingr) lines.push(ingr);
  if (exp) lines.push(pick(lang, { en: `Expiry: ${exp}`, hi: `समाप्ति: ${exp}`, pa: `ਮਿਆਦ: ${exp}` }));
  if (dir) lines.push(pick(lang, { en: `Directions as printed: ${dir}`, hi: `छपे निर्देश: ${dir}`, pa: `ਛਪੀਆਂ ਹਿਦਾਇਤਾਂ: ${dir}` }));
  return { title: names[0] ?? pick(lang, { en: 'Scanned item', hi: 'स्कैन की गई वस्तु', pa: 'ਸਕੈਨ ਕੀਤੀ ਚੀਜ਼' }), lines };
}
