import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPin } from '@logistic/core/server';
import { getServices } from '@/server/services';
import { setSession } from '@/lib/session';
import { jsonError } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({ driverId: z.string().min(1), pin: z.string().min(3).max(12) });

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(400, 'driverId and pin are required.', 'BAD_REQUEST');

  try {
    const session = await verifyPin(getServices().roster, parsed.data.driverId, parsed.data.pin);
    if (!session) return jsonError(401, 'Wrong driver or PIN.', 'BAD_CREDENTIALS');
    await setSession(session);
    return NextResponse.json({ session });
  } catch (err) {
    console.error('POST /api/auth/login', err);
    return jsonError(502, 'Could not sign in right now.');
  }
}
