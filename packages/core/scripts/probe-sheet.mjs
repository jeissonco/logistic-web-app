// Dev tool: inspect the real spreadsheet the app is configured against.
//   node packages/core/scripts/probe-sheet.mjs ["Tab Name"]
// Reads apps/driver-web/.env.local for credentials.
import { readFileSync } from 'node:fs';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const env = Object.fromEntries(
  readFileSync(new URL('../../../apps/driver-web/.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      let v = l.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1);
      return [l.slice(0, i).trim(), v];
    }),
);

const auth = new JWT({
  email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

const tab = process.argv[2] || 'Mon 31/08';
const q = /[^A-Za-z0-9_]/.test(tab) ? `'${tab.replace(/'/g, "''")}'` : tab;
const res = await sheets.spreadsheets.values.get({
  spreadsheetId: env.SHEET_ID,
  range: `${q}!A7:Q40`,
  valueRenderOption: 'UNFORMATTED_VALUE',
});
const rows = res.data.values ?? [];
console.log(`"${tab}" — ${rows.length} rows from row 7:\n`);
rows.forEach((row, i) => {
  const n = 7 + i;
  console.log(`row ${String(n).padStart(2)}: ${JSON.stringify(row)}`);
});

// distinct JOB (col B) and BOX SIZE (col J) values across the data rows
const val = (r, c) => String(r[c] ?? '').trim();
const jobs = new Set();
const sizes = new Set();
rows.slice(1).forEach((r) => {
  if (val(r, 1)) jobs.add(val(r, 1));
  if (val(r, 9)) sizes.add(val(r, 9));
});
console.log('\nDistinct JOB values:', [...jobs]);
console.log('Distinct BOX SIZE values:', [...sizes]);
