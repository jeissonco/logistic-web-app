import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import type { SheetsClient } from './types';

export type { SheetsClient } from './types';

export interface GoogleSheetsClientConfig {
  serviceAccountEmail: string;
  /** PEM private key with real newlines (the host app normalizes `\n`). */
  privateKey: string;
  spreadsheetId: string;
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

/** Google Sheets-backed {@link SheetsClient}. Node-only (pulls in googleapis). */
export class GoogleSheetsClient implements SheetsClient {
  private readonly spreadsheetId: string;
  private readonly sheets;

  constructor(config: GoogleSheetsClientConfig) {
    this.spreadsheetId = config.spreadsheetId;
    const auth = new JWT({
      email: config.serviceAccountEmail,
      key: config.privateKey,
      scopes: SCOPES,
    });
    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async listTabs(): Promise<string[]> {
    const res = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
      fields: 'sheets.properties.title',
    });
    return (res.data.sheets ?? [])
      .map((s) => s.properties?.title ?? '')
      .filter((t): t is string => t.length > 0);
  }

  async getValues(range: string): Promise<string[][]> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
      // FORMATTED_VALUE = exactly what a human sees in the cell: phone numbers keep
      // their leading zero, dates read as displayed, checkboxes as TRUE/FALSE.
      valueRenderOption: 'FORMATTED_VALUE',
    });
    const values = res.data.values ?? [];
    return values.map((row) => row.map((cell) => (cell == null ? '' : String(cell))));
  }

  async appendRow(range: string, row: (string | number)[]): Promise<void> {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });
  }

  async updateValues(range: string, rows: (string | number)[][]): Promise<void> {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    });
  }
}
