import { boxSizeSchema, type BoxSize, type Movement, type RunsheetItem, type Stop } from '../schemas/index';
import { COLS, FIRST_DATA_ROW } from './ranges';

function cell(row: string[], index: number): string {
  return (row[index] ?? '').trim();
}

function parseBool(value: string): boolean {
  return /^(true|1|yes|y|✓|x)$/i.test(value.trim());
}

/** Pull the first integer out of messy cells like "One (1)" or "3 boxes". */
export function parseCount(value: string): number | null {
  const digits = value.match(/\d+/);
  if (!digits) return null;
  const n = Number.parseInt(digits[0], 10);
  return Number.isFinite(n) ? n : null;
}

const BOX_SIZE_ALIASES: Record<string, BoxSize> = {
  corp: 'Corporate',
  '100l': '100L',
  '240l': '240L',
  '240l locked': '240L Locked',
  '240llocked': '240L Locked',
  'locked 240l': '240L Locked',
  archive: 'Archive box',
  'archive box': 'Archive box',
  'archive boxes': 'Archive box',
};

function parseBoxSize(value: string): BoxSize | null {
  const v = value.trim().replace(/\s+/g, ' ').toLowerCase();
  if (!v) return null;
  const exact = boxSizeSchema.options.find((o) => o.toLowerCase() === v);
  return exact ?? BOX_SIZE_ALIASES[v] ?? null;
}

function movement(boxCell: string, countCell: string): Movement {
  return { boxSize: parseBoxSize(boxCell), count: parseCount(countCell) };
}

/** Some CONTACT # cells are stored as numbers, dropping the leading 0 of AU mobiles. */
export function normalizeContact(value: string): string {
  const v = value.trim();
  return /^4\d{8}$/.test(v) ? `0${v}` : v;
}

/**
 * A divider row (e.g. "MORNING TEA"): a label in BUSINESS/NAME but no contact number
 * and no real location. Everything else on the row is decoration.
 */
export function isDividerRow(row: string[]): boolean {
  const business = cell(row, COLS.business);
  if (!business) return false;
  const location = cell(row, COLS.location);
  const hasContact = cell(row, COLS.contact).length > 0;
  const hasBoxes = cell(row, COLS.plannedBoxSize).length > 0;
  const realLocation = location.length > 0 && location.toLowerCase() !== 'place';
  return !hasContact && !hasBoxes && !realLocation;
}

/** True when a row carries nothing we care about (spacer). */
export function isBlankRow(row: string[]): boolean {
  return !cell(row, COLS.business) && !cell(row, COLS.location) && !cell(row, COLS.contact);
}

export function rowNumberFor(index: number): number {
  return FIRST_DATA_ROW + index;
}

export function rowToStop(row: string[], index: number): Omit<Stop, 'stopId'> {
  return {
    rowNumber: rowNumberFor(index),
    invoiced: parseBool(cell(row, COLS.invoiced)),
    job: cell(row, COLS.job),
    requestDate: cell(row, COLS.requestDate),
    info: cell(row, COLS.info),
    business: cell(row, COLS.business),
    unit: cell(row, COLS.unit),
    location: cell(row, COLS.location),
    suburb: cell(row, COLS.suburb),
    contact: normalizeContact(cell(row, COLS.contact)),
    planned: movement(cell(row, COLS.plannedBoxSize), cell(row, COLS.plannedQuant)),
    dropped: movement(cell(row, COLS.droppedBoxSize), cell(row, COLS.droppedCount)),
    pickedUp: movement(cell(row, COLS.pickedBoxSize), cell(row, COLS.pickedCount)),
    notes: cell(row, COLS.notes),
  };
}

export function rowToItem(row: string[], index: number, stopId: string): RunsheetItem {
  if (isDividerRow(row)) {
    return { kind: 'divider', rowNumber: rowNumberFor(index), label: cell(row, COLS.business) };
  }
  return { kind: 'stop', stopId, ...rowToStop(row, index) };
}

export function existingStopId(row: string[]): string {
  return cell(row, COLS.stopId);
}

/** Serialize the L:O cells for a write-back. Empty string clears a cell. */
export function movementsToCells(dropped: Movement, pickedUp: Movement): (string | number)[] {
  return [
    dropped.boxSize ?? '',
    dropped.count ?? '',
    pickedUp.boxSize ?? '',
    pickedUp.count ?? '',
  ];
}
