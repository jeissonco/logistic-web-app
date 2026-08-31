import { StopView } from './StopView';

export const dynamic = 'force-dynamic';

export default async function StopPage({ params }: { params: Promise<{ stopId: string }> }) {
  const { stopId } = await params;
  return <StopView stopId={stopId} />;
}
