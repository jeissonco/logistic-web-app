import type { BoxSize, Movement, RunsheetItem, Stop } from '../schemas/index';

export const BOX_SIZE_LABELS: Record<BoxSize, string> = {
  Small: 'Small',
  Big: 'Big',
  '100L': '100L bin',
  Corporate: 'Corporate',
  '240L': '240L bin',
  '240L Locked': '240L Locked',
  'Archive box': 'Archive box',
};

/** Box sizes a driver can currently choose in the drop-off / pick-up form. */
export const SELECTABLE_BOX_SIZES: BoxSize[] = ['Small', 'Big', '100L', 'Corporate', '240L'];

/**
 * The JOB column mixes short codes ("BS") and full words ("DROP OFF", "COLLECTION").
 * Normalize to a short code + label for the badge.
 */
export function normalizeJob(raw: string): { code: string; label: string } {
  const v = raw.trim().toUpperCase().replace(/[\s_-]+/g, ' ');
  if (v === 'BS' || v === 'BOX SWAP') return { code: 'BS', label: 'Box Swap' };
  if (v === 'DO' || v === 'DROP OFF' || v === 'DROPOFF') return { code: 'DO', label: 'Drop Off' };
  if (v === 'CO' || v === 'COLLECTION') return { code: 'CO', label: 'Collection' };
  return { code: raw.trim(), label: raw.trim() };
}

export function hasMovement(m: Movement | null | undefined): boolean {
  return !!m && (m.boxSize != null || (m.count != null && m.count > 0));
}

/** A stop counts as actioned once the driver has recorded a drop or a pick-up. */
export function isStopDone(stop: Stop): boolean {
  return hasMovement(stop.dropped) || hasMovement(stop.pickedUp);
}

export function movementSummary(m: Movement): string {
  if (!hasMovement(m)) return '—';
  const size = m.boxSize ?? '?';
  return m.count != null ? `${m.count} × ${size}` : size;
}

/** Split a runsheet into contiguous sections separated by divider rows. */
export function groupBySection(items: RunsheetItem[]): { label: string | null; stops: Stop[] }[] {
  const sections: { label: string | null; stops: Stop[] }[] = [{ label: null, stops: [] }];
  for (const item of items) {
    if (item.kind === 'divider') {
      sections.push({ label: item.label, stops: [] });
    } else {
      sections[sections.length - 1]!.stops.push(item);
    }
  }
  return sections.filter((s) => s.stops.length > 0 || s.label !== null);
}

export interface RunsheetProgress {
  total: number;
  done: number;
  remaining: number;
}

export function runsheetProgress(items: RunsheetItem[]): RunsheetProgress {
  const stops = items.filter((i): i is Extract<RunsheetItem, { kind: 'stop' }> => i.kind === 'stop');
  const done = stops.filter(isStopDone).length;
  return { total: stops.length, done, remaining: stops.length - done };
}
