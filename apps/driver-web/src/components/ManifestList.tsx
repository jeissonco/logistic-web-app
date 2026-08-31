'use client';

import Link from 'next/link';
import { groupBySection, isStopDone, movementSummary, type RunsheetItem, type Stop } from '@logistic/core';
import { Icon, cn } from '@/components/ui';
import { JobBadge } from '@/components/JobBadge';

export function ManifestList({ items, date }: { items: RunsheetItem[]; date?: string }) {
  const sections = groupBySection(items);
  const q = date ? `?date=${date}` : '';

  // The first not-done stop is the "active" one (gets the START JOB affordance).
  const activeId = items.find(
    (i): i is Extract<RunsheetItem, { kind: 'stop' }> => i.kind === 'stop' && !isStopDone(i),
  )?.stopId;

  if (sections.length === 0) {
    return (
      <p className="rounded-xl border-2 border-dashed border-outline-variant p-8 text-center text-body-md text-on-surface-variant">
        No stops on the runsheet.
      </p>
    );
  }

  let counter = 0;
  return (
    <div className="flex flex-col gap-6">
      {sections.map((section, i) => (
        <div key={i} className="flex flex-col gap-3">
          {section.label ? (
            <h3 className="px-1 text-label-lg uppercase tracking-widest text-on-surface-variant">
              {section.label}
            </h3>
          ) : null}
          {section.stops.map((stop) => {
            counter += 1;
            return (
              <StopCardRow
                key={stop.stopId}
                stop={stop}
                index={counter}
                active={stop.stopId === activeId}
                query={q}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function StopCardRow({
  stop,
  index,
  active,
  query,
}: {
  stop: Stop;
  index: number;
  active: boolean;
  query: string;
}) {
  const done = isStopDone(stop);
  return (
    <Link
      href={`/stops/${encodeURIComponent(stop.stopId)}${query}`}
      className={cn(
        'block rounded-xl border-2 bg-surface-container-lowest p-card-padding shadow-lg transition active:scale-[0.99]',
        active ? 'border-secondary' : 'border-outline-variant',
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-label-lg font-black uppercase tracking-wide text-secondary">
          Stop #{index}
        </span>
        {stop.job ? <JobBadge code={stop.job} /> : null}
      </div>

      <h3 className="mt-1 text-headline-sm text-primary">{stop.business}</h3>
      <p className="flex items-center gap-1 text-body-md text-on-surface-variant">
        <Icon name="location_on" className="text-base" />
        {[stop.location, stop.suburb].filter(Boolean).join(', ')}
      </p>

      <div className="mt-3 flex items-center justify-between border-t-2 border-outline-variant pt-3">
        <span className="flex items-center gap-2 text-body-md font-bold text-primary">
          <Icon name="package_2" className="text-lg" />
          {done ? (
            <span className="text-safety-green">
              {[
                stop.dropped.boxSize && `↓ ${movementSummary(stop.dropped)}`,
                stop.pickedUp.boxSize && `↑ ${movementSummary(stop.pickedUp)}`,
              ]
                .filter(Boolean)
                .join('  ') || 'Done'}
            </span>
          ) : (
            <>Qty: {stop.planned.count ?? '—'}</>
          )}
        </span>

        {active ? (
          <span className="rounded-lg bg-secondary px-4 py-2 text-label-lg uppercase tracking-wide text-on-secondary">
            Start job
          </span>
        ) : done ? (
          <Icon name="check_circle" className="text-safety-green" filled />
        ) : (
          <Icon name="arrow_forward_ios" className="text-sm text-outline" />
        )}
      </div>
    </Link>
  );
}
