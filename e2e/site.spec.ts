import { expect, test } from '@playwright/test';

test('hero shows tagline, underheading and sticky CTA', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Scan any medicine. Understand it in your language.');
  await expect(page.getByTestId('underheading')).toHaveText('Not professional medical advice.');
  await expect(page.getByTestId('sticky-try')).toBeVisible();
  await expect(page.getByTestId('hero-phone')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('sample scan shows a calm sample result with source highlight', async ({ page }) => {
  await page.goto('./');
  await page.getByTestId('sticky-try').click();
  await page.getByTestId('sample-zentrova').click();
  await expect(page.getByTestId('result-source')).toHaveText('Sample result');
  await expect(page.getByText('“ZENTROVA 500”')).toBeVisible();
  await expect(page.getByText('AI explanation. Not verified.').first()).toBeVisible();
  await page.getByTestId('detail-0').click();
  await expect(page.getByTestId('highlight')).toBeVisible();
  await page.getByTestId('ask-input').fill('When does it expire?');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(page.getByTestId('answer')).toContainText('EXP 08/2028');
});

test('blurry sample stops and asks for a rescan', async ({ page }) => {
  await page.goto('./#demo');
  await page.getByTestId('sample-blurry').click();
  await expect(page.getByTestId('not-sure')).toContainText("I'm not sure. Please rescan or ask a pharmacist.");
  await expect(page.getByText('“ZENTR?VA 5?0”')).toHaveCount(0);
});

test('language switch changes the result instantly', async ({ page }) => {
  await page.goto('./#demo');
  await page.getByTestId('sample-zentrova').click();
  await expect(page.getByTestId('result-source')).toHaveText('Sample result');
  await page.getByTestId('result').getByRole('button', { name: 'हिन्दी' }).click();
  await expect(page.getByTestId('result-source')).toHaveText('नमूना परिणाम');
  await page.getByTestId('result').getByRole('button', { name: 'ਪੰਜਾਬੀ' }).click();
  await expect(page.getByTestId('result-source')).toHaveText('ਨਮੂਨਾ ਨਤੀਜਾ');
  await expect(page.getByText('“ZENTROVA 500”')).toBeVisible();
});

test('two sample medicines show the sample interaction warning', async ({ page }) => {
  await page.goto('./#demo');
  await page.getByTestId('sample-zentrova').click();
  await page.getByTestId('scan-another').click();
  await page.getByTestId('sample-kelvora').click();
  await expect(page.getByTestId('interaction')).toContainText('Sample interaction warning');
});

test('urgent words show emergency guidance without dose info', async ({ page }) => {
  await page.goto('./#demo');
  await page.getByTestId('sample-zentrova').click();
  await page.getByTestId('ask-input').fill('my child swallowed the tablets');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(page.getByTestId('urgent-help')).toContainText('Call 112');
});

test('live scan without a key falls back to samples', async ({ page }) => {
  await page.goto('./#demo');
  await page.getByRole('tab', { name: /Upload photo/ }).click();
  await expect(page.getByTestId('consent')).toContainText('Images are sent to Google Gemini.');
  await page.getByTestId('consent-ok').click();
  await page.getByTestId('upload-input').setInputFiles({ name: 'x.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64') });
  await expect(page.getByTestId('live-unavailable')).toHaveText('Live scan unavailable. Try a sample.');
  await page.getByTestId('sample-lab').click();
  await expect(page.getByTestId('lab')).toContainText('Below printed range');
});

test('report a wrong result saves a note on the device', async ({ page }) => {
  await page.goto('./#demo');
  await page.getByTestId('sample-zentrova').click();
  await page.getByTestId('report-open').click();
  await page.locator('#report-note').fill('Expiry looked different');
  await page.getByRole('button', { name: 'Save note' }).click();
  await expect(page.getByTestId('report-saved')).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('remed.reports') || '[]'));
  expect(saved[0].note).toBe('Expiry looked different');
  expect(JSON.stringify(saved)).not.toContain('data:image');
});
