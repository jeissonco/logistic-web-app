import type { SheetsClient } from '../sheets/types';

/**
 * Range-aware in-memory `SheetsClient` for tests. Each tab is a dense grid indexed
 * from row 1 / column A. A1 ranges are parsed for both reads and writes.
 */
export class FakeSheetsClient implements SheetsClient {
  private readonly tabs = new Map<string, string[][]>();

  private readonly order: string[] = [];

  constructor(seed: Record<string, (string | number)[][]> = {}) {
    for (const [tab, grid] of Object.entries(seed)) {
      this.tabs.set(tab, grid.map(stringifyRow));
      this.order.push(tab);
    }
  }

  async listTabs(): Promise<string[]> {
    return [...this.order];
  }

  async getValues(range: string): Promise<string[][]> {
    const { tab, startRow, startCol, endRow, endCol } = parseA1(range);
    const grid = this.tabs.get(tab) ?? [];
    const lastRow = endRow ?? grid.length;
    const out: string[][] = [];
    for (let r = startRow; r <= lastRow; r++) {
      const source = grid[r - 1] ?? [];
      const lastCol = endCol ?? Math.max(source.length, startCol);
      const slice: string[] = [];
      for (let c = startCol; c <= lastCol; c++) slice.push(source[c - 1] ?? '');
      out.push(slice);
    }
    // Sheets trims trailing fully-empty rows.
    while (out.length && out[out.length - 1]!.every((v) => v === '')) out.pop();
    return out.map((row) => [...row]);
  }

  async updateValues(range: string, rows: (string | number)[][]): Promise<void> {
    const { tab, startRow, startCol } = parseA1(range);
    const grid = this.tabs.get(tab) ?? [];
    rows.forEach((row, i) => {
      const target = (grid[startRow - 1 + i] ??= []);
      row.forEach((value, j) => {
        target[startCol - 1 + j] = value == null ? '' : String(value);
      });
    });
    this.register(tab, grid);
  }

  async appendRow(range: string, row: (string | number)[]): Promise<void> {
    const { tab, startCol } = parseA1(range);
    const grid = this.tabs.get(tab) ?? [];
    const next: string[] = [];
    row.forEach((value, j) => {
      next[startCol - 1 + j] = value == null ? '' : String(value);
    });
    grid.push(next);
    this.register(tab, grid);
  }

  private register(tab: string, grid: string[][]): void {
    if (!this.tabs.has(tab)) this.order.push(tab);
    this.tabs.set(tab, grid);
  }

  /** Test helper: the full grid for a tab. */
  gridOf(tab: string): string[][] {
    return (this.tabs.get(tab) ?? []).map((row) => [...row]);
  }
}

function stringifyRow(row: (string | number)[]): string[] {
  return row.map((cell) => (cell == null ? '' : String(cell)));
}

interface ParsedRange {
  tab: string;
  startRow: number;
  startCol: number;
  endRow: number | null;
  endCol: number | null;
}

/** Parse `Tab!A8:Q` / `'My Tab'!L12:O12` / `Tab!A:Q`. Columns are 1-based. */
export function parseA1(range: string): ParsedRange {
  const bang = range.lastIndexOf('!');
  const rawTab = bang === -1 ? 'Sheet1' : range.slice(0, bang);
  const tab = rawTab.replace(/^'(.*)'$/, '$1').replace(/''/g, "'");
  const body = bang === -1 ? range : range.slice(bang + 1);
  const [startRef, endRef] = body.split(':');
  const start = parseRef(startRef ?? 'A1');
  const end = endRef ? parseRef(endRef) : null;
  return {
    tab,
    startRow: start.row ?? 1,
    startCol: start.col ?? 1,
    endRow: end?.row ?? null,
    endCol: end?.col ?? start.col ?? null,
  };
}

function parseRef(ref: string): { col: number | null; row: number | null } {
  const m = /^([A-Za-z]*)(\d*)$/.exec(ref.trim());
  if (!m) return { col: null, row: null };
  const [, letters, digits] = m;
  return {
    col: letters ? columnToNumber(letters) : null,
    row: digits ? Number.parseInt(digits, 10) : null,
  };
}

function columnToNumber(letters: string): number {
  return [...letters.toUpperCase()].reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0);
}
