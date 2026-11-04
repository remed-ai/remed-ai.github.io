import type { Lang } from '../scan/schema';
import { SPEECH_LANG } from '../i18n/strings';

export function speechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function voices(): Promise<SpeechSynthesisVoice[]> {
  const v = speechSynthesis.getVoices();
  if (v.length) return Promise.resolve(v);
  return new Promise((res) => {
    const done = () => res(speechSynthesis.getVoices());
    speechSynthesis.addEventListener('voiceschanged', done, { once: true });
    setTimeout(done, 1200);
  });
}

/** Speak text; resolves false when the device has no voice for this language. */
export async function speak(text: string, lang: Lang): Promise<boolean> {
  if (!speechSupported()) return false;
  const tag = SPEECH_LANG[lang];
  const list = await voices();
  const voice = list.find((v) => v.lang.replace('_', '-') === tag) ?? list.find((v) => v.lang.toLowerCase().startsWith(lang));
  if (!voice) return false;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = 0.95;
  speechSynthesis.speak(u);
  return true;
}
export const stopSpeaking = () => speechSupported() && speechSynthesis.cancel();
