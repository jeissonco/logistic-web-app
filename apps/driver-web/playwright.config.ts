import { defineConfig, devices } from '@playwright/test';

/**
 * E2E for the vertical slice. By default it stubs `/api` (see tests/e2e/README.md),
 * so no spreadsheet or credentials are needed to run it.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: 'real-screens.spec.ts', // run via playwright.real.config.ts only
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? 'github' : 'list',
  // Next dev compiles routes on first hit — be generous.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'mobile-chrome', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: 'E2E_STUB_API=1 next dev --port 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      E2E_STUB_API: '1',
      GOOGLE_SERVICE_ACCOUNT_EMAIL: 'e2e@example.iam.gserviceaccount.com',
      GOOGLE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nE2E\\n-----END PRIVATE KEY-----\\n',
      SHEET_ID: 'e2e-sheet',
      RUNSHEET_TAB: 'Runsheet',
      SESSION_SECRET: 'e2e-session-secret-e2e-session-secret-00',
      DRIVERS_JSON: '[]',
    },
  },
});
