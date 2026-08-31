import bcrypt from 'bcryptjs';
import {
  driverRecordSchema,
  type DriverRecord,
  type PublicDriver,
  type Session,
} from '../schemas/index';

/** Parse+validate the driver roster the host app loads from config. */
export function parseDriverRoster(input: unknown): DriverRecord[] {
  return driverRecordSchema.array().parse(input);
}

/** Active drivers reduced to what the login picker needs (no hashes). */
export function driversForPicker(drivers: DriverRecord[]): PublicDriver[] {
  return drivers.filter((d) => d.active).map(({ driverId, name }) => ({ driverId, name }));
}

/**
 * Verify a PIN against the roster. Returns the session payload on success, `null`
 * on any failure (unknown driver, inactive, wrong PIN) — callers must not
 * distinguish between these.
 */
export async function verifyPin(
  drivers: DriverRecord[],
  driverId: string,
  pin: string,
): Promise<Session | null> {
  const driver = drivers.find((d) => d.driverId === driverId && d.active);
  if (!driver) return null;
  const ok = await bcrypt.compare(pin, driver.pinHash);
  return ok ? { driverId: driver.driverId, name: driver.name } : null;
}

/** Helper for seeding config / tests. */
export function hashPin(pin: string, rounds = 10): string {
  return bcrypt.hashSync(pin, rounds);
}
