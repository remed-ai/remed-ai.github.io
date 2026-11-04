import { describe, expect, it } from 'vitest';
import { SAMPLES } from '../src/scan/samples';
import { ScanResult } from '../src/scan/schema';
import { gateResult } from '../src/scan/safety';
import { doseRefusal, medicineNames, sampleFollowUp, sampleInteraction } from '../src/scan/followup';
import { STRINGS } from '../src/i18n/strings';

describe('samples', () => {
  it('every prepared result is valid structured data', () => {
    for (const s of SAMPLES()) expect(() => ScanResult.parse(s.result)).not.toThrow();
  });
  it('every sample item is marked DEMO ONLY', () => {
    for (const s of SAMPLES()) expect(s.art.svg).toContain('DEMO ONLY');
  });
  it('only the blurry sample stops', () => {
    const stops = SAMPLES().filter((s) => gateResult(s.result).stop).map((s) => s.id);
    expect(stops).toEqual(['blurry']);
  });
  it('explanations have all three languages', () => {
    for (const s of SAMPLES()) for (const e of s.result.explanations) expect(e.text.en && e.text.hi && e.text.pa).toBeTruthy();
  });
  it('printed details have source boxes inside the image', () => {
    const z = SAMPLES()[0].result;
    for (const p of z.printed) {
      expect(p.box).toBeTruthy();
      const [x, y, w, h] = p.box!;
      expect(x).toBeGreaterThanOrEqual(0); expect(y).toBeGreaterThanOrEqual(0);
      expect(x + w).toBeLessThanOrEqual(1.05); expect(y + h).toBeLessThanOrEqual(1.05);
    }
  });
});

describe('interaction and follow-up', () => {
  const [zen, kel, , lab] = SAMPLES();
  it('warns only when both fictional medicines are scanned', () => {
    expect(sampleInteraction(medicineNames(zen.result))).toBeNull();
    expect(sampleInteraction([...medicineNames(zen.result), ...medicineNames(kel.result)])?.en).toMatch(/Sample interaction warning/);
  });
  it('answers from printed text only', () => {
    expect(sampleFollowUp(zen.result, 'When does it expire?').answer.en).toContain('EXP 08/2028');
    expect(sampleFollowUp(zen.result, 'Who won the cricket match?').outOfScope).toBe(true);
    expect(sampleFollowUp(lab.result, 'what about my haemoglobin').answer.en).toMatch(/below the printed range/);
  });
  it('dose refusal quotes printed directions and gives no number', () => {
    const a = doseRefusal(zen.result).answer.en;
    expect(a).toContain('As directed by the physician');
    expect(a).not.toMatch(/\d+\s*(tablet|mg)/i);
  });
});

describe('i18n', () => {
  it('Hindi and Punjabi have every key', () => {
    const keys = Object.keys(STRINGS.en);
    for (const l of ['hi', 'pa'] as const) for (const k of keys) expect(STRINGS[l][k as keyof typeof STRINGS.en], `${l}.${k}`).toBeTruthy();
  });
});
