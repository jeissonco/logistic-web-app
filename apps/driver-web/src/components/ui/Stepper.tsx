'use client';

import { Icon } from './Icon';

/** − / value / + quantity control from the stop-detail design. */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 9999,
  'aria-label': ariaLabel,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  'aria-label'?: string;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border-2 border-outline-variant">
      <button
        type="button"
        aria-label={ariaLabel ? `Decrease ${ariaLabel}` : 'Decrease'}
        onClick={() => onChange(clamp(value - 1))}
        className="grid w-12 place-items-center bg-surface-container-high text-primary active:scale-95 disabled:opacity-40"
        disabled={value <= min}
      >
        <Icon name="remove" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={ariaLabel}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(Number.parseInt(e.target.value, 10) || 0))}
        className="w-16 border-x-2 border-outline-variant bg-surface-container-lowest text-center text-body-lg font-bold text-primary outline-none"
      />
      <button
        type="button"
        aria-label={ariaLabel ? `Increase ${ariaLabel}` : 'Increase'}
        onClick={() => onChange(clamp(value + 1))}
        className="grid w-12 place-items-center bg-surface-container-high text-primary active:scale-95 disabled:opacity-40"
        disabled={value >= max}
      >
        <Icon name="add" />
      </button>
    </div>
  );
}
