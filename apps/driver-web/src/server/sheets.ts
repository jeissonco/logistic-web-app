import 'server-only';
import { GoogleSheetsClient, type SheetsClient } from '@logistic/core/server';
import { getEnv } from '@/lib/env';

let client: SheetsClient | null = null;

/** Process-wide singleton Sheets client built from validated env. */
export function getSheetsClient(): SheetsClient {
  if (client) return client;
  const env = getEnv();
  client = new GoogleSheetsClient({
    serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: env.GOOGLE_PRIVATE_KEY,
    spreadsheetId: env.SHEET_ID,
  });
  return client;
}
