import type { Lang } from '../scan/schema';

/** Home-screen lines, by time of day. Hindi and Punjabi need human review. */
const Q: Record<Lang, Record<'anytime' | 'morning' | 'afternoon' | 'evening' | 'night', string[]>> = {
  en: {
    anytime: ['Understanding is a right, not a reward.', 'No one should feel small in front of a sentence.', 'Confusion is not a lack of intelligence — it’s a lack of translation.', 'Clarity is a form of kindness.', 'Every label has an answer. You just haven’t heard it yet.'],
    morning: ['Good morning. Let’s make sense of today.', 'Start the day understanding, not guessing.'],
    afternoon: ['Whatever’s confusing you right now — let’s look at it together.'],
    evening: ['The day’s paperwork doesn’t have to follow you home.'],
    night: ['Even at this hour, nothing here is too confusing.', 'Rest easy — we’ll read it together, whenever you’re ready.'],
  },
  hi: {
    anytime: ['समझना एक अधिकार है, इनाम नहीं।', 'किसी को भी एक वाक्य के सामने छोटा महसूस नहीं करना चाहिए।', 'उलझन बुद्धि की कमी नहीं है — यह अनुवाद की कमी है।', 'स्पष्टता भी एक तरह की दयालुता है।', 'हर लेबल का एक जवाब होता है। आपने अभी उसे सुना नहीं है।'],
    morning: ['सुप्रभात। आइए आज को समझने से शुरू करें।', 'दिन की शुरुआत समझ के साथ करें, अंदाज़े से नहीं।'],
    afternoon: ['जो भी आपको उलझन में डाल रहा है — आइए उसे साथ मिलकर देखें।'],
    evening: ['दिन भर के काग़ज़ात को घर तक साथ लाने की ज़रूरत नहीं।'],
    night: ['इस समय भी, यहाँ कुछ भी समझने में मुश्किल नहीं है।', 'आराम करें — जब आप तैयार हों, हम इसे साथ मिलकर पढ़ेंगे।'],
  },
  pa: {
    anytime: ['ਸਮਝਣਾ ਇੱਕ ਹੱਕ ਹੈ, ਇਨਾਮ ਨਹੀਂ।', 'ਕਿਸੇ ਨੂੰ ਵੀ ਇੱਕ ਵਾਕ ਸਾਹਮਣੇ ਛੋਟਾ ਮਹਿਸੂਸ ਨਹੀਂ ਕਰਨਾ ਚਾਹੀਦਾ।', 'ਉਲਝਣ ਸਮਝ ਦੀ ਘਾਟ ਨਹੀਂ — ਇਹ ਅਨੁਵਾਦ ਦੀ ਘਾਟ ਹੈ।', 'ਸਪੱਸ਼ਟਤਾ ਵੀ ਇੱਕ ਤਰ੍ਹਾਂ ਦੀ ਦਿਆਲਤਾ ਹੈ।', 'ਹਰ ਲੇਬਲ ਦਾ ਇੱਕ ਜਵਾਬ ਹੁੰਦਾ ਹੈ। ਤੁਸੀਂ ਹਾਲੇ ਉਹ ਸੁਣਿਆ ਨਹੀਂ।'],
    morning: ['ਸ਼ੁਭ ਸਵੇਰ। ਆਓ ਅੱਜ ਨੂੰ ਸਮਝਣ ਨਾਲ ਸ਼ੁਰੂ ਕਰੀਏ।', 'ਦਿਨ ਦੀ ਸ਼ੁਰੂਆਤ ਸਮਝ ਨਾਲ ਕਰੋ, ਅੰਦਾਜ਼ੇ ਨਾਲ ਨਹੀਂ।'],
    afternoon: ['ਜੋ ਵੀ ਤੁਹਾਨੂੰ ਹੁਣੇ ਉਲਝਣ ਵਿੱਚ ਪਾ ਰਿਹਾ ਹੈ — ਆਓ ਉਸਨੂੰ ਇਕੱਠੇ ਦੇਖੀਏ।'],
    evening: ['ਦਿਨ ਭਰ ਦੇ ਕਾਗ਼ਜ਼ਾਂ ਨੂੰ ਘਰ ਤੱਕ ਨਾਲ ਲਿਆਉਣ ਦੀ ਲੋੜ ਨਹੀਂ।'],
    night: ['ਇਸ ਵੇਲੇ ਵੀ, ਇੱਥੇ ਕੁਝ ਵੀ ਸਮਝਣਾ ਔਖਾ ਨਹੀਂ।', 'ਆਰਾਮ ਕਰੋ — ਜਦੋਂ ਤੁਸੀਂ ਤਿਆਰ ਹੋਵੋ, ਅਸੀਂ ਇਸਨੂੰ ਇਕੱਠੇ ਪੜ੍ਹਾਂਗੇ।'],
  },
};

export function quoteFor(lang: Lang, now = new Date(), rnd = Math.random()): string {
  const h = now.getHours();
  const bucket = h < 5 ? 'night' : h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 22 ? 'evening' : 'night';
  const pool = rnd < 0.5 ? Q[lang][bucket] : Q[lang].anytime;
  return pool[Math.floor(rnd * 1000) % pool.length];
}
