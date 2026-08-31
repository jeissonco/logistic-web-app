import { describe, expect, it } from 'vitest';
import { listDayTabs, parseDayTab, resolveDayTab } from '../src/runsheet/day-tabs';
import { RunsheetDirectory } from '../src/services/directory';
import { FakeSheetsClient } from '../src/testing/index';

const REF = new Date('2026-08-19T09:00:00'); // a Wednesday in August 2026

describe('parseDayTab', () => {
  it('parses "Mon 17/08" with the year inferred from the reference date', () => {
    expect(parseDayTab('Mon 17/08', REF)).toEqual({
      tab: 'Mon 17/08',
      date: '2026-08-17',
      label: 'Mon 17 Aug',
    });
  });

  it('accepts single-digit day/month and is case-insensitive', () => {
    expect(parseDayTab('fri 1/9', REF)?.date).toBe('2026-09-01');
  });

  it('accepts the sheet\'s mixed weekday spellings (Thu / Thur / Tues / Thursday)', () => {
    expect(parseDayTab('Thur 06/08', REF)?.date).toBe('2026-08-06');
    expect(parseDayTab('Thu 20/08', REF)?.date).toBe('2026-08-20');
    expect(parseDayTab('Tues 04/08', REF)?.date).toBe('2026-08-04');
    expect(parseDayTab('Thursday 13/08', REF)?.date).toBe('2026-08-13');
  });

  it('rejects non-day tabs and impossible dates', () => {
    expect(parseDayTab('Pricing', REF)).toBeNull();
    expect(parseDayTab('Table2_21', REF)).toBeNull();
    expect(parseDayTab('MASTER', REF)).toBeNull();
    expect(parseDayTab('MOOD tracker', REF)).toBeNull();
    expect(parseDayTab('Wed 31/02', REF)).toBeNull();
  });

  it('infers the previous year for a December tab seen in January', () => {
    const jan = new Date('2027-01-05T09:00:00');
    expect(parseDayTab('Thu 31/12', jan)?.date).toBe('2026-12-31');
  });
});

describe('listDayTabs / resolveDayTab', () => {
  const titles = ['Overview', 'Mon 17/08', 'Tue 18/08', 'Wed 19/08', 'Thu 20/08', 'Fri 21/08', 'Notes'];

  it('keeps only day tabs, sorted ascending, ignoring the rest', () => {
    expect(listDayTabs(titles, REF).map((d) => d.tab)).toEqual([
      'Mon 17/08',
      'Tue 18/08',
      'Wed 19/08',
      'Thu 20/08',
      'Fri 21/08',
    ]);
  });

  it('resolves a date to its tab, or null when absent', () => {
    expect(resolveDayTab(titles, '2026-08-19', REF)).toBe('Wed 19/08');
    expect(resolveDayTab(titles, '2026-08-22', REF)).toBeNull();
  });
});

describe('RunsheetDirectory', () => {
  it('reads the tab list from the SheetsClient', async () => {
    const sheets = new FakeSheetsClient({ Overview: [[]], 'Mon 17/08': [[]], 'Fri 21/08': [[]] });
    const dir = new RunsheetDirectory(sheets);
    expect((await dir.listDays(REF)).map((d) => d.tab)).toEqual(['Mon 17/08', 'Fri 21/08']);
    expect(await dir.resolveTab('2026-08-21', REF)).toBe('Fri 21/08');
  });
});
