import { test } from '@playwright/test';

// Run via playwright.real.config.ts against a live `pnpm dev`. Not part of the suite.
const DIR = 'tests/e2e/__screens__';

async function shoot(page: import('@playwright/test').Page, name: string) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/${name}.png`, fullPage: true });
}

test('real screens', async ({ page }) => {
  await page.goto('/login');
  await page
    .getByLabel('Driver')
    .locator('option', { hasText: 'Jeisson' })
    .waitFor({ state: 'attached', timeout: 20_000 });
  await page.getByLabel('Driver').selectOption({ label: 'Jeisson' });
  await page.getByLabel('PIN').fill('1234');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/route/, { timeout: 30_000 });
  await shoot(page, 'r1-home');

  await page.getByRole('link', { name: /View by Days/ }).click();
  await page.waitForURL(/\/days/);
  await page.getByRole('link', { name: /Fri 28 Aug/ }).click();
  await page.waitForURL(/\/manifest/);
  await shoot(page, 'r2-manifest');

  await page.getByRole('link', { name: /All Type Engineering/ }).first().click();
  await page.waitForURL(/\/stops\//);
  await shoot(page, 'r3-stop');

  await page.goto('/directory');
  await shoot(page, 'r4-directory');

  await page.goto('/mapping');
  await shoot(page, 'r5-mapping');
});
