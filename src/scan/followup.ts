import type { FollowUpAnswer, PrintedField, ScanResult, Tri } from './schema';
import { flagLab } from './safety';

const tri = (en: string, hi: string, pa: string): Tri => ({ en, hi, pa });

export const OUT_OF_SCOPE: Tri = tri(
  'I can only answer about what is printed on this item. Please ask a pharmacist.',
  'मैं केवल इस पर छपी जानकारी के बारे में बता सकता हूँ। कृपया फार्मासिस्ट से पूछें।',
  'ਮੈਂ ਸਿਰਫ਼ ਇਸ ਉੱਤੇ ਛਪੀ ਜਾਣਕਾਰੀ ਬਾਰੇ ਦੱਸ ਸਕਦਾ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਫਾਰਮਾਸਿਸਟ ਨੂੰ ਪੁੱਛੋ।',
);

/** Reply to any dose / quantity / treatment-change question. Shows printed directions only. */
export function doseRefusal(r: ScanResult): FollowUpAnswer {
  const d = r.printed.filter((p) => p.field === 'directions').map((p) => `“${p.value}”`).join(' · ');
  const printed = d
    ? tri(` The printed directions say: ${d}`, ` छपे निर्देश: ${d}`, ` ਛਪੀਆਂ ਹਿਦਾਇਤਾਂ: ${d}`)
    : tri(' No directions are printed here.', ' यहाँ कोई निर्देश छपे नहीं हैं।', ' ਇੱਥੇ ਕੋਈ ਹਿਦਾਇਤਾਂ ਛਪੀਆਂ ਨਹੀਂ ਹਨ।');
  return {
    outOfScope: true,
    confidence: 'high',
    answer: tri(
      `I can’t advise on doses or changes to treatment. Please ask your doctor or pharmacist.${printed.en}`,
      `मैं खुराक या इलाज में बदलाव पर सलाह नहीं दे सकता। कृपया डॉक्टर या फार्मासिस्ट से पूछें।${printed.hi}`,
      `ਮੈਂ ਖੁਰਾਕ ਜਾਂ ਇਲਾਜ ਵਿੱਚ ਬਦਲਾਅ ਬਾਰੇ ਸਲਾਹ ਨਹੀਂ ਦੇ ਸਕਦਾ। ਕਿਰਪਾ ਕਰਕੇ ਡਾਕਟਰ ਜਾਂ ਫਾਰਮਾਸਿਸਟ ਨੂੰ ਪੁੱਛੋ।${printed.pa}`,
    ),
  };
}

const TOPICS: [RegExp, PrintedField[]][] = [
  [/expir|\bexp\b|use by|समाप्ति|एक्सपायरी|ਮਿਆਦ|ਐਕਸਪਾਇਰੀ/i, ['expiry']],
  [/ingredient|salt|contain|made of|घटक|साल्ट|ਤੱਤ|ਸਾਲਟ/i, ['ingredient', 'strength']],
  [/warn|caution|careful|child|चेतावनी|बच्च|ਚੇਤਾਵਨੀ|ਬੱਚ/i, ['warnings']],
  [/stor|keep|fridge|temperature|रख|ਰੱਖ/i, ['other']],
  [/direction|when|how (do i|to) take|food|निर्देश|कब|ਹਿਦਾਇਤ|ਕਦੋਂ/i, ['directions']],
  [/batch|b\.?no|बैच|ਬੈਚ/i, ['batch']],
  [/who (made|makes)|manufactur|company|निर्माता|ਨਿਰਮਾਤਾ/i, ['manufacturer']],
  [/doctor|prescriber|डॉक्टर|ਡਾਕਟਰ/i, ['prescriber']],
  [/name|what is this|which medicine|नाम|ਨਾਮ/i, ['name']],
];

