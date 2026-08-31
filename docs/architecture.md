# Architecture

## Goal

Start with a driver-facing web app that replaces the Google Apps Script bound to the
daily runsheet spreadsheet, and grow it into a full logistics platform (dispatch,
stock, inbound, outbound) with multiple frontends sharing one domain core.

## Shape

```
logistic-web-app/            pnpm workspace (monorepo)
├── packages/core/           @logistic/core
│   ├── .            (index) browser-safe: schemas, domain logic, sheet mappers
│   ├── ./server            Node-only: GoogleSheetsClient, RunsheetService, PIN auth
│   └── ./testing           FakeSheetsClient + runsheet grid builder
└── apps/driver-web/         Next.js App Router frontend + its API routes
```

Future: `apps/dispatcher-web`, `apps/warehouse-web`, `packages/ui`, a sync worker —
all consuming `@logistic/core`. Add Turborepo when build times justify it.

## Rules

1. **`@logistic/core` (index) never imports a framework or Node built-ins.** Schemas
   (zod), pure domain logic, and the spreadsheet column map. Safe to import from
   client components. Anything touching `googleapis` / `bcryptjs` lives in
   `@logistic/core/server`.
2. **Google credentials and the Sheets API are server-only.** They live behind
   `apps/driver-web/src/server/*` and are used exclusively from `app/api/*` route
   handlers and server components (Node runtime). The service account key is never
   sent to the browser.
3. **The browser only talks to internal `/api` routes.** `src/lib/api-client.ts` is
   the single typed fetch wrapper; feature hooks in `src/features/*` wrap it with
   TanStack Query. Components don't fetch.
4. **`components/` is presentational, `features/` is wiring.**
5. **The spreadsheet layout is a contract.** Defined once in
   `packages/core/src/sheets/ranges.ts` + `mapping.ts`, documented in
   [`sheet-schema.md`](./sheet-schema.md). Nothing else hardcodes cell addresses.

## Data model

One spreadsheet per month; inside it one tab per working day named `Ddd DD/MM`
(`Mon 17/08`). `RunsheetDirectory` lists the tabs, keeps the day-format ones, infers
the year and maps each to a date (`packages/core/src/runsheet/day-tabs.ts`).
`RUNSHEET_TAB` env, if set, overrides this with one fixed tab.

For a resolved tab, `RunsheetService` (header row 7, data from row 8):

- **reads** all rows → an ordered list of `stop` and `divider` items;
- **stamps** a `Stop ID` into column Q for any actionable row missing one (one write
  per read), then keys everything on that id — survives row inserts/sorts;
- **writes** a driver's drop / pick-up **in place** into `L:O` of the stop's row,
  merging over whatever pair isn't being changed.

API: `GET /api/days` (available day tabs), `GET /api/runsheet?date=` (defaults to
today; `404 NO_RUNSHEET` when that day has no tab), `POST /api/stops/[id]/movements?date=`.

Drivers + hashed PINs come from the **`DRIVERS_JSON`** env var, not the sheet. All PIN
logic is `@logistic/core/server` (`verifyPin`, `driversForPicker`) so swapping in
Auth.js/OAuth later touches only that module and `src/lib/session.ts`.

## Request flow

```
Browser
  └─ features/runsheet/useRunsheet()            TanStack Query
       └─ lib/api-client.ts  → GET /api/runsheet
            └─ app/api/runsheet/route.ts        reads session cookie, 401 if absent
                 └─ server/services.ts          RunsheetService + roster
                      └─ core/services/runsheet.ts
                           └─ GoogleSheetsClient → Sheets API   (or the E2E fixture)
```

Recording a movement (`POST /api/stops/[stopId]/movements`) follows the same path
through `RunsheetService.recordMovements`. The client mutation retries twice, then
shows a toast with a manual retry. No offline queue (online-only, by decision).

## Testing

- **Unit** (`packages/core`, Vitest): `RunsheetService` and the PIN helpers run
  against `FakeSheetsClient` (a range-aware in-memory sheet) with grids from
  `makeRunsheetGrid`. No network.
- **E2E** (`apps/driver-web`, Playwright): drives login → dashboard → manifest →
  stop → record a drop, against the in-memory fixture (`E2E_STUB_API=1`). No
  credentials or spreadsheet needed — see `apps/driver-web/tests/e2e/README.md`.
