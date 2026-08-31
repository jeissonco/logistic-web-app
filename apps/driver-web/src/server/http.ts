import 'server-only';
import { NextResponse } from 'next/server';
import type { Session } from '@logistic/core';
import { getSession } from '@/lib/session';

export { isE2EStub } from './flags';

/** JSON error body shared by every route. */
export function jsonError(status: number, error: string, code?: string) {
  return NextResponse.json(code ? { error, code } : { error }, { status });
}

/**
 * Resolve the session or return a 401 response. Usage:
 *   const gate = await requireSession();
 *   if (gate instanceof NextResponse) return gate;
 *   // gate.session is typed
 */
export async function requireSession(): Promise<NextResponse | { session: Session }> {
  const session = await getSession();
  if (!session) return jsonError(401, 'Not signed in.', 'NO_SESSION');
  return { session };
}
