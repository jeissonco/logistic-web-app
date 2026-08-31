'use client';

import Link from 'next/link';
import { runsheetProgress } from '@logistic/core';
import { ManifestList } from '@/components/ManifestList';
import { Spinner } from '@/components/ui';
import { useRunsheet } from '@/features/runsheet/useRunsheet';
import { useDateParam } from '@/features/runsheet/useDateParam';
import { ApiError } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export default function ManifestPage() {
  const date = useDateParam();
  const runsheet = useRunsheet(date);
  const noRunsheet = runsheet.error instanceof ApiError && runsheet.error.code === 'NO_RUNSHEET';
  const progress = runsheet.data
    ? runsheetProgress(runsheet.data.runsheet.items)
    : { total: 0, done: 0, remaining: 0 };

  return (
    <div className="flex flex-col gap-stack-gap pt-4">
      {runsheet.data ? (
        <p className="text-label-lg uppercase tracking-widest text-on-surface-variant">
          {runsheet.data.day.label}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total jobs" value={progress.total} />
        <StatCard label="Completed" value={progress.done} accent />
      </div>

      {runsheet.isPending ? (
        <Spinner label="Loading manifest…" />
      ) : noRunsheet ? (
        <EmptyDay message={(runsheet.error as ApiError).message} />
      ) : runsheet.isError ? (
        <p className="rounded-xl bg-error-container p-4 text-body-md text-on-error-container">
          Couldn’t load the manifest.{' '}
          <button className="font-bold underline" onClick={() => runsheet.refetch()}>
            Retry
          </button>
        </p>
      ) : (
        <ManifestList items={runsheet.data.runsheet.items} date={date} />
      )}
    </div>
  );
}

function EmptyDay({ message }: { message: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-outline-variant p-8 text-center">
      <p className="text-body-md text-on-surface-variant">{message}</p>
      <Link href="/days" className="mt-2 inline-block font-bold text-secondary underline">
        Pick another day
      </Link>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border-2 border-outline-variant bg-surface-container-lowest p-card-padding shadow-lg">
      <p className="text-label-lg uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className={`mt-1 text-headline-lg ${accent ? 'text-secondary' : 'text-primary'}`}>
        {String(value).padStart(2, '0')}
      </p>
    </div>
  );
}
