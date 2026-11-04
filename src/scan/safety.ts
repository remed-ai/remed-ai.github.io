import type { LabValue, ScanResult } from './schema';

/** Typed text that needs urgent help. English, Hindi, Punjabi, and common romanised forms. */
const URGENT: RegExp[] = [
  /overdos/i, /too many (pills|tablets|tabs|medicines?)/i, /took (all|a lot|many|the whole)/i, /swallow/i,
  /poison/i, /\bate\b.*(pill|tablet|medicine)/i, /(child|kid|baby|toddler|son|daughter).*(ate|swallow|took|drank)/i,
  /can'?t breathe/i, /cannot breathe/i, /trouble breathing/i, /(face|lips?|tongue|throat).*(swell)/i, /swelling/i,
  /anaphyla/i, /seizure/i, /unconscious/i, /fainted/i, /collapsed?/i, /severe (reaction|rash|allergy|pain)/i,
  /suicid/i, /kill (myself|me)/i, /self[- ]?harm/i, /hurt myself/i, /end (my|it) (life|all)/i, /want to die/i, /don'?t want to live/i,
  /zeher|zehar|jahar/i, /marna chaht/i,
  /ज़हर|जहर|ओवरडोज़|ओवरडोज|आत्महत्या|खुदकुशी|मरना चाहत|बेहोश|सांस नहीं|साँस नहीं|निगल|बच्चे ने .*खा/,
  /ਜ਼ਹਿਰ|ਜਹਿਰ|ਓਵਰਡੋਜ਼|ਖੁਦਕੁਸ਼ੀ|ਆਤਮਹੱਤਿਆ|ਮਰਨਾ ਚਾਹ|ਬੇਹੋਸ਼|ਸਾਹ ਨਹੀਂ|ਨਿਗਲ|ਬੱਚੇ ਨੇ .*ਖਾ/,
];

export function isUrgent(text: string): boolean {
  const t = text.trim();
  return t.length > 0 && URGENT.some((r) => r.test(t));
}

/** Questions asking for a dose, quantity, or treatment change. We never answer these. */
const DOSE: RegExp[] = [
  /how (many|much|often)/i, /\bdose|dosage|mg\b/i, /(double|increase|decrease|reduce|skip|stop|quit) (my |the )?(dose|medicine|tablet|pill|taking)/i,
  /can i (take|have|give) (more|another|extra|two|2)/i, /should i (take|stop|start|switch|change)/i, /instead of/i,
  /कितन|खुराक|डोज|बंद कर/, /ਕਿੰਨ|ਖੁਰਾਕ|ਡੋਜ਼|ਬੰਦ ਕਰ/,
];
export function asksForDose(text: string): boolean {
  return DOSE.some((r) => r.test(text));
}

export type Gate = { stop: false } | { stop: true; reason: 'low_confidence' | 'similar_name' | 'loose_tablet' | 'unreadable' };

/** Decide whether a result is safe to show or we must stop and ask for a rescan / pharmacist. */
export function gateResult(r: ScanResult): Gate {
  if (r.looseTablet) return { stop: true, reason: 'loose_tablet' };
  if (r.similarNameConflict) return { stop: true, reason: 'similar_name' };
  if (r.kind === 'unclear' || r.imageQuality === 'blurry') return { stop: true, reason: 'unreadable' };
  if (r.overallConfidence === 'low') return { stop: true, reason: 'low_confidence' };
  const name = r.printed.find((p) => p.field === 'name');
  if (r.kind === 'medicine' && (!name || name.confidence === 'low')) return { stop: true, reason: 'low_confidence' };
  if (r.printed.length === 0 && r.labValues.length === 0) return { stop: true, reason: 'unreadable' };
  return { stop: false };
}

export type LabFlag = 'below' | 'within' | 'above' | 'no_range';

const num = (s: string) => {
  const m = s.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : NaN;
};

/** Flag a lab value ONLY against the range printed on the report. */
export function flagLab(v: Pick<LabValue, 'value' | 'printedRange'>): LabFlag {
  const value = num(v.value);
  const range = v.printedRange.replace(/,/g, '').trim();
  if (Number.isNaN(value) || !range) return 'no_range';
  const between = range.match(/(-?\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(-?\d+(?:\.\d+)?)/i);
  if (between) {
    const lo = Number(between[1]);
    const hi = Number(between[2]);
    if (value < lo) return 'below';
    if (value > hi) return 'above';
    return 'within';
  }
  const lt = range.match(/^(?:<|≤|less than|up to|upto)\s*(-?\d+(?:\.\d+)?)/i);
  if (lt) return value > Number(lt[1]) ? 'above' : 'within';
  const gt = range.match(/^(?:>|≥|more than|greater than|at least)\s*(-?\d+(?:\.\d+)?)/i);
  if (gt) return value < Number(gt[1]) ? 'below' : 'within';
  return 'no_range';
}
