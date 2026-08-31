import { HEADER_ROW, LAST_COLUMN } from '../sheets/ranges';

const COL_COUNT = columnToNumber(LAST_COLUMN); // A..Q = 17

export interface StopSeed {
  invoiced?: boolean;
  job?: string;
  requestDate?: string;
  info?: string;
  business: string;
  unit?: string;
  location?: string;
  suburb?: string;
  contact?: string;
  plannedBoxSize?: string;
  plannedQuant?: string;
  droppedBoxSize?: string;
  droppedCount?: string | number;
  pickedBoxSize?: string;
  pickedCount?: string | number;
  notes?: string;
  stopId?: string;
}

export type RowSeed = StopSeed | { divider: string };

const HEADER = [
  'INVOICED', 'JOB', 'DATE OF REQUEST', 'NOTES/INFO', 'BUSINESS/NAME', 'Unit #',
  'LOCATION', 'SUBURB', 'CONTACT #', 'BOX SIZE', 'QUANT', 'DROPPED', '# Dropped',
  'PICKED UP', '# Picked up', 'NOTES', 'Stop ID',
];

/**
 * Build a spreadsheet grid that matches the real layout: rows 1–6 blank, header on
 * row 7, data from row 8. Pass stop seeds and `{ divider: 'MORNING TEA' }` entries.
 */
export function makeRunsheetGrid(rows: RowSeed[]): string[][] {
  const grid: string[][] = [];
  for (let r = 1; r < HEADER_ROW; r++) grid.push(blank());
  grid.push(pad(HEADER));

  for (const row of rows) {
    if ('divider' in row) {
      const r = blank();
      r[4] = row.divider; // BUSINESS/NAME column
      r[6] = 'Place';
      grid.push(r);
      continue;
    }
    grid.push(
      pad([
        row.invoiced ? 'TRUE' : '',
        row.job ?? 'BS',
        row.requestDate ?? 'Monthly',
        row.info ?? '',
        row.business,
        row.unit ?? '',
        row.location ?? '',
        row.suburb ?? '',
        row.contact ?? '',
        row.plannedBoxSize ?? '',
        row.plannedQuant ?? '',
        row.droppedBoxSize ?? '',
        row.droppedCount ?? '',
        row.pickedBoxSize ?? '',
        row.pickedCount ?? '',
        row.notes ?? '',
        row.stopId ?? '',
      ]),
    );
  }
  return grid;
}

function blank(): string[] {
  return Array.from({ length: COL_COUNT }, () => '');
}

function pad(values: (string | number)[]): string[] {
  const row = blank();
  values.forEach((v, i) => (row[i] = v == null ? '' : String(v)));
  return row;
}

function columnToNumber(letters: string): number {
  return [...letters.toUpperCase()].reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0);
}
