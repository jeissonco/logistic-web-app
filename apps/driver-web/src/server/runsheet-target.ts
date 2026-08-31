import 'server-only';
import { NextResponse } from 'next/server';
import { todayIso } from '@logistic/core';
import { getServices } from './services';
import { jsonError } from './http';

export interface RunsheetTarget {
  tab: string;
  date: string;
  label: string;
}

function isIso(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function labelFor(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Turn an optional `?date=YYYY-MM-DD` into the runsheet tab to read/write.
 * Returns a 404 `NO_RUNSHEET` response when that day has no tab.
 */
export async function resolveRunsheetTarget(
  dateParam: string | null,
): Promise<RunsheetTarget | NextResponse> {
  const svc = getServices();
  const date = dateParam && isIso(dateParam) ? dateParam : todayIso();

  if (svc.fixedTab) return { tab: svc.fixedTab, date, label: labelFor(date) };

  const days = await svc.directory.listDays();
  const day = days.find((d) => d.date === date);
  if (!day) return jsonError(404, `No runsheet for ${labelFor(date)}.`, 'NO_RUNSHEET');
  return { tab: day.tab, date: day.date, label: day.label };
}
