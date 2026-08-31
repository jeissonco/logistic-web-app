import { describe, expect, it } from 'vitest';
import { isDividerRow, normalizeContact, parseCount, rowToStop } from '../src/sheets/mapping';
import { normalizeJob } from '../src/domain/stop';
import { makeRunsheetGrid } from '../src/testing/index';

describe('parseCount', () => {
  it('extracts the first integer', () => {
    expect(parseCount('One (1)')).toBe(1);
    expect(parseCount('3 boxes')).toBe(3);
    expect(parseCount('')).toBeNull();
    expect(parseCount('none')).toBeNull();
  });
});

describe('isDividerRow', () => {
  it('is true for a labelled row with no contact or boxes', () => {
    const [row] = makeRunsheetGrid([{ divider: 'MORNING TEA' }]).slice(7);
    expect(isDividerRow(row!)).toBe(true);
  });

  it('is false for a real stop', () => {
    const [row] = makeRunsheetGrid([
      { business: 'Fit Profits', location: '2B Forbes Road', contact: '93162000' },
    ]).slice(7);
    expect(isDividerRow(row!)).toBe(false);
  });
});

describe('real-sheet quirks', () => {
  it('accepts "Corporate", "240L Locked", "Archive box" and trailing spaces', () => {
    const [row] = makeRunsheetGrid([
      { business: 'X', contact: '1', location: '1 St', droppedBoxSize: 'Corporate', pickedBoxSize: 'Big ' },
    ]).slice(7);
    const stop = rowToStop(row!, 0);
    expect(stop.dropped.boxSize).toBe('Corporate');
    expect(stop.pickedUp.boxSize).toBe('Big');

    const [row2] = makeRunsheetGrid([
      { business: 'Y', contact: '1', location: '2 St', droppedBoxSize: '240L locked', pickedBoxSize: 'archive box' },
    ]).slice(7);
    const stop2 = rowToStop(row2!, 0);
    expect(stop2.dropped.boxSize).toBe('240L Locked');
    expect(stop2.pickedUp.boxSize).toBe('Archive box');
  });

  it('normalizeJob maps full words and codes to a short code + label', () => {
    expect(normalizeJob('DROP OFF')).toEqual({ code: 'DO', label: 'Drop Off' });
    expect(normalizeJob('collection')).toEqual({ code: 'CO', label: 'Collection' });
    expect(normalizeJob('BS')).toEqual({ code: 'BS', label: 'Box Swap' });
    expect(normalizeJob('XYZ')).toEqual({ code: 'XYZ', label: 'XYZ' });
  });

  it('normalizeContact restores the leading 0 on 9-digit mobiles only', () => {
    expect(normalizeContact('448797582')).toBe('0448797582');
    expect(normalizeContact('0449818812')).toBe('0449818812');
    expect(normalizeContact('95923343')).toBe('95923343');
    expect(normalizeContact('6424 9629')).toBe('6424 9629');
  });
});

describe('rowToStop', () => {
  it('maps every column of a stop row', () => {
    const [row] = makeRunsheetGrid([
      {
        invoiced: true,
        business: 'R and R Wealth',
        unit: 'Unit 3',
        location: '35 Tamara Drive',
        suburb: 'Cockburn Central',
        contact: '436417994',
        plannedBoxSize: 'Small',
        plannedQuant: 'One (1)',
        droppedBoxSize: 'Small',
        droppedCount: 1,
        notes: 'left at reception',
      },
    ]).slice(7);

    const stop = rowToStop(row!, 0);
    expect(stop).toMatchObject({
      rowNumber: 8,
      invoiced: true,
      business: 'R and R Wealth',
      unit: 'Unit 3',
      suburb: 'Cockburn Central',
      planned: { boxSize: 'Small', count: 1 },
      dropped: { boxSize: 'Small', count: 1 },
      pickedUp: { boxSize: null, count: null },
      notes: 'left at reception',
    });
  });
});
