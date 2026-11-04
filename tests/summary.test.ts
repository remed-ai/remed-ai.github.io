import { beforeEach, describe, expect, it } from 'vitest';
import { SAMPLES } from '../src/scan/samples';
import { summarize } from '../src/scan/summary';
import { clearHistory, listHistory, saveHistory } from '../src/scan/history';

describe('summary', () => {
  const [zen, , rx, lab, blur] = SAMPLES();
  it('medicine summary uses printed text only', () => {
    const s = summarize(zen.result, 'en');
    expect(s.title).toBe('ZENTROVA 500');
    expect(s.lines.join(' ')).toContain('EXP 08/2028');
    expect(s.lines.join(' ')).toContain('As directed by the physician');
  });
  it('lab summary lists values outside the printed range', () => {
    expect(summarize(lab.result, 'en').lines[1]).toBe('Outside the printed range: Haemoglobin, Vitamin D (25-OH), Total cholesterol');
  });
  it('prescription summary lists medicines', () => expect(summarize(rx.result, 'hi').lines[0]).toContain('Tab. Zentrova 500'));
  it('unsure results say so', () => expect(summarize(blur.result, 'en').title).toBe('Could not read this clearly'));
});

describe('history', () => {
  beforeEach(() => clearHistory());
  it('saves newest first and keeps at most 30', () => {
    for (let i = 0; i < 32; i++) saveHistory({ source: 'sample', sampleId: 'zentrova', aspect: 1, result: SAMPLES()[0].result });
    expect(listHistory()).toHaveLength(30);
  });
});
