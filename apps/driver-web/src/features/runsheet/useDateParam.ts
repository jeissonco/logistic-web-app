'use client';

import { useSearchParams } from 'next/navigation';

/** The `?date=YYYY-MM-DD` query param, or `undefined` (meaning "today"). */
export function useDateParam(): string | undefined {
  const value = useSearchParams().get('date');
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}
