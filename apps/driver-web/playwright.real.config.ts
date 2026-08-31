import { defineConfig, devices } from '@playwright/test';

/**
 * Screenshots against a manually-started `pnpm dev` on the REAL spreadsheet.
 *   pnpm dev            # in another terminal
 *   CAPTURE_SCREENS=1 pnpm --filter driver-web exec playwright test --config playwright.real.config.ts
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'real-screens.spec.ts',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: { baseURL: 'http://localhost:3000', trace: 'off' },
  projects: [{ name: 'mobile-chrome', use: { ...devices['Pixel 7'] } }],
});
