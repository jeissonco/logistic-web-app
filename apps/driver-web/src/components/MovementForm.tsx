'use client';

import { useState } from 'react';
import { BOX_SIZE_LABELS, SELECTABLE_BOX_SIZES, type BoxSize, type Stop } from '@logistic/core';
import type { RecordMovementsBody } from '@/lib/api-client';
import { Button, Select, Stepper, Icon } from '@/components/ui';

interface Leg {
  boxSize: BoxSize;
  count: number;
}

const defaultSize = (planned: BoxSize | null): BoxSize =>
  planned && SELECTABLE_BOX_SIZES.includes(planned) ? planned : SELECTABLE_BOX_SIZES[0]!;

export function MovementForm({
  stop,
  pending,
  onSubmit,
}: {
  stop: Stop;
  pending: boolean;
  onSubmit: (body: RecordMovementsBody) => void;
}) {
  const [dropped, setDropped] = useState<Leg>({ boxSize: defaultSize(stop.planned.boxSize), count: 0 });
  const [pickedUp, setPickedUp] = useState<Leg>({ boxSize: defaultSize(stop.planned.boxSize), count: 0 });
  const [notes, setNotes] = useState(stop.notes);
  const [error, setError] = useState<string | null>(null);

  const notesChanged = notes.trim() !== stop.notes.trim();

  function submit() {
    if (dropped.count <= 0 && pickedUp.count <= 0 && !notesChanged) {
      setError('Enter a drop-off, a pick-up, or a note.');
      return;
    }
    setError(null);
    onSubmit({
      dropped: dropped.count > 0 ? dropped : null,
      pickedUp: pickedUp.count > 0 ? pickedUp : null,
      notes: notesChanged ? notes.trim() : undefined,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <MovementLeg title="Drop off" icon="arrow_downward" value={dropped} onChange={setDropped} />
      <MovementLeg title="Pick up" icon="arrow_upward" value={pickedUp} onChange={setPickedUp} />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-on-surface-variant">Notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything the office should know…"
          className="w-full rounded-lg border-2 border-outline-variant bg-surface-container-lowest p-3 text-body-md text-on-surface outline-none focus:border-secondary"
        />
      </label>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <Button block disabled={pending} onClick={submit}>
        <Icon name="check_circle" className="text-lg" />
        {pending ? 'Saving…' : 'Confirm and save'}
      </Button>
    </div>
  );
}

function MovementLeg({
  title,
  icon,
  value,
  onChange,
}: {
  title: string;
  icon: string;
  value: Leg;
  onChange: (next: Leg) => void;
}) {
  return (
    <section className="rounded-xl border-2 border-outline-variant p-4">
      <p className="mb-3 flex items-center gap-2 text-label-lg uppercase tracking-wide text-on-surface-variant">
        <Icon name={icon} className="text-lg" />
        {title}
      </p>
      <label className="mb-3 flex flex-col gap-1 text-sm">
        <span className="font-medium text-on-surface-variant">Box / bin type</span>
        <Select
          aria-label={`${title} box / bin type`}
          value={value.boxSize}
          onChange={(e) => onChange({ ...value, boxSize: e.target.value as BoxSize })}
        >
          {SELECTABLE_BOX_SIZES.map((opt) => (
            <option key={opt} value={opt}>
              {BOX_SIZE_LABELS[opt]}
            </option>
          ))}
        </Select>
      </label>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-on-surface-variant">Quantity</span>
        <Stepper
          aria-label={`${title} quantity`}
          value={value.count}
          onChange={(count) => onChange({ ...value, count })}
        />
      </div>
    </section>
  );
}
