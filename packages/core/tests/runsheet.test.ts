import { describe, expect, it } from 'vitest';
import { RunsheetService, RunsheetError } from '../src/services/runsheet';
import { FakeSheetsClient, makeRunsheetGrid } from '../src/testing/index';
import { COLS } from '../src/sheets/ranges';

const TAB = 'Runsheet BS';
const FIXED_NOW = () => new Date('2026-08-30T08:00:00.000Z');

function serviceWith(rows: Parameters<typeof makeRunsheetGrid>[0]) {
  let n = 0;
  const sheets = new FakeSheetsClient({ [TAB]: makeRunsheetGrid(rows) });
  const service = new RunsheetService(sheets, TAB, { now: FIXED_NOW, newId: () => `stop_${++n}` });
  return { sheets, service };
}

describe('RunsheetService.getRunsheet', () => {
  it('returns stops and dividers in order, skipping blank rows', async () => {
    const { service } = serviceWith([
      { business: 'Fit Profits', location: '2B Forbes Road', suburb: 'Applecross', contact: '93162000' },
      { divider: 'MORNING TEA' },
      { business: 'House Business Group', location: '414 Stirling Hwy', contact: '94682282' },
    ]);

    const rs = await service.getRunsheet();
    expect(rs.items.map((i) => i.kind)).toEqual(['stop', 'divider', 'stop']);
    expect(rs.items[1]).toMatchObject({ kind: 'divider', label: 'MORNING TEA' });
    expect(rs.tab).toBe(TAB);
  });

  it('stamps a Stop ID into actionable rows missing one and writes column Q once', async () => {
    const { sheets, service } = serviceWith([
      { business: 'A', location: '1 St', contact: '111' },
      { divider: 'LUNCH' },
      { business: 'B', location: '2 St', contact: '222' },
    ]);

    const rs = await service.getRunsheet();
    const ids = rs.items.filter((i) => i.kind === 'stop').map((i) => (i as { stopId: string }).stopId);
    expect(ids).toEqual(['stop_1', 'stop_2']);

    const grid = sheets.gridOf(TAB);
    expect(grid[7]?.[COLS.stopId]).toBe('stop_1'); // row 8
    expect(grid[8]?.[COLS.stopId]).toBe(''); // divider row keeps no id
    expect(grid[9]?.[COLS.stopId]).toBe('stop_2'); // row 10
  });

  it('does not rewrite Stop IDs that already exist', async () => {
    const { sheets, service } = serviceWith([
      { business: 'A', location: '1 St', contact: '111', stopId: 'keep_me' },
    ]);
    const rs = await service.getRunsheet();
    expect((rs.items[0] as { stopId: string }).stopId).toBe('keep_me');
    expect(sheets.gridOf(TAB)[7]?.[COLS.stopId]).toBe('keep_me');
  });

  it('parses planned quantity out of "One (1)"', async () => {
    const { service } = serviceWith([
      { business: 'A', location: '1 St', contact: '111', plannedBoxSize: 'Small', plannedQuant: 'One (1)' },
    ]);
    const rs = await service.getRunsheet();
    expect(rs.items[0]).toMatchObject({ planned: { boxSize: 'Small', count: 1 } });
  });
});

describe('RunsheetService.recordMovements', () => {
  it('writes DROPPED/PICKED UP cells in place and preserves the untouched pair', async () => {
    const { sheets, service } = serviceWith([
      { business: 'A', location: '1 St', contact: '111', pickedBoxSize: 'Big', pickedCount: 2 },
    ]);
    await service.getRunsheet(); // stamp id -> stop_1

    const updated = await service.recordMovements({
      stopId: 'stop_1',
      dropped: { boxSize: '240L', count: 3 },
    });

    expect(updated.dropped).toEqual({ boxSize: '240L', count: 3 });
    expect(updated.pickedUp).toEqual({ boxSize: 'Big', count: 2 });

    const row = sheets.gridOf(TAB)[7]!; // row 8
    expect([row[COLS.droppedBoxSize], row[COLS.droppedCount]]).toEqual(['240L', '3']);
    expect([row[COLS.pickedBoxSize], row[COLS.pickedCount]]).toEqual(['Big', '2']);
  });

  it('writes a driver note to column P without clearing movements', async () => {
    const { sheets, service } = serviceWith([
      { business: 'A', location: '1 St', contact: '111', droppedBoxSize: 'Big', droppedCount: 1 },
    ]);
    await service.getRunsheet();

    const updated = await service.recordMovements({ stopId: 'stop_1', notes: 'gate was locked' });
    expect(updated.notes).toBe('gate was locked');

    const row = sheets.gridOf(TAB)[7]!; // row 8
    expect(row[COLS.notes]).toBe('gate was locked');
    expect([row[COLS.droppedBoxSize], row[COLS.droppedCount]]).toEqual(['Big', '1']);
  });

  it('rejects an unknown stop id', async () => {
    const { service } = serviceWith([{ business: 'A', location: '1 St', contact: '111' }]);
    await service.getRunsheet();
    await expect(service.recordMovements({ stopId: 'nope', dropped: { boxSize: 'Small', count: 1 } }))
      .rejects.toBeInstanceOf(RunsheetError);
  });

  it('rejects a submission with neither movement', async () => {
    const { service } = serviceWith([{ business: 'A', location: '1 St', contact: '111' }]);
    await service.getRunsheet();
    await expect(service.recordMovements({ stopId: 'stop_1' })).rejects.toThrow();
  });
});
