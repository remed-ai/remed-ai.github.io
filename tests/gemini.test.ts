import { describe, expect, it, vi } from 'vitest';
import { extractJson, GeminiClient, pickVisionModel } from '../src/scan/gemini';
import { LiveUnavailableError } from '../src/scan/provider';
import { cooldownLeft } from '../src/scan/rateLimit';

const ok = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const reply = (text: string) => ok({ candidates: [{ content: { parts: [{ text }] } }] });
const valid = JSON.stringify({ kind: 'medicine', overallConfidence: 'high', printed: [{ field: 'name', value: 'ZENTROVA 500', confidence: 'high', box: [0.1, 0.2] }] });

describe('model choice', () => {
  it('prefers the newest plain flash model', () => {
    expect(pickVisionModel(['models/gemini-2.0-flash', 'models/gemini-2.5-flash', 'models/gemini-2.5-flash-preview-tts', 'models/gemini-2.5-pro', 'models/text-embedding-004'])).toBe('gemini-2.5-flash');
  });
  it('falls back to any gemini model', () => expect(pickVisionModel(['models/gemini-1.5-pro'])).toBe('gemini-1.5-pro'));
  it('returns null when nothing fits', () => expect(pickVisionModel(['models/embedding-001'])).toBeNull());
});

describe('client', () => {
  it('extracts fenced json', () => expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 }));

  it('validates and drops malformed boxes', async () => {
    const f = vi.fn().mockResolvedValue(reply(valid));
    const r = await new GeminiClient({ key: 'k', model: 'm', fetchImpl: f }).scan({ base64: 'AA', mime: 'image/jpeg' });
    expect(r.printed[0].value).toBe('ZENTROVA 500');
    expect(r.printed[0].box).toBeNull();
    const [, init] = f.mock.calls[0];
    expect(init.headers['x-goog-api-key']).toBe('k');
    expect(String(f.mock.calls[0][0])).not.toContain('key=');
  });

  it('picks another model when the configured one is missing', async () => {
    const f = vi.fn()
      .mockResolvedValueOnce(ok({}, 404))
      .mockResolvedValueOnce(ok({ models: [{ name: 'models/gemini-9.9-flash', supportedGenerationMethods: ['generateContent'] }] }))
      .mockResolvedValueOnce(reply(valid));
    const c = new GeminiClient({ key: 'k', model: 'old', fetchImpl: f });
    await c.scan({ base64: 'AA', mime: 'image/jpeg' });
    expect(c.modelName).toBe('gemini-9.9-flash');
    expect(String(f.mock.calls[2][0])).toContain('gemini-9.9-flash');
  });

  it('maps quota errors and bad output to LiveUnavailableError', async () => {
    const quota = new GeminiClient({ key: 'k', model: 'm', fetchImpl: vi.fn().mockResolvedValue(ok({}, 429)) });
    await expect(quota.scan({ base64: '', mime: 'image/jpeg' })).rejects.toMatchObject({ reason: 'quota' });
    const bad = new GeminiClient({ key: 'k', model: 'm', fetchImpl: vi.fn().mockResolvedValue(reply('{"kind":"nope"}')) });
    await expect(bad.scan({ base64: '', mime: 'image/jpeg' })).rejects.toBeInstanceOf(LiveUnavailableError);
  });
});

describe('rate limit', () => {
  it('allows one live call per 10 seconds', () => {
    expect(cooldownLeft(20_000, 15_000)).toBe(5_000);
    expect(cooldownLeft(30_000, 15_000)).toBe(0);
  });
});
