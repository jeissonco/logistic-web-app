'use client';

import Link from 'next/link';
import { runsheetProgress } from '@logistic/core';
import { Icon } from '@/components/ui';
import { ApiError } from '@/lib/api-client';
import { useRunsheet } from '@/features/runsheet/useRunsheet';

export default function RoutePage() {
  const runsheet = useRunsheet();
  const noRunsheet = runsheet.error instanceof ApiError && runsheet.error.code === 'NO_RUNSHEET';
  const progress = runsheet.data
    ? runsheetProgress(runsheet.data.runsheet.items)
    : { total: 0, done: 0, remaining: 0 };

  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const date = now
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .toUpperCase();

  return (
    <div className="flex flex-col gap-stack-gap">
      <section className="pt-4">
        <p className="mb-1 text-label-lg uppercase tracking-widest text-on-surface-variant">{day}</p>
        <h2 className="text-headline-lg-mobile tracking-tight text-primary">{date}</h2>
      </section>

      <Link
        href="/manifest"
        className="cta-shadow flex h-24 items-center justify-between rounded-xl bg-safety-green px-card-padding transition active:scale-[0.98] hover:brightness-110"
      >
        <span className="text-left">
          <span className="block text-headline-md leading-none text-on-safety-green">START ROUTE</span>
          <span className="text-label-lg text-on-safety-green/90">Assign vehicle &amp; begin shift</span>
        </span>
        <Icon name="local_shipping" className="text-5xl text-on-safety-green" />
      </Link>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/manifest"
          className="col-span-2 rounded-xl border-2 border-transparent bg-surface-container-lowest p-card-padding shadow-lg transition-colors hover:border-secondary"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-headline-sm text-primary">Today’s Overview</h3>
              <p className="text-body-md text-on-surface-variant">
                {noRunsheet ? 'No runsheet for today' : 'Active Delivery Loop'}
              </p>
            </div>
            <span className="rounded-full bg-secondary-fixed px-3 py-1 text-label-lg text-on-secondary-fixed">
              {runsheet.isPending ? '…' : noRunsheet ? 'OFF' : 'LIVE'}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Stat value={runsheet.data ? progress.total : null} label="Total jobs" />
            <div className="h-10 w-px bg-outline-variant" />
            <Stat value={runsheet.data ? progress.remaining : null} label="Remaining" accent />
          </div>
        </Link>

        <Link
          href="/days"
          className="flex aspect-square flex-col justify-between rounded-xl bg-surface-container-lowest p-card-padding shadow-lg transition-colors hover:border-secondary"
        >
          <CalendarGlyph />
          <div>
            <h3 className="text-label-lg text-primary">View by Days</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Pick a day</p>
          </div>
        </Link>

        <Link
          href="/directory"
          className="flex aspect-square flex-col rounded-xl bg-surface-container-lowest p-card-padding shadow-lg transition-colors hover:border-secondary"
        >
          <div className="flex flex-1 items-center justify-center">
            <Icon name="contact_page" className="text-[64px] text-secondary" />
          </div>
          <div>
            <h3 className="text-label-lg text-primary">Directory</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Office contacts</p>
          </div>
        </Link>

        <a
          href="tel:0412685846"
          className="col-span-2 flex items-center gap-4 rounded-xl bg-primary-container p-card-padding shadow-lg transition active:scale-95"
        >
          <span className="rounded-full bg-secondary p-3">
            <Icon name="phone_in_talk" className="text-3xl text-white" />
          </span>
          <span>
            <span className="block text-headline-sm text-on-primary">Call Office</span>
            <span className="text-label-lg text-on-primary-container">Dispatch &amp; Emergency Support</span>
          </span>
          <Icon name="arrow_forward_ios" className="ml-auto text-on-primary-container" />
        </a>
      </div>

      {runsheet.isError && !noRunsheet ? (
        <p className="rounded-xl bg-error-container p-4 text-body-md text-on-error-container">
          Couldn’t load the runsheet.{' '}
          <button className="font-bold underline" onClick={() => runsheet.refetch()}>
            Retry
          </button>
        </p>
      ) : null}
    </div>
  );
}

/** iOS-style calendar glyph showing today's month + day. */
function CalendarGlyph() {
  const now = new Date();
  const month = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = now.getDate();
  return (
    <div className="w-16 overflow-hidden rounded-lg border border-outline-variant shadow-sm">
      <div className="bg-[#e8710a] py-0.5 text-center text-[11px] font-black tracking-wide text-white">
        {month}
      </div>
      <div className="bg-surface-container-lowest py-1 text-center text-3xl font-black leading-none text-primary">
        {day}
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: number | null;
  label: string;
  accent?: boolean;
}) {
  return (
    <span className="flex flex-col">
      <span className={`text-4xl font-black ${accent ? 'text-secondary' : 'text-primary'}`}>
        {value == null ? '—' : String(value).padStart(2, '0')}
      </span>
      <span className="text-label-lg uppercase tracking-wide text-on-surface-variant">{label}</span>
    </span>
  );
}
