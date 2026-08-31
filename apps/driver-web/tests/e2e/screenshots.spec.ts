import { test } from '@playwright/test';

/**
 * Not a functional test — captures the key screens for visual review against the
 * Stitch designs. Skipped unless CAPTURE_SCREENS=1:
 *
 *   CAPTURE_SCREENS=1 pnpm --filter driver-web exec playwright test screenshots
 *
 * Output: apps/driver-web/tests/e2e/__screens__/*.png (git-ignored).
 */
const DIR = 'tests/e2e/__screens__';

test.skip(!process.env.CAPTURE_SCREENS, 'set CAPTURE_SCREENS=1 to capture');

test('capture screens', async ({ page }) => {
  await page.goto('/login');
  await shoot(page, `${DIR}/1-login.png`);

  await page.getByLabel('Driver').selectOption({ label: 'Alex Rivera' });
  await page.getByLabel('PIN').fill('1234');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/route/);
  await shoot(page, `${DIR}/2-home.png`);

  await page.getByRole('link', { name: /START ROUTE/ }).click();
  await page.waitForURL(/\/manifest/);
  await shoot(page, `${DIR}/3-manifest.png`);

  await page.getByRole('link', { name: /House Business Group/ }).click();
  await page.waitForURL(/\/stops\//);
  await shoot(page, `${DIR}/4-stop-detail.png`);
});

async function shoot(page: import('@playwright/test').Page, path: string) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  await page.screenshot({ path, fullPage: true });
}
