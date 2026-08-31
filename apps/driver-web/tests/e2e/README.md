# E2E tests

`pnpm --filter driver-web test:e2e`

Playwright starts `next dev` on port 3100 with **`E2E_STUB_API=1`**. In that mode
`src/server/services.ts` returns an in-memory backend (`src/server/e2e-fixture.ts`)
instead of talking to Google Sheets, so the tests need **no credentials and no
spreadsheet**.

Fixture:

- Driver **Alex Rivera**, `driver_id` `drv_alex`, PIN **`1234`**
- One fixed tab `Runsheet` (`fixedTab`, so per-day tab resolution is bypassed) with
  three stops (`stop_1` BS Fit Profits, `stop_2` CO German Translation, `stop_3` DO
  House Business Group) and a `MORNING TEA` divider before stop 3
- Stop IDs pre-stamped; the fixture singleton lives on `globalThis`

The day-tab resolver (`Mon 17/08` → date) is covered by
`packages/core/tests/day-tabs.test.ts`, not here.

First run only: `pnpm --filter driver-web exec playwright install chromium`.

Screens for visual review:
`CAPTURE_SCREENS=1 pnpm --filter driver-web exec playwright test screenshots`
→ `tests/e2e/__screens__/*.png` (git-ignored).
