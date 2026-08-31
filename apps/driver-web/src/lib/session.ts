import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { sessionSchema, type Session } from '@logistic/core';
import { getEnv } from './env';

const COOKIE = 'driver_session';

function secret(): Uint8Array {
  return new TextEncoder().encode(getEnv().SESSION_SECRET);
}

/** Read and verify the current session, or `null` if absent/invalid/expired. */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const parsed = sessionSchema.safeParse(payload);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Issue a session cookie for a verified driver. */
export async function setSession(session: Session): Promise<void> {
  const ttlHours = getEnv().SESSION_TTL_HOURS;
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ttlHours}h`)
    .sign(secret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ttlHours * 60 * 60,
  });
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
