/**
 * The spreadsheet layout the app depends on. Human-readable mirror: docs/sheet-schema.md.
 * The runsheet is a single tab whose name is supplied at runtime (RUNSHEET_TAB env).
 *
 * Header is on row 7; data starts on row 8 (rows 1–6 are hidden / a legend).
 */

export const HEADER_ROW = 7;
export const FIRST_DATA_ROW = HEADER_ROW + 1; // 8
export const LAST_COLUMN = 'Q';

/** Zero-based column indexes, matching the screenshot A–Q. */
export const COLS = {
  invoiced: 0, // A
  job: 1, // B
  requestDate: 2, // C
  info: 3, // D  NOTES/INFO
  business: 4, // E
  unit: 5, // F
  location: 6, // G
  suburb: 7, // H
  contact: 8, // I
  plannedBoxSize: 9, // J  BOX SIZE
  plannedQuant: 10, // K  QUANT
  droppedBoxSize: 11, // L  DROPPED
  droppedCount: 12, // M  # Dropped
  pickedBoxSize: 13, // N  PICKED UP
  pickedCount: 14, // O  # Picked up
  notes: 15, // P
  stopId: 16, // Q  (app-managed)
} as const;

function quoteTab(tab: string): string {
  return /^[A-Za-z0-9_]+$/.test(tab) ? tab : `'${tab.replace(/'/g, "''")}'`;
}

/** All data rows, columns A–Q. */
export function dataRange(tab: string): string {
  return `${quoteTab(tab)}!A${FIRST_DATA_ROW}:${LAST_COLUMN}`;
}

/** The Stop ID column (Q) for a run of data rows — used to stamp missing ids in one write. */
export function stopIdColumnRange(tab: string, lastRow: number): string {
  return `${quoteTab(tab)}!Q${FIRST_DATA_ROW}:Q${Math.max(lastRow, FIRST_DATA_ROW)}`;
}

/** The DROPPED / # Dropped / PICKED UP / # Picked up cells (L:O) for one row. */
export function movementsRange(tab: string, rowNumber: number): string {
  return `${quoteTab(tab)}!L${rowNumber}:O${rowNumber}`;
}

/** The NOTES cell (P) for one row — driver-editable. */
export function notesRange(tab: string, rowNumber: number): string {
  return `${quoteTab(tab)}!P${rowNumber}`;
}
