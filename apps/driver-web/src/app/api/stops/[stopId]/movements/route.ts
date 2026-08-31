import { NextResponse } from 'next/server';
import { recordMovementsInputSchema } from '@logistic/core';
import { RunsheetError } from '@logistic/core/server';
import { getServices } from '@/server/services';
import { jsonError, requireSession } from '@/server/http';
import { resolveRunsheetTarget } from '@/server/runsheet-target';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, ctx: { params: Promise<{ stopId: string }> }) {
  const gate = await requireSession();
  if (gate instanceof NextResponse) return gate;

  const url = new URL(req.url);
  const target = await resolveRunsheetTarget(url.searchParams.get('date'));
  if (target instanceof NextResponse) return target;

  const { stopId } = await ctx.params;
  const parsed = recordMovementsInputSchema.safeParse({
    ...(await req.json().catch(() => ({}))),
    stopId,
  });
  if (!parsed.success) {
    return jsonError(400, parsed.error.issues[0]?.message ?? 'Invalid submission.', 'BAD_REQUEST');
  }

  try {
    const stop = await getServices().runsheetFor(target.tab).recordMovements(parsed.data);
    return NextResponse.json({ ok: true, stop });
  } catch (err) {
    if (err instanceof RunsheetError) return jsonError(404, err.message, err.code);
    console.error('POST /api/stops/[stopId]/movements', err);
    return jsonError(502, 'Could not record that.');
  }
}
