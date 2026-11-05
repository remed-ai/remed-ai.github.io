import { expect, test } from '@playwright/test';

test('first visit shows the welcome screen, then opens the app', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByTestId('welcome')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Understand your medicines.');
  await expect(page.getByTestId('underheading')).toHaveText('Not professional medical advice.');
  await expect(page.getByText(/demo|competition|judge|booth/i)).toHaveCount(0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.getByTestId('get-started').click();
  await expect(page.getByTestId('scan-now')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('scan-now')).toBeVisible();
});

test('welcome screen follows the chosen language and can be reopened from Settings', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'हिन्दी' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('अपनी दवाइयों को समझें।');
  await page.getByTestId('get-started').click();
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link').last().click();
  await page.getByRole('link', { name: 'स्वागत स्क्रीन दिखाएँ' }).click();
  await expect(page).toHaveURL(/\/welcome$/);
  await expect(page.getByTestId('welcome')).toBeVisible();
});