/** Offline follow-up for sample results: answers only from printed fields. */
export function sampleFollowUp(r: ScanResult, q: string): FollowUpAnswer {
  const lab = r.labValues.find((v) => q.toLowerCase().includes(v.test.toLowerCase().split(' ')[0].replace(/[()]/g, '')) ||
    (/hemo|haemo|हीमो|ਹੀਮੋ/i.test(q) && /haemo|hemo/i.test(v.test)) || (/sugar|glucose|शुगर|ਸ਼ੂਗਰ/i.test(q) && /glucose/i.test(v.test)));
  if (lab) {
    const f = flagLab(lab);
    const word = { below: ['below', 'से कम', 'ਤੋਂ ਘੱਟ'], above: ['above', 'से ज़्यादा', 'ਤੋਂ ਵੱਧ'], within: ['within', 'के अंदर', 'ਦੇ ਅੰਦਰ'], no_range: ['not compared with', '— तुलना नहीं', '— ਤੁਲਨਾ ਨਹੀਂ'] }[f];
    const v = `${lab.test}: ${lab.value} ${lab.unit}`.trim();
    return {
      outOfScope: false, confidence: lab.confidence,
      answer: tri(
        `The report prints ${v}, with a printed range of ${lab.printedRange || 'none'}. That is ${word[0]} the printed range. Please discuss it with your doctor.`,
        `रिपोर्ट में ${v} छपा है, छपी सीमा ${lab.printedRange || 'नहीं'} है। यह छपी सीमा ${word[1]} है। कृपया डॉक्टर से बात करें।`,
        `ਰਿਪੋਰਟ ਵਿੱਚ ${v} ਛਪਿਆ ਹੈ, ਛਪੀ ਸੀਮਾ ${lab.printedRange || 'ਨਹੀਂ'} ਹੈ। ਇਹ ਛਪੀ ਸੀਮਾ ${word[2]} ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰੋ।`,
      ),
    };
  }
  for (const [re, fields] of TOPICS) {
    if (!re.test(q)) continue;
    const hits = r.printed.filter((p) => fields.includes(p.field));
    if (!hits.length) break;
    const quoted = hits.map((h) => `“${h.value}”`).join(' · ');
    return {
      outOfScope: false,
      confidence: hits.some((h) => h.confidence === 'low') ? 'low' : hits.some((h) => h.confidence === 'medium') ? 'medium' : 'high',
      answer: tri(`This item prints: ${quoted}`, `इस पर छपा है: ${quoted}`, `ਇਸ ਉੱਤੇ ਛਪਿਆ ਹੈ: ${quoted}`),
    };
  }
  return { outOfScope: true, confidence: 'high', answer: OUT_OF_SCOPE };
}

/** Sample-only interaction rule between the two fictional medicines. Real checks are Planned. */
export function sampleInteraction(names: string[]): Tri | null {
  const all = names.join(' ').toLowerCase();
  if (/zentro/.test(all) && /kelvo/.test(all)) {
    return tri(
      'Sample interaction warning: in this fictional demo, Zentrova 500 and Kelvora 10 are set up to interact. With real medicines, check with a pharmacist before taking two medicines together.',
      'नमूना इंटरैक्शन चेतावनी: इस काल्पनिक डेमो में ज़ेंट्रोवा 500 और केल्वोरा 10 को आपस में असर करने वाला दिखाया गया है। असली दवाओं के लिए, दो दवाएँ साथ लेने से पहले फार्मासिस्ट से पूछें।',
      'ਨਮੂਨਾ ਇੰਟਰੈਕਸ਼ਨ ਚੇਤਾਵਨੀ: ਇਸ ਕਾਲਪਨਿਕ ਡੈਮੋ ਵਿੱਚ ਜ਼ੈਂਟ੍ਰੋਵਾ 500 ਅਤੇ ਕੈਲਵੋਰਾ 10 ਨੂੰ ਆਪਸ ਵਿੱਚ ਅਸਰ ਕਰਨ ਵਾਲਾ ਦਿਖਾਇਆ ਗਿਆ ਹੈ। ਅਸਲੀ ਦਵਾਈਆਂ ਲਈ, ਦੋ ਦਵਾਈਆਂ ਇਕੱਠੀਆਂ ਲੈਣ ਤੋਂ ਪਹਿਲਾਂ ਫਾਰਮਾਸਿਸਟ ਨੂੰ ਪੁੱਛੋ।',
    );
  }
  return null;
}

export const medicineNames = (r: ScanResult) =>
  r.printed.filter((p) => p.field === 'name' || p.field === 'ingredient').map((p) => p.value);
