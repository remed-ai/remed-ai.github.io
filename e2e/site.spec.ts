import { expect, test } from '@playwright/test';

test('welcome page has a big Scan now button that opens /scan', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Remed-AI');
  await expect(page.getByTestId('underheading')).toHaveText('Not professional medical advice.');
  await expect(page.getByText(/demo/i)).toHaveCount(0);
  await page.getByTestId('scan-now').click();
  await expect(page).toHaveURL(/\/scan$/);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('sample scan shows summary, details and source highlight', async ({ page }) => {
  await page.goto('./scan');
  await page.getByTestId('sample-zentrova').click();
  await expect(page.getByTestId('result-source')).toHaveText('Sample result');
  await expect(page.getByTestId('summary')).toContainText('ZENTROVA 500');
  await expect(page.getByTestId('summary')).toContainText('EXP 08/2028');
  await expect(page.getByText('AI explanation. Not verified.').first()).toBeVisible();
  await page.getByTestId('detail-0').click();
  await expect(page.getByTestId('highlight')).toBeVisible();
  await page.getByTestId('ask-input').fill('When does it expire?');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(page.getByTestId('answer')).toContainText('EXP 08/2028');
});

test('blurry sample stops and asks for a rescan', async ({ page }) => {
  await page.goto('./scan');
  await page.getByTestId('sample-blurry').click();
  await expect(page.getByTestId('not-sure')).toContainText("I'm not sure. Please rescan or ask a pharmacist.");
});

test('language switch changes the result instantly', async ({ page }) => {
  await page.goto('./scan');
  await page.getByTestId('sample-zentrova').click();
  await expect(page.getByTestId('result-source')).toHaveText('Sample result');
  await page.getByRole('button', { name: 'हिन्दी' }).click();
  await expect(page.getByTestId('result-source')).toHaveText('नमूना परिणाम');
  await page.getByRole('button', { name: 'ਪੰਜਾਬੀ' }).click();
  await expect(page.getByTestId('result-source')).toHaveText('ਨਮੂਨਾ ਨਤੀਜਾ');
  await expect(page.getByText('“ZENTROVA 500”')).toBeVisible();
});

test('two sample medicines show the sample interaction warning', async ({ page }) => {
  await page.goto('./scan');
  await page.getByTestId('sample-zentrova').click();
  await page.getByTestId('scan-another').click();
  await page.getByTestId('sample-kelvora').click();
  await expect(page.getByTestId('interaction')).toContainText('Sample interaction warning');
});

test('urgent words show emergency guidance', async ({ page }) => {
  await page.goto('./scan');
  await page.getByTestId('sample-zentrova').click();
  await page.getByTestId('ask-input').fill('my child swallowed the tablets');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(page.getByTestId('urgent-help')).toContainText('Call 112');
});

test('upload without a key falls back to samples', async ({ page }) => {
  await page.goto('./scan');
  await expect(page.getByTestId('consent')).toContainText('Google Gemini');
  await page.getByTestId('consent-ok').click();
  await page.getByTestId('upload-input').setInputFiles({ name: 'x.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64') });
  await expect(page.getByTestId('live-unavailable')).toHaveText('Live scan unavailable. Try a sample.');
  await page.getByTestId('sample-lab').click();
  await expect(page.getByTestId('lab')).toContainText('Below printed range');
});

test('scans are saved to history and can be reopened', async ({ page }) => {
  await page.goto('./scan');
  await page.getByTestId('sample-lab').click();
  await expect(page.getByTestId('summary')).toContainText('Outside the printed range');
  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByTestId('history-list')).toContainText('Lab report');
  await page.getByTestId('history-list').getByRole('link').first().click();
  await expect(page.getByTestId('lab')).toContainText('Below printed range');
  await page.goto('./history');
  await page.getByRole('button', { name: 'Clear history' }).click();
  await expect(page.getByTestId('history-empty')).toBeVisible();
});

test('report a wrong result saves a note without an image', async ({ page }) => {
  await page.goto('./scan');
  await page.getByTestId('sample-zentrova').click();
  await page.getByTestId('report-open').click();
  await page.locator('#report-note').fill('Expiry looked different');
  await page.getByRole('button', { name: 'Save note' }).click();
  await expect(page.getByTestId('report-saved')).toBeVisible();
  const saved = await page.evaluate(() => localStorage.getItem('remed.reports') || '');
  expect(saved).toContain('Expiry looked different');
  expect(saved).not.toContain('data:image');
});

test('judge tour lives at /judge', async ({ page }) => {
  await page.goto('./judge');
  await page.getByTestId('judge-start').click();
  await expect(page.getByTestId('judge-panel')).toContainText('Step 1 of 8');
});
