/**
 * The only surface the domain services use to reach a spreadsheet. Swappable:
 * `GoogleSheetsClient` in production, `FakeSheetsClient` in tests, and one day a
 * database adapter that satisfies the same shape. No dependencies — browser-safe.
 */
export interface SheetsClient {
  /** Titles of every tab in the spreadsheet, in sheet order. */
  listTabs(): Promise<string[]>;
  /** Read a rectangular A1 range. Returns rows of stringified cell values. */
  getValues(range: string): Promise<string[][]>;
  /** Append one row after the last row of the range's table. */
  appendRow(range: string, row: (string | number)[]): Promise<void>;
  /** Overwrite the given range with the provided rows. */
  updateValues(range: string, rows: (string | number)[][]): Promise<void>;
}
