import { NextResponse } from 'next/server';
import { driversForPicker } from '@logistic/core/server';
import { getServices } from '@/server/services';
import { jsonError } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ drivers: driversForPicker(getServices().roster) });
  } catch (err) {
    console.error('GET /api/drivers', err);
    return jsonError(502, 'Could not load drivers.');
  }
}
