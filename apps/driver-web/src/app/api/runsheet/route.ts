import { NextResponse } from 'next/server';
import { getServices } from '@/server/services';
import { jsonError, requireSession } from '@/server/http';
import { resolveRunsheetTarget } from '@/server/runsheet-target';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const gate = await requireSession();
  if (gate instanceof NextResponse) return gate;

  const target = await resolveRunsheetTarget(new URL(req.url).searchParams.get('date'));
  if (target instanceof NextResponse) return target;

  try {
    const runsheet = await getServices().runsheetFor(target.tab).getRunsheet();
    return NextResponse.json({ runsheet, day: { date: target.date, label: target.label } });
  } catch (err) {
    console.error('GET /api/runsheet', err);
    return jsonError(502, 'Could not load the runsheet.');
  }
}
