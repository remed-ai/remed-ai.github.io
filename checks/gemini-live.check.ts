// Manual live check: sends a synthetic sample image to Gemini. Never prints the key.
import { appendFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { chromium } from '@playwright/test';
import { zentrovaFront } from '../src/scan/sampleArt';
import { GeminiClient } from '../src/scan/gemini';
import { gateResult } from '../src/scan/safety';

const key = process.env.VITE_GEMINI_API_KEY?.trim() ?? '';
const model = process.env.VITE_GEMINI_MODEL?.trim() || 'gemini-flash-latest';
const summary = (line: string) => {
  console.log(line);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${line}\n`);
};

test('Gemini reads the synthetic Zentrova strip', async () => {
  if (!key) {
    summary('FAIL: VITE_GEMINI_API_KEY secret is missing or empty.');
    throw new Error('missing key');
  }
  const art = zentrovaFront();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: art.width, height: art.height } });
  await page.setContent(`<body style="margin:0">${art.svg}</body>`);
  const png = await page.screenshot({ type: 'jpeg', quality: 85 });
  await browser.close();

  const client = new GeminiClient({ key, model, timeoutMs: 60_000 });
  try {
    const r = await client.scan({ base64: png.toString('base64'), mime: 'image/jpeg' });
    const name = r.printed.find((p) => p.field === 'name')?.value ?? '';
    summary(`Model used: ${client.modelName}`);
    summary(`Kind: ${r.kind}; confidence: ${r.overallConfidence}; name read: "${name}"; gate: ${gateResult(r).stop ? 'stop' : 'show'}`);
    expect(name.toUpperCase()).toContain('ZENTROVA');
    summary('PASS: live Gemini scan works.');
  } catch (e) {
    summary(`FAIL: ${(e as Error).message.replace(key, '***')} (model tried: ${client.modelName})`);
    throw e;
  }
});
