import { describe, expect, it } from 'vitest';
import { driversForPicker, hashPin, parseDriverRoster, verifyPin } from '../src/auth/pin';

const roster = parseDriverRoster([
  { driverId: 'drv_alex', name: 'Alex Rivera', pinHash: hashPin('1234', 4), active: true },
  { driverId: 'drv_sam', name: 'Sam Lee', pinHash: hashPin('0000', 4), active: false },
]);

describe('pin auth', () => {
  it('picker lists only active drivers, without hashes', () => {
    expect(driversForPicker(roster)).toEqual([{ driverId: 'drv_alex', name: 'Alex Rivera' }]);
  });

  it('verifies a correct PIN', async () => {
    expect(await verifyPin(roster, 'drv_alex', '1234')).toEqual({
      driverId: 'drv_alex',
      name: 'Alex Rivera',
    });
  });

  it('rejects wrong PIN, inactive driver, and unknown driver alike', async () => {
    expect(await verifyPin(roster, 'drv_alex', '9999')).toBeNull();
    expect(await verifyPin(roster, 'drv_sam', '0000')).toBeNull();
    expect(await verifyPin(roster, 'drv_ghost', '1234')).toBeNull();
  });

  it('rejects a malformed roster', () => {
    expect(() => parseDriverRoster([{ driverId: 'x' }])).toThrow();
  });
});
