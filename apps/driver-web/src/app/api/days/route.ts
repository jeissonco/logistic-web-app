import { NextResponse } from 'next/server';
import { todayIso } from '@logistic/core';
import { getServices } from '@/server/services';
import { jsonError, requireSession } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const gate = await requireSession();
  if (gate instanceof NextResponse) return gate;

  try {
    const svc = getServices();
    if (svc.fixedTab) {
      return NextResponse.json({
        days: [{ tab: svc.fixedTab, date: todayIso(), label: 'Today' }],
      });
    }
    return NextResponse.json({ days: await svc.directory.listDays() });
  } catch (err) {
    console.error('GET /api/days', err);
    return jsonError(502, 'Could not list the days.');
  }
}
