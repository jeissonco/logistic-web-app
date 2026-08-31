import { z } from 'zod';

/** ISO date, no time: `YYYY-MM-DD`. */
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

/**
 * Box / bin sizes that appear in the runsheet (BOX SIZE, DROPPED, PICKED UP).
 * Values are the literal spreadsheet strings so writes pass its data validation.
 * `240L Locked` and `Archive box` exist in historical rows but drivers can't pick
 * them yet — see `SELECTABLE_BOX_SIZES` in domain/stop.ts.
 */
export const boxSizeSchema = z.enum([
  'Small',
  'Big',
  '100L',
  'Corporate',
  '240L',
  '240L Locked',
  'Archive box',
]);
export type BoxSize = z.infer<typeof boxSizeSchema>;

/** A quantity of one box size, either planned or actually moved. */
export const movementSchema = z.object({
  boxSize: boxSizeSchema.nullable(),
  count: z.number().int().min(0).max(9999).nullable(),
});
export type Movement = z.infer<typeof movementSchema>;

export const emptyMovement: Movement = { boxSize: null, count: null };

/** One actionable row on the runsheet (columns A–Q of the sheet). */
export const stopSchema = z.object({
  /** Column Q — stamped by the app on first read, then the key for every write. */
  stopId: z.string().min(1),
  /** 1-based sheet row. Used only to build write ranges; not a stable key. */
  rowNumber: z.number().int().positive(),
  invoiced: z.boolean(), // A
  job: z.string(), // B
  requestDate: z.string(), // C — raw text: "Monthly" or "24-Aug-2026"
  info: z.string(), // D — NOTES/INFO
  business: z.string(), // E
  unit: z.string(), // F
  location: z.string(), // G
  suburb: z.string(), // H
  contact: z.string(), // I
  planned: movementSchema, // J (BOX SIZE) + K (QUANT)
  dropped: movementSchema, // L + M
  pickedUp: movementSchema, // N + O
  notes: z.string(), // P
});
export type Stop = z.infer<typeof stopSchema>;

/** A non-actionable section header in the runsheet ("MORNING TEA", "LUNCH", …). */
export const dividerSchema = z.object({
  rowNumber: z.number().int().positive(),
  label: z.string(),
});
export type Divider = z.infer<typeof dividerSchema>;

/** The runsheet as an ordered list of stops and dividers. */
export const runsheetItemSchema = z.discriminatedUnion('kind', [
  stopSchema.extend({ kind: z.literal('stop') }),
  dividerSchema.extend({ kind: z.literal('divider') }),
]);
export type RunsheetItem = z.infer<typeof runsheetItemSchema>;

export const runsheetSchema = z.object({
  tab: z.string(),
  generatedAt: z.string().datetime(),
  items: z.array(runsheetItemSchema),
});
export type Runsheet = z.infer<typeof runsheetSchema>;

/** What the driver submits for a stop. At least one field must be present. */
export const recordMovementsInputSchema = z
  .object({
    stopId: z.string().min(1),
    dropped: movementSchema.nullish(),
    pickedUp: movementSchema.nullish(),
    /** Driver note — written to column P (replaces the cell). */
    notes: z.string().max(2000).optional(),
  })
  .refine((v) => v.dropped != null || v.pickedUp != null || v.notes != null, {
    message: 'Provide a drop, a pick-up, or a note.',
  });
export type RecordMovementsInput = z.infer<typeof recordMovementsInputSchema>;

/** Session payload stored in the signed cookie. */
export const sessionSchema = z.object({
  driverId: z.string().min(1),
  name: z.string().min(1),
});
export type Session = z.infer<typeof sessionSchema>;

/** A driver record supplied by the host app (from env config, not the sheet). */
export const driverRecordSchema = z.object({
  driverId: z.string().min(1),
  name: z.string().min(1),
  pinHash: z.string().min(1),
  active: z.boolean().default(true),
});
export type DriverRecord = z.infer<typeof driverRecordSchema>;

export const publicDriverSchema = driverRecordSchema.pick({ driverId: true, name: true });
export type PublicDriver = z.infer<typeof publicDriverSchema>;
