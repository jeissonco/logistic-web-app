import 'server-only';
import type { DriverRecord } from '@logistic/core';
import { RunsheetDirectory, RunsheetService } from '@logistic/core/server';
import { FakeSheetsClient, makeRunsheetGrid } from '@logistic/core/testing';
import type { Services } from './services';

/**
 * Deterministic in-memory backend for Playwright (E2E_STUB_API=1).
 * Driver "Alex Rivera" / PIN `1234`; a single fixed tab (day resolution bypassed).
 */
export const E2E_TAB = 'Runsheet';
export const E2E_PIN = '1234';
// bcrypt hash of "1234" (cost 8) — precomputed so this file needs no bcrypt dep.
const E2E_PIN_HASH = '$2a$08$pn1d9zI1Be1rKuFWuqJpbu5XFAt6bLG8iHrttB7ldUMtOwNm7rJEC';

const E2E_ROSTER: DriverRecord[] = [
  { driverId: 'drv_alex', name: 'Alex Rivera', pinHash: E2E_PIN_HASH, active: true },
];

const globalForE2E = globalThis as unknown as { __e2eServices__?: Services };

export function getE2EServices(): Services {
  if (globalForE2E.__e2eServices__) return globalForE2E.__e2eServices__;

  const sheets = new FakeSheetsClient({
    [E2E_TAB]: makeRunsheetGrid([
      { stopId: 'stop_1', job: 'BS', business: 'Fit Profits', unit: 'Unit B', location: '2B Forbes Road', suburb: 'Applecross', contact: '93162000', plannedBoxSize: 'Small', plannedQuant: 'One (1)' },
      { stopId: 'stop_2', job: 'CO', business: 'German Translation', location: '83 Bernedale Way', suburb: 'Duncraig', contact: '438804992', plannedBoxSize: 'Small', plannedQuant: 'One (1)' },
      { divider: 'MORNING TEA' },
      { stopId: 'stop_3', job: 'DO', business: 'House Business Group', unit: 'Unit 2', location: '414 Stirling Highway', suburb: 'Claremont', contact: '94682282', plannedBoxSize: 'Big', plannedQuant: 'Two (2)' },
    ]),
  });

  const services: Services = {
    directory: new RunsheetDirectory(sheets),
    runsheetFor: (tab) => new RunsheetService(sheets, tab),
    roster: E2E_ROSTER,
    fixedTab: E2E_TAB,
  };
  globalForE2E.__e2eServices__ = services;
  return services;
}
