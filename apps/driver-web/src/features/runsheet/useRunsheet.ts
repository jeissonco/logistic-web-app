'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export const runsheetKey = (date?: string) => ['runsheet', date ?? 'today'] as const;

/** The runsheet for a given day (default: today). Includes the resolved day label. */
export function useRunsheet(date?: string) {
  return useQuery({
    queryKey: runsheetKey(date),
    queryFn: () => api.getRunsheet(date),
    retry: (count, err) =>
      // Don't retry "this day has no tab" — it's a real answer, not a blip.
      !(err instanceof Error && 'code' in err && err.code === 'NO_RUNSHEET') && count < 2,
  });
}

/** Available day tabs in the current month's spreadsheet. */
export function useDays() {
  return useQuery({ queryKey: ['days'], queryFn: () => api.listDays().then((r) => r.days) });
}
