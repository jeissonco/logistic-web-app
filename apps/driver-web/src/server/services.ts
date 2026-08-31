import 'server-only';
import type { DriverRecord } from '@logistic/core';
import { parseDriverRoster, RunsheetDirectory, RunsheetService } from '@logistic/core/server';
import { getEnv } from '@/lib/env';
import { getSheetsClient } from './sheets';
import { isE2EStub } from './flags';
import { getE2EServices } from './e2e-fixture';

export interface Services {
  directory: RunsheetDirectory;
  runsheetFor: (tab: string) => RunsheetService;
  roster: DriverRecord[];
  /** When set, every day resolves to this one tab (single-tab / E2E mode). */
  fixedTab: string | null;
}

let rosterCache: DriverRecord[] | null = null;

function getRoster(): DriverRecord[] {
  if (rosterCache) return rosterCache;
  let raw: unknown;
  try {
    raw = JSON.parse(getEnv().DRIVERS_JSON);
  } catch {
    throw new Error('DRIVERS_JSON is not valid JSON');
  }
  rosterCache = parseDriverRoster(raw);
  return rosterCache;
}

/** Core services wired to the live Sheets client (or the E2E fixture). */
export function getServices(): Services {
  if (isE2EStub) return getE2EServices();
  const env = getEnv();
  const sheets = getSheetsClient();
  return {
    directory: new RunsheetDirectory(sheets),
    runsheetFor: (tab) => new RunsheetService(sheets, tab),
    roster: getRoster(),
    fixedTab: env.RUNSHEET_TAB ?? null,
  };
}
