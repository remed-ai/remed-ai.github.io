import { describe, expect, it } from 'vitest';
import { asksForDose, flagLab, gateResult, isUrgent } from '../src/scan/safety';
import { ScanResult } from '../src/scan/schema';

const base = ScanResult.parse({ kind: 'medicine', overallConfidence: 'high', printed: [{ field: 'name', value: 'X', confidence: 'high' }] });

describe('urgent text', () => {
  it.each([
    'I think I took an overdose', 'my child swallowed 5 tablets', 'my son ate the pills', 'is this poison?', 'her lips are swelling',
    'I want to kill myself', 'thinking about self-harm', 'बच्चे ने दवा खा ली', 'ज़हर', 'ਬੱਚੇ ਨੇ ਗੋਲੀਆਂ ਖਾ ਲਈਆਂ', 'ਖੁਦਕੁਸ਼ੀ', "I can't breathe",
  ])('flags %s', (t) => expect(isUrgent(t)).toBe(true));
  it.each(['When does it expire?', 'What is the ingredient?', 'इसकी समाप्ति तिथि क्या है', ''])('does not flag %s', (t) => expect(isUrgent(t)).toBe(false));
});

describe('dose questions', () => {
  it.each(['How many tablets should I take?', 'Can I take two?', 'Should I stop taking it?', 'what dose', 'कितनी गोली लूँ', 'ਕਿੰਨੀਆਂ ਗੋਲੀਆਂ'])('blocks %s', (q) =>
    expect(asksForDose(q)).toBe(true));
  it('allows expiry questions', () => expect(asksForDose('When does it expire?')).toBe(false));
});

describe('gate', () => {
  it('passes a clear result', () => expect(gateResult(base).stop).toBe(false));
  it('stops on low confidence', () => expect(gateResult({ ...base, overallConfidence: 'low' })).toEqual({ stop: true, reason: 'low_confidence' }));
  it('stops on similar names', () => expect(gateResult({ ...base, similarNameConflict: true })).toEqual({ stop: true, reason: 'similar_name' }));
  it('stops on loose tablets', () => expect(gateResult({ ...base, looseTablet: true })).toEqual({ stop: true, reason: 'loose_tablet' }));
  it('stops on blur', () => expect(gateResult({ ...base, imageQuality: 'blurry' }).stop).toBe(true));
  it('stops when the medicine name is low confidence', () =>
    expect(gateResult({ ...base, printed: [{ field: 'name', value: 'X?', confidence: 'low' }] }).stop).toBe(true));
  it('stops when nothing was read', () => expect(gateResult({ ...base, kind: 'other', printed: [] }).stop).toBe(true));
});

describe('lab flags use only the printed range', () => {
  it.each([
    ['11.2', '12.0 - 15.5', 'below'], ['98', '70 - 100', 'within'], ['212', '< 200', 'above'], ['150', '< 200', 'within'],
    ['40', '> 35', 'within'], ['30', '> 35', 'below'], ['5', '', 'no_range'], ['n/a', '1-2', 'no_range'], ['1,250', '1000 to 1200', 'above'],
  ])('%s vs %s → %s', (value, printedRange, f) => expect(flagLab({ value, printedRange })).toBe(f));
});
