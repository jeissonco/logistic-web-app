import type { DayTab, Movement, PublicDriver, Runsheet, Session, Stop } from '@logistic/core';

/** Thrown for any non-2xx internal API response. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError(
      res.status,
      typeof body.error === 'string' ? body.error : res.statusText,
      typeof body.code === 'string' ? body.code : undefined,
    );
  }
  return body as T;
}

export interface RecordMovementsBody {
  dropped?: Movement | null;
  pickedUp?: Movement | null;
  notes?: string;
}

export interface RunsheetResponse {
  runsheet: Runsheet;
  day: { date: string; label: string };
}

const withDate = (path: string, date?: string) =>
  date ? `${path}${path.includes('?') ? '&' : '?'}date=${encodeURIComponent(date)}` : path;

/** The single typed surface the browser uses. Components never call `fetch` directly. */
export const api = {
  listDrivers: () => request<{ drivers: PublicDriver[] }>('/api/drivers'),

  login: (driverId: string, pin: string) =>
    request<{ session: Session }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ driverId, pin }),
    }),

  logout: () => request<{ ok: true }>('/api/auth/logout', { method: 'POST' }),

  listDays: () => request<{ days: DayTab[] }>('/api/days'),

  getRunsheet: (date?: string) => request<RunsheetResponse>(withDate('/api/runsheet', date)),

  recordMovements: (stopId: string, body: RecordMovementsBody, date?: string) =>
    request<{ ok: true; stop: Stop }>(
      withDate(`/api/stops/${encodeURIComponent(stopId)}/movements`, date),
      { method: 'POST', body: JSON.stringify(body) },
    ),
};
