import { expect, test } from '@playwright/test';

test('five taps top-left enter showcase', async ({ page }) => {
  await page.goto('./');
  await page.getByTestId('entry-hotspot').waitFor({ state: 'attached' });
  // Four quick taps are not enough; the fifth within 3 s enters.
  for (let i = 0; i < 4; i++) await page.mouse.click(12, 12);
  await expect(page.getByTestId('showcase')).toHaveCount(0);
  await page.mouse.click(12, 12);
  await expect(page.getByTestId('try-scan')).toBeVisible();
  expect(page.url()).toContain('showcase=1');
});

test('TRY SCAN fills about a third of the screen and opens the camera', async ({ page }) => {
  await page.goto('./?showcase=1');
  const btn = page.getByTestId('try-scan');
  await expect(btn).toBeVisible();
  const box = (await btn.boundingBox())!;
  const vp = page.viewportSize()!;
  const share = (box.width * box.height) / (vp.width * vp.height);
  expect(share).toBeGreaterThan(0.22);
  expect(share).toBeLessThan(0.45);
  await btn.click();
  await expect(page.getByTestId('point-me')).toHaveText('Point me at anything on the table.', { timeout: 1000 });
  await expect(page.getByTestId('consent')).toBeVisible();
  await page.getByTestId('sc-sample-zentrova').click();
  await expect(page.getByTestId('scan-another')).toHaveText('SCAN ANOTHER!');
});

test('auto-reset after idle clears everything', async ({ page }) => {
  await page.clock.install();
  await page.goto('./?showcase=1');
  await page.getByTestId('try-scan').click();
  await page.clock.runFor(1000);
  await page.getByTestId('sc-sample-zentrova').click();
  await page.clock.runFor(1500);
  await page.getByTestId('result').getByRole('button', { name: 'हिन्दी' }).click();
  await expect(page.getByTestId('result-source')).toHaveText('नमूना परिणाम');
  await page.clock.runFor(30_500);
  await expect(page.getByTestId('still-there')).toBeVisible();
  await page.clock.runFor(5_500);
  await expect(page.getByTestId('try-scan')).toBeVisible();
  await expect(page.getByTestId('result')).toHaveCount(0);
  await page.getByTestId('try-scan').click();
  await page.clock.runFor(1000);
  await expect(page.getByTestId('point-me')).toHaveText('Point me at anything on the table.');
});

test('staff exit needs a 5 s hold and PIN 2580', async ({ page }) => {
  await page.clock.install();
  await page.goto('./?showcase=1');
  const spot = page.getByTestId('exit-hotspot');
  const b = (await spot.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.clock.runFor(2000);
  await page.mouse.up();
  await expect(page.getByTestId('pin-pad')).toHaveCount(0);
  await page.mouse.down();
  await page.clock.runFor(5200);
  await page.mouse.up();
  await expect(page.getByTestId('pin-pad')).toBeVisible();
  for (const d of '1111') await page.getByRole('button', { name: d, exact: true }).click();
  await expect(page.getByText('Wrong PIN')).toBeVisible();
  for (const d of '2580') await page.getByRole('button', { name: d, exact: true }).click();
  await expect(page.getByTestId('showcase')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
