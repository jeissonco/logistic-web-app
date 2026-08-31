import type { SheetsClient } from '../sheets/types';
import {
  dataRange,
  movementsRange,
  notesRange,
  stopIdColumnRange,
  FIRST_DATA_ROW,
} from '../sheets/ranges';
import {
  existingStopId,
  isBlankRow,
  isDividerRow,
  movementsToCells,
  rowToItem,
  rowToStop,
} from '../sheets/mapping';
import {
  emptyMovement,
  recordMovementsInputSchema,
  type Movement,
  type RecordMovementsInput,
  type Runsheet,
  type RunsheetItem,
  type Stop,
} from '../schemas/index';

export class RunsheetError extends Error {
  constructor(
    readonly code: 'STOP_NOT_FOUND',
    message: string,
  ) {
    super(message);
    this.name = 'RunsheetError';
  }
}

export interface RunsheetServiceOptions {
  now?: () => Date;
  newId?: () => string;
}

/**
 * Reads and updates the single runsheet tab. On read it stamps a Stop ID (column Q)
 * into any actionable row missing one, then keys every write on that id.
 */
export class RunsheetService {
  private readonly now: () => Date;
  private readonly newId: () => string;

  constructor(
    private readonly sheets: SheetsClient,
    private readonly tab: string,
    opts: RunsheetServiceOptions = {},
  ) {
    this.now = opts.now ?? (() => new Date());
    this.newId = opts.newId ?? defaultId;
  }

  /** The whole runsheet as an ordered list of stops and dividers. */
  async getRunsheet(): Promise<Runsheet> {
    const rows = await this.sheets.getValues(dataRange(this.tab));
    const ids = await this.ensureStopIds(rows);

    const items: RunsheetItem[] = [];
    rows.forEach((row, i) => {
      if (isBlankRow(row) && !isDividerRow(row)) return;
      items.push(rowToItem(row, i, ids[i] ?? ''));
    });

    return { tab: this.tab, generatedAt: this.now().toISOString(), items };
  }

  async getStop(stopId: string): Promise<Stop | null> {
    const rows = await this.sheets.getValues(dataRange(this.tab));
    const ids = await this.ensureStopIds(rows);
    const index = ids.findIndex((id) => id && id === stopId);
    if (index === -1 || isDividerRow(rows[index] ?? [])) return null;
    return { stopId, ...rowToStop(rows[index] ?? [], index) };
  }

  /**
   * Merge the provided movement(s) over what's already on the row and write the
   * DROPPED / # Dropped / PICKED UP / # Picked up cells (L:O) in place. An optional
   * note replaces the NOTES cell (P).
   */
  async recordMovements(input: RecordMovementsInput): Promise<Stop> {
    const parsed = recordMovementsInputSchema.parse(input);
    const stop = await this.getStop(parsed.stopId);
    if (!stop) throw new RunsheetError('STOP_NOT_FOUND', 'That stop is not on the runsheet.');

    const dropped: Movement = parsed.dropped ?? stop.dropped ?? emptyMovement;
    const pickedUp: Movement = parsed.pickedUp ?? stop.pickedUp ?? emptyMovement;

    await this.sheets.updateValues(movementsRange(this.tab, stop.rowNumber), [
      movementsToCells(dropped, pickedUp),
    ]);

    const notes = parsed.notes ?? stop.notes;
    if (parsed.notes != null && parsed.notes !== stop.notes) {
      await this.sheets.updateValues(notesRange(this.tab, stop.rowNumber), [[parsed.notes]]);
    }

    return { ...stop, dropped, pickedUp, notes };
  }

  /**
   * Returns the Stop ID for every data row (by index). Rows that are actionable and
   * lack an id get one generated and written back to column Q in a single update.
   */
  private async ensureStopIds(rows: string[][]): Promise<string[]> {
    const ids = rows.map(existingStopId);
    let dirty = false;

    rows.forEach((row, i) => {
      if (ids[i]) return;
      if (isDividerRow(row) || isBlankRow(row)) return;
      ids[i] = this.newId();
      dirty = true;
    });

    if (dirty && rows.length > 0) {
      const lastRow = FIRST_DATA_ROW + rows.length - 1;
      await this.sheets.updateValues(
        stopIdColumnRange(this.tab, lastRow),
        ids.map((id) => [id ?? '']),
      );
    }
    return ids;
  }
}

function defaultId(): string {
  const rand =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `stop_${rand}`;
}
