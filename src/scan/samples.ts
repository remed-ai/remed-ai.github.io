import type { ScanResult, Tri } from './schema';
import { type Art, ALL_ART, LAB_ROWS } from './sampleArt';

/** Prepared results for the fictional sample items. Shown with the label "Sample result". */
export interface Sample {
  id: 'zentrova' | 'kelvora' | 'prescription' | 'lab' | 'blurry';
  label: Tri;
  hint: Tri;
  art: Art;
  result: ScanResult;
}

const t = (en: string, hi: string, pa: string): Tri => ({ en, hi, pa });
type B = [number, number, number, number];
const box = (a: Art, id: string): B | null => (a.boxes[id] as B | undefined) ?? null;
const mergeBox = (a: Art, x: string, y: string): B | null => {
  const p = a.boxes[x], q = a.boxes[y];
  if (!p || !q) return null;
  const left = Math.min(p[0], q[0]), top = Math.min(p[1], q[1]);
  return [left, top, Math.max(p[0] + p[2], q[0] + q[2]) - left, Math.max(p[1] + p[3], q[1] + q[3]) - top];
};

const missDose = t(
  'What should I do if I miss a dose?',
  'अगर कोई खुराक छूट जाए तो मुझे क्या करना चाहिए?',
  'ਜੇ ਕੋਈ ਖੁਰਾਕ ਛੁੱਟ ਜਾਵੇ ਤਾਂ ਮੈਨੂੰ ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?',
);
const otherMeds = t(
  'Is this safe with the other medicines I take?',
  'क्या यह मेरी दूसरी दवाओं के साथ सुरक्षित है?',
  'ਕੀ ਇਹ ਮੇਰੀਆਂ ਹੋਰ ਦਵਾਈਆਂ ਨਾਲ ਸੁਰੱਖਿਅਤ ਹੈ?',
);
const howLong = t(
  'How long should I take this medicine?',
  'मुझे यह दवा कितने समय तक लेनी है?',
  'ਮੈਨੂੰ ਇਹ ਦਵਾਈ ਕਿੰਨੇ ਸਮੇਂ ਤੱਕ ਲੈਣੀ ਹੈ?',
);
const noDose = t(
  'The item does not print a specific dose. Follow your prescription, or ask your doctor or pharmacist.',
  'इस पर कोई तय खुराक छपी नहीं है। अपने पर्चे का पालन करें, या डॉक्टर या फार्मासिस्ट से पूछें।',
  'ਇਸ ਉੱਤੇ ਕੋਈ ਤੈਅ ਖੁਰਾਕ ਛਪੀ ਨਹੀਂ ਹੈ। ਆਪਣੀ ਪਰਚੀ ਦੀ ਪਾਲਣਾ ਕਰੋ, ਜਾਂ ਡਾਕਟਰ ਜਾਂ ਫਾਰਮਾਸਿਸਟ ਨੂੰ ਪੁੱਛੋ।',
);
const expiryRule = t(
  'Do not use any medicine after the expiry date printed on it.',
  'किसी भी दवा को उस पर छपी समाप्ति तिथि के बाद इस्तेमाल न करें।',
  'ਕਿਸੇ ਵੀ ਦਵਾਈ ਨੂੰ ਉਸ ਉੱਤੇ ਛਪੀ ਮਿਆਦ ਪੁੱਗਣ ਦੀ ਤਾਰੀਖ਼ ਤੋਂ ਬਾਅਦ ਨਾ ਵਰਤੋ।',
);

