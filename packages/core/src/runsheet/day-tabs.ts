/**
 * Each month lives in its own spreadsheet; inside it, one tab per working day named
 * like `Mon 17/08` (weekday, space, DD/MM, no year). These helpers turn that tab list
 * into dates the app can navigate.
 */

// Weekday word (any length — the sheet mixes "Thu"/"Thur", "Tue"/"Tues", …), a
// separator, then DD/MM. The weekday's first three letters must be a real day.
const DAY_TAB_RE = /^([A-Za-z]{3,9})[\s.]+(\d{1,2})\/(\d{1,2})$/;
const WEEKDAY_PREFIXES = new Set(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

export interface DayTab {
  /** The tab title exactly as it appears in the spreadsheet. */
  tab: string;
  /** ISO date `YYYY-MM-DD`; the year is inferred (tab names have none). */
  date: string;
  /** Short human label, e.g. `Mon 17 Aug`. */
  label: string;
}

function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Local `YYYY-MM-DD` for "now". */
export function todayIso(ref: Date = new Date()): string {
  return iso(ref);
}

/** Pick the year (ref-1 / ref / ref+1) that puts day/month closest to `ref`. */
function inferYear(month: number, day: number, ref: Date): number {
  const base = ref.getFullYear();
  let best = base;
  let bestDiff = Infinity;
  for (const y of [base - 1, base, base + 1]) {
    const diff = Math.abs(new Date(y, month - 1, day).getTime() - ref.getTime());
    if (diff < bestDiff) {
      bestDiff = diff;
      best = y;
    }
  }
  return best;
}

/** Parse one tab title, or `null` if it isn't a `Ddd DD/MM` day tab. */
export function parseDayTab(title: string, ref: Date = new Date()): DayTab | null {
  const m = DAY_TAB_RE.exec(title.trim());
  if (!m) return null;
  if (!WEEKDAY_PREFIXES.has(m[1]!.slice(0, 3).toLowerCase())) return null;
  const day = Number(m[2]);
  const month = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const year = inferYear(month, day, ref);
  const dt = new Date(year, month - 1, day);
  if (dt.getMonth() !== month - 1 || dt.getDate() !== day) return null; // e.g. 31/02

  return {
    tab: title,
    date: iso(dt),
    label: dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
  };
}

/** All day tabs in a spreadsheet's tab list, parsed and sorted ascending by date. */
export function listDayTabs(titles: string[], ref?: Date): DayTab[] {
  return titles
    .map((t) => parseDayTab(t, ref))
    .filter((d): d is DayTab => d !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** The tab title for a given ISO date, or `null` if that day has no tab. */
export function resolveDayTab(titles: string[], targetIso: string, ref?: Date): string | null {
  return listDayTabs(titles, ref).find((d) => d.date === targetIso)?.tab ?? null;
}
