import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email(),
  GOOGLE_PRIVATE_KEY: z.string().min(1),
  SHEET_ID: z.string().min(1),
  /**
   * Optional. When set, the app always reads this one tab instead of resolving a
   * per-day tab (`Mon 17/08` …) from the spreadsheet. Used for single-tab setups
   * and the E2E fixture.
   */
  RUNSHEET_TAB: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(16, 'SESSION_SECRET must be at least 16 chars'),
  SESSION_TTL_HOURS: z.coerce.number().positive().default(12),
  /** JSON array of { driverId, name, pinHash, active } — the login roster. */
  DRIVERS_JSON: z.string().min(2).default('[]'),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/** Validated server environment. Throws once, loudly, on first access if misconfigured. */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
    throw new Error(`Invalid server environment:\n${issues.join('\n')}`);
  }
  cached = {
    ...parsed.data,
    // Support single-line keys with escaped newlines from .env / CI secrets.
    GOOGLE_PRIVATE_KEY: parsed.data.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
  return cached;
}
