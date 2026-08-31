'use client';

import Link from 'next/link';
import { todayIso } from '@logistic/core';
import { Icon, Spinner } from '@/components/ui';
import { useDays } from '@/features/runsheet/useRunsheet';

export const dynamic = 'force-dynamic';

export default function DaysPage() {
  const days = useDays();
  const today = todayIso();

  return (
    <div className="flex flex-col gap-stack-gap pt-4">
      <h2 className="text-headline-md text-primary">View by Days</h2>

      {days.isPending ? (
        <Spinner label="Loading days…" />
      ) : days.isError ? (
        <p className="rounded-xl bg-error-container p-4 text-body-md text-on-error-container">
          Couldn’t load the days.{' '}
          <button className="font-bold underline" onClick={() => days.refetch()}>
            Retry
          </button>
        </p>
      ) : days.data.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-outline-variant p-8 text-center text-body-md text-on-surface-variant">
          No day tabs found in this month’s spreadsheet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {days.data.map((d) => (
            <li key={d.tab}>
              <Link
                href={`/manifest?date=${d.date}`}
                className="flex items-center justify-between rounded-xl border-2 border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition active:scale-[0.99]"
              >
                <span className="flex items-center gap-3">
                  <Icon name="calendar_today" className="text-secondary" />
                  <span className="font-bold text-primary">{d.label}</span>
                  {d.date === today ? (
                    <span className="rounded-full bg-secondary-fixed px-2 py-0.5 text-label-lg text-on-secondary-fixed">
                      Today
                    </span>
                  ) : null}
                </span>
                <Icon name="arrow_forward_ios" className="text-sm text-outline" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
