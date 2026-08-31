'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type RunsheetItem, type Stop } from '@logistic/core';
import { MovementForm } from '@/components/MovementForm';
import { JobBadge } from '@/components/JobBadge';
import { Button, Icon, Spinner } from '@/components/ui';
import { useRunsheet } from '@/features/runsheet/useRunsheet';
import { useRecordMovements } from '@/features/runsheet/useRecordMovements';
import { useDateParam } from '@/features/runsheet/useDateParam';

export function StopView({ stopId }: { stopId: string }) {
  const date = useDateParam();
  const runsheet = useRunsheet(date);
  const router = useRouter();
  const record = useRecordMovements(stopId, date);

  const q = date ? `?date=${date}` : '';
  const stopHref = (id: string) => `/stops/${encodeURIComponent(id)}${q}`;

  if (runsheet.isPending) return <Spinner label="Loading stop…" />;

  const stops = (runsheet.data?.runsheet.items ?? []).filter(
    (i): i is Extract<RunsheetItem, { kind: 'stop' }> => i.kind === 'stop',
  );
  const index = stops.findIndex((s) => s.stopId === stopId);

  if (index === -1) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-headline-sm text-primary">Stop not found</p>
        <Link href={`/manifest${q}`} className="text-body-md font-bold text-secondary underline">
          Back to manifest
        </Link>
      </div>
    );
  }

  const stop = stops[index]!;
  const prev = stops[index - 1];
  const next = stops[index + 1];

  return (
    <div className="flex flex-col gap-stack-gap pt-2">
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="ghost"
          disabled={!prev}
          onClick={() => prev && router.push(stopHref(prev.stopId))}
        >
          <Icon name="arrow_back_ios" className="text-sm" />
          Previous
        </Button>
        <Button disabled={!next} onClick={() => next && router.push(stopHref(next.stopId))}>
          Next
          <Icon name="arrow_forward_ios" className="text-sm" />
        </Button>
      </div>

      <StopHeaderCard stop={stop} index={index} total={stops.length} />

      <section className="rounded-xl border-2 border-outline-variant bg-surface-container-lowest p-card-padding">
        <MovementForm
          stop={stop}
          pending={record.isPending}
          onSubmit={(body) =>
            record.mutate(body, {
              onSuccess: () => router.push(next ? stopHref(next.stopId) : `/manifest${q}`),
            })
          }
        />
      </section>
    </div>
  );
}

function StopHeaderCard({ stop, index, total }: { stop: Stop; index: number; total: number }) {
  const address = [stop.unit, stop.location, stop.suburb].filter(Boolean).join(', ');
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [stop.business, stop.location, stop.suburb].filter(Boolean).join(', '),
  )}`;
  const onFile = [stop.planned.count, stop.planned.boxSize].filter((v) => v != null).join(' × ');

  return (
    <div className="rounded-xl border-2 border-outline-variant bg-surface-container-lowest p-card-padding shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-headline-sm text-primary">{stop.business}</h1>
          <p className="text-body-md text-on-surface-variant">
            Stop #{index + 1} of {total}
          </p>
        </div>
        {stop.job ? <JobBadge code={stop.job} /> : null}
      </div>

      {onFile ? (
        <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-surface-container-high px-3 py-1.5 text-body-md font-bold text-primary">
          <Icon name="inventory_2" className="text-lg" />
          On file: {onFile}
        </p>
      ) : null}

      <a
        href={mapsHref}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex items-center gap-2 rounded-lg bg-surface-variant p-3 text-body-md text-primary transition active:scale-[0.99]"
      >
        <Icon name="location_on" className="text-2xl text-secondary" />
        <span className="flex-1">{address || 'Open in Maps'}</span>
        <Icon name="open_in_new" className="text-lg text-on-surface-variant" />
      </a>

      {stop.contact ? (
        <a
          href={`tel:${stop.contact}`}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-surface-container-high px-3 py-2 text-body-md text-primary"
        >
          <Icon name="call" className="text-lg" />
          {stop.contact}
        </a>
      ) : null}

      {stop.info ? (
        <div className="mt-3 rounded-lg bg-surface-container-low p-3">
          <p className="text-label-lg uppercase tracking-wide text-on-surface-variant">Office note</p>
          <p className="text-body-md text-on-surface">{stop.info}</p>
        </div>
      ) : null}
    </div>
  );
}