function build(): Sample[] {
  const [zen, kel, rx, lab, blur] = ALL_ART();
  return [
    {
      id: 'zentrova',
      label: t('Zentrova 500 strip', 'ज़ेंट्रोवा 500 स्ट्रिप', 'ਜ਼ੈਂਟ੍ਰੋਵਾ 500 ਸਟ੍ਰਿਪ'),
      hint: t('Front of a tablet strip', 'टैबलेट स्ट्रिप का सामने का हिस्सा', 'ਟੈਬਲੇਟ ਸਟ੍ਰਿਪ ਦਾ ਅਗਲਾ ਪਾਸਾ'),
      art: zen,
      result: {
        kind: 'medicine', overallConfidence: 'high', imageQuality: 'clear', looseTablet: false, similarNameConflict: false,
        printed: [
          { field: 'name', value: 'ZENTROVA 500', confidence: 'high', box: box(zen, 'name') },
          { field: 'ingredient', value: 'Zentrofen Tablets 500 mg', confidence: 'high', box: box(zen, 'ingredient') },
          { field: 'strength', value: 'Each tablet contains: Zentrofen 500 mg', confidence: 'high', box: box(zen, 'strength') },
          { field: 'expiry', value: 'EXP 08/2028', confidence: 'high', box: box(zen, 'expiry') },
          { field: 'directions', value: 'Dosage: As directed by the physician.', confidence: 'high', box: box(zen, 'directions') },
          { field: 'warnings', value: 'Do not exceed the stated dose. Keep out of reach of children.', confidence: 'high', box: mergeBox(zen, 'warnings', 'warnings2') },
          { field: 'batch', value: 'B.No. DM24117', confidence: 'medium', box: box(zen, 'batch') },
          { field: 'manufacturer', value: 'Mfd. by: Sample Pharma Works (fictional)', confidence: 'medium', box: box(zen, 'manufacturer') },
        ],
        labValues: [],
        explanations: [
          {
            topic: 'Zentrofen',
            text: t(
              'Zentrofen is a fictional ingredient made up for this sample. For a real medicine, this space gives a short, general description of the printed ingredient.',
              'ज़ेंट्रोफ़ेन इस नमूने के लिए बनाया गया काल्पनिक घटक है। असली दवा के लिए यहाँ छपे हुए घटक का छोटा, सामान्य विवरण दिखता है।',
              'ਜ਼ੈਂਟ੍ਰੋਫ਼ੈਨ ਇਸ ਨਮੂਨੇ ਲਈ ਬਣਾਇਆ ਕਾਲਪਨਿਕ ਤੱਤ ਹੈ। ਅਸਲੀ ਦਵਾਈ ਲਈ ਇੱਥੇ ਛਪੇ ਤੱਤ ਦਾ ਛੋਟਾ, ਆਮ ਵੇਰਵਾ ਦਿਖਦਾ ਹੈ।',
            ),
          },
          { topic: 'Directions', text: noDose },
          { topic: 'Expiry', text: expiryRule },
        ],
        unclear: [],
        doctorQuestions: [howLong, otherMeds, missDose],
      },
    },
    {
      id: 'kelvora',
      label: t('Kelvora 10 strip', 'केल्वोरा 10 स्ट्रिप', 'ਕੈਲਵੋਰਾ 10 ਸਟ੍ਰਿਪ'),
      hint: t('Back of a tablet strip', 'टैबलेट स्ट्रिप का पिछला हिस्सा', 'ਟੈਬਲੇਟ ਸਟ੍ਰਿਪ ਦਾ ਪਿਛਲਾ ਪਾਸਾ'),
      art: kel,
      result: {
        kind: 'medicine', overallConfidence: 'high', imageQuality: 'clear', looseTablet: false, similarNameConflict: false,
        printed: [
          { field: 'name', value: 'KELVORA 10', confidence: 'high', box: box(kel, 'name') },
          { field: 'ingredient', value: 'Kelvoxin Tablets 10 mg', confidence: 'high', box: box(kel, 'ingredient') },
          { field: 'strength', value: 'Each film-coated tablet contains Kelvoxin 10 mg', confidence: 'high', box: box(kel, 'strength') },
          { field: 'expiry', value: 'EXP 10/2027', confidence: 'high', box: box(kel, 'expiry') },
          { field: 'directions', value: 'Dosage: As directed by the physician.', confidence: 'high', box: box(kel, 'directions') },
          { field: 'warnings', value: 'WARNING: To be sold on prescription only.', confidence: 'high', box: box(kel, 'warnings') },
          { field: 'other', value: 'Store below 25°C. Protect from light and moisture.', confidence: 'high', box: box(kel, 'storage') },
          { field: 'batch', value: 'B.No. KV0932', confidence: 'medium', box: box(kel, 'batch') },
        ],
        labValues: [],
        explanations: [
          {
            topic: 'Kelvoxin',
            text: t(
              'Kelvoxin is a fictional ingredient made up for this sample. For a real medicine, this space gives a short, general description of the printed ingredient.',
              'केल्वॉक्सिन इस नमूने के लिए बनाया गया काल्पनिक घटक है। असली दवा के लिए यहाँ छपे हुए घटक का छोटा, सामान्य विवरण दिखता है।',
              'ਕੈਲਵੌਕਸਿਨ ਇਸ ਨਮੂਨੇ ਲਈ ਬਣਾਇਆ ਕਾਲਪਨਿਕ ਤੱਤ ਹੈ। ਅਸਲੀ ਦਵਾਈ ਲਈ ਇੱਥੇ ਛਪੇ ਤੱਤ ਦਾ ਛੋਟਾ, ਆਮ ਵੇਰਵਾ ਦਿਖਦਾ ਹੈ।',
            ),
          },
          {
            topic: 'Prescription only',
            text: t(
              'The label says this medicine should only be sold with a prescription.',
              'लेबल के अनुसार यह दवा केवल डॉक्टर के पर्चे पर ही बेची जानी चाहिए।',
              'ਲੇਬਲ ਅਨੁਸਾਰ ਇਹ ਦਵਾਈ ਸਿਰਫ਼ ਡਾਕਟਰ ਦੀ ਪਰਚੀ ਉੱਤੇ ਹੀ ਵੇਚੀ ਜਾਣੀ ਚਾਹੀਦੀ ਹੈ।',
            ),
          },
          { topic: 'Directions', text: noDose },
        ],
        unclear: [],
        doctorQuestions: [howLong, otherMeds, missDose],
      },
    },
    {
      id: 'prescription',
      label: t('Prescription', 'पर्चा', 'ਪਰਚੀ'),
      hint: t('Synthetic, handwritten style', 'काल्पनिक, हाथ से लिखा जैसा', 'ਕਾਲਪਨਿਕ, ਹੱਥ ਨਾਲ ਲਿਖੀ ਵਰਗੀ'),
      art: rx,
      result: {
        kind: 'prescription', overallConfidence: 'medium', imageQuality: 'clear', looseTablet: false, similarNameConflict: false,
        printed: [
          { field: 'name', value: 'Tab. Zentrova 500', confidence: 'medium', box: box(rx, 'med1') },
          { field: 'directions', value: '1 – 0 – 1 after food × 5 days', confidence: 'medium', box: box(rx, 'dir1') },
          { field: 'name', value: 'Tab. Kelvora 10', confidence: 'medium', box: box(rx, 'med2') },
          { field: 'directions', value: '0 – 0 – 1 at night × 10 days', confidence: 'medium', box: box(rx, 'dir2') },
          { field: 'other', value: 'Review after 1 week', confidence: 'medium', box: box(rx, 'note') },
          { field: 'prescriber', value: 'Sample Doctor (fictional)', confidence: 'high', box: box(rx, 'prescriber') },
          { field: 'patient', value: 'Sample Patient (fictional)', confidence: 'high', box: box(rx, 'patient') },
          { field: 'date', value: '01/11/2026', confidence: 'high', box: box(rx, 'date') },
        ],
        labValues: [],
        explanations: [
          {
            topic: '1 – 0 – 1',
            text: t(
              'This notation is often read as morning – afternoon – night. Handwriting can be misread, so confirm every line with your pharmacist.',
              'यह लिखावट अक्सर सुबह – दोपहर – रात के रूप में पढ़ी जाती है। हाथ की लिखावट गलत पढ़ी जा सकती है, इसलिए हर पंक्ति फार्मासिस्ट से पक्की करें।',
              'ਇਹ ਲਿਖਤ ਅਕਸਰ ਸਵੇਰ – ਦੁਪਹਿਰ – ਰਾਤ ਵਜੋਂ ਪੜ੍ਹੀ ਜਾਂਦੀ ਹੈ। ਹੱਥ ਦੀ ਲਿਖਤ ਗਲਤ ਪੜ੍ਹੀ ਜਾ ਸਕਦੀ ਹੈ, ਇਸ ਲਈ ਹਰ ਲਾਈਨ ਫਾਰਮਾਸਿਸਟ ਤੋਂ ਪੱਕੀ ਕਰੋ।',
            ),
          },
        ],
        unclear: [
          t(
            'Handwritten lines were read with medium confidence. Please confirm them with your pharmacist.',
            'हाथ से लिखी पंक्तियाँ मध्यम भरोसे के साथ पढ़ी गईं। कृपया फार्मासिस्ट से पक्का करें।',
            'ਹੱਥ ਨਾਲ ਲਿਖੀਆਂ ਲਾਈਨਾਂ ਦਰਮਿਆਨੇ ਭਰੋਸੇ ਨਾਲ ਪੜ੍ਹੀਆਂ ਗਈਆਂ। ਕਿਰਪਾ ਕਰਕੇ ਫਾਰਮਾਸਿਸਟ ਤੋਂ ਪੱਕਾ ਕਰੋ।',
          ),
        ],
        doctorQuestions: [
          t('What is each medicine on this prescription for?', 'इस पर्चे की हर दवा किस लिए है?', 'ਇਸ ਪਰਚੀ ਦੀ ਹਰ ਦਵਾਈ ਕਿਸ ਲਈ ਹੈ?'),
          t('Can these two medicines be taken together?', 'क्या ये दोनों दवाएँ साथ में ली जा सकती हैं?', 'ਕੀ ਇਹ ਦੋਵੇਂ ਦਵਾਈਆਂ ਇਕੱਠੀਆਂ ਲਈਆਂ ਜਾ ਸਕਦੀਆਂ ਹਨ?'),
          t('What should I watch for before the review visit?', 'अगली जाँच से पहले मुझे किन बातों पर ध्यान देना चाहिए?', 'ਅਗਲੀ ਜਾਂਚ ਤੋਂ ਪਹਿਲਾਂ ਮੈਨੂੰ ਕਿਹੜੀਆਂ ਗੱਲਾਂ ਦਾ ਧਿਆਨ ਰੱਖਣਾ ਚਾਹੀਦਾ ਹੈ?'),
        ],
      },
    },
    {
      id: 'lab',
      label: t('Lab report', 'लैब रिपोर्ट', 'ਲੈਬ ਰਿਪੋਰਟ'),
      hint: t('Synthetic blood test', 'काल्पनिक खून जाँच', 'ਕਾਲਪਨਿਕ ਖੂਨ ਜਾਂਚ'),
      art: lab,
      result: {
        kind: 'lab_report', overallConfidence: 'high', imageQuality: 'clear', looseTablet: false, similarNameConflict: false,
        printed: [
          { field: 'patient', value: 'Sample Patient (fictional)', confidence: 'high', box: box(lab, 'patient') },
          { field: 'date', value: 'Sample collected: 28/10/2026', confidence: 'high', box: box(lab, 'date') },
        ],
        labValues: LAB_ROWS.map((r, k) => ({
          test: r[0], value: r[1], unit: r[2], printedRange: r[3], confidence: 'high' as const,
          box: mergeBox(lab, `lab${k}`, `lab${k}r`),
        })),
        explanations: [
          {
            topic: 'Printed ranges',
            text: t(
              'Each result is compared only with the reference range printed on this report. Labs use different ranges.',
              'हर नतीजे की तुलना केवल इसी रिपोर्ट पर छपी संदर्भ सीमा से की गई है। अलग-अलग लैब की सीमाएँ अलग होती हैं।',
              'ਹਰ ਨਤੀਜੇ ਦੀ ਤੁਲਨਾ ਸਿਰਫ਼ ਇਸੇ ਰਿਪੋਰਟ ਉੱਤੇ ਛਪੀ ਹਵਾਲਾ ਸੀਮਾ ਨਾਲ ਕੀਤੀ ਗਈ ਹੈ। ਵੱਖ-ਵੱਖ ਲੈਬਾਂ ਦੀਆਂ ਸੀਮਾਵਾਂ ਵੱਖ ਹੁੰਦੀਆਂ ਹਨ।',
            ),
          },
          {
            topic: 'Haemoglobin',
            text: t(
              'Haemoglobin is the protein in red blood cells that carries oxygen.',
              'हीमोग्लोबिन लाल रक्त कोशिकाओं में मौजूद प्रोटीन है जो ऑक्सीजन ले जाता है।',
              'ਹੀਮੋਗਲੋਬਿਨ ਲਾਲ ਖੂਨ ਸੈੱਲਾਂ ਵਿੱਚ ਮੌਜੂਦ ਪ੍ਰੋਟੀਨ ਹੈ ਜੋ ਆਕਸੀਜਨ ਲੈ ਕੇ ਜਾਂਦਾ ਹੈ।',
            ),
          },
          {
            topic: 'Vitamin D',
            text: t(
              'Vitamin D helps the body use calcium for bones.',
              'विटामिन डी शरीर को हड्डियों के लिए कैल्शियम इस्तेमाल करने में मदद करता है।',
              'ਵਿਟਾਮਿਨ ਡੀ ਸਰੀਰ ਨੂੰ ਹੱਡੀਆਂ ਲਈ ਕੈਲਸ਼ੀਅਮ ਵਰਤਣ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।',
            ),
          },
        ],
        unclear: [],
        doctorQuestions: [
          t('My haemoglobin is below the printed range. What could explain this?', 'मेरा हीमोग्लोबिन छपी सीमा से कम है। इसका क्या कारण हो सकता है?', 'ਮੇਰਾ ਹੀਮੋਗਲੋਬਿਨ ਛਪੀ ਸੀਮਾ ਤੋਂ ਘੱਟ ਹੈ। ਇਸ ਦਾ ਕੀ ਕਾਰਨ ਹੋ ਸਕਦਾ ਹੈ?'),
          t('My vitamin D is below the printed range. Do we need to discuss it?', 'मेरा विटामिन डी छपी सीमा से कम है। क्या हमें इस पर बात करनी चाहिए?', 'ਮੇਰਾ ਵਿਟਾਮਿਨ ਡੀ ਛਪੀ ਸੀਮਾ ਤੋਂ ਘੱਟ ਹੈ। ਕੀ ਸਾਨੂੰ ਇਸ ਬਾਰੇ ਗੱਲ ਕਰਨੀ ਚਾਹੀਦੀ ਹੈ?'),
          t('My total cholesterol is above the printed range. What should we check next?', 'मेरा कुल कोलेस्ट्रॉल छपी सीमा से ज़्यादा है। आगे क्या जाँचना चाहिए?', 'ਮੇਰਾ ਕੁੱਲ ਕੋਲੈਸਟ੍ਰੋਲ ਛਪੀ ਸੀਮਾ ਤੋਂ ਵੱਧ ਹੈ। ਅੱਗੇ ਕੀ ਜਾਂਚਣਾ ਚਾਹੀਦਾ ਹੈ?'),
        ],
      },
    },
    {
      id: 'blurry',
      label: t('Blurry photo', 'धुंधली फ़ोटो', 'ਧੁੰਦਲੀ ਫ਼ੋਟੋ'),
      hint: t('Shows what happens when unsure', 'अनिश्चित होने पर क्या होता है', 'ਪੱਕਾ ਨਾ ਹੋਣ ਤੇ ਕੀ ਹੁੰਦਾ ਹੈ'),
      art: blur,
      result: {
        kind: 'unclear', overallConfidence: 'low', imageQuality: 'blurry', looseTablet: false, similarNameConflict: false,
        printed: [{ field: 'name', value: 'ZENTR?VA 5?0', confidence: 'low', box: box(blur, 'name') }],
        labValues: [], explanations: [], doctorQuestions: [],
        unclear: [t('The text is too blurry to read safely.', 'लिखावट इतनी धुंधली है कि सुरक्षित रूप से पढ़ी नहीं जा सकती।', 'ਲਿਖਤ ਇੰਨੀ ਧੁੰਦਲੀ ਹੈ ਕਿ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਪੜ੍ਹੀ ਨਹੀਂ ਜਾ ਸਕਦੀ।')],
      },
    },
  ];
}

let cache: Sample[] | null = null;
export const SAMPLES = (): Sample[] => (cache ??= build());
export const sampleById = (id: string) => SAMPLES().find((s) => s.id === id);
