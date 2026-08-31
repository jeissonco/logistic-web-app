# Deploying to Vercel

The repo is a pnpm monorepo; the deployable app is **`apps/driver-web`**.

## 1. Push to GitHub

```bash
git add -A
git commit -m "Driver web app: scaffold + vertical slice"
git push origin main
```

`.env.local` is git-ignored, so no secrets are pushed.

## 2. Import the project

1. [vercel.com/new](https://vercel.com/new) → import `jeissonco/logistic-web-app`.
2. **Root Directory** → set to `apps/driver-web` (click *Edit* next to it).
3. Framework preset auto-detects **Next.js**. Leave Build/Install commands on default —
   Vercel installs the whole pnpm workspace and `transpilePackages: ['@logistic/core']`
   handles the local package.
4. Node.js version: `apps/driver-web/.node-version` pins 22. (Or Settings → General →
   Node.js Version → 22.x.)
5. Region is pinned to **Sydney (`syd1`)** via `apps/driver-web/vercel.json` — closest
   to the drivers and to Google's AU endpoints.

## 3. Environment variables

Project → Settings → Environment Variables. Add these for **Production** (and Preview
if you want preview deploys to work). Values are literal — **no `\$` escaping** here
(that's only for local `.env` files).

| Name | Value |
| --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | the `client_email` from the service-account JSON |
| `GOOGLE_PRIVATE_KEY` | the `private_key` from the JSON — paste it with the literal `\n` sequences on **one line**; `env.ts` converts them to real newlines |
| `SHEET_ID` | this month's spreadsheet id |
| `SESSION_SECRET` | a **fresh** 32-byte random string (don't reuse local): `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
| `DRIVERS_JSON` | run `pnpm drivers export --raw` and paste that JSON |

`RUNSHEET_TAB` is optional (only for single-tab mode) and `SESSION_TTL_HOURS` defaults
to 12.

## 4. Deploy

Click **Deploy**. Every push to `main` redeploys.

## 5. After it's live

- Open the URL, sign in with a driver from `DRIVERS_JSON`.
- Today has no tab on weekends → dashboard shows "no runsheet"; use **View by Days**.
- The app writes Stop IDs into column Q and drops/pick-ups into L:O of the live sheet.

## Monthly

Point `SHEET_ID` at the new month's spreadsheet (Settings → Environment Variables →
edit → redeploy). Everything else stays.

## Changing drivers in production

```bash
pnpm drivers add drv_x "Name" 1234   # updates local .env.local
pnpm drivers export --raw            # copy the JSON
```

Paste into the Vercel `DRIVERS_JSON` env var → redeploy (Deployments → ⋯ → Redeploy).
