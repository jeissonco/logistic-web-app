'use client';

import { forwardRef } from 'react';
import { cn } from './cn';

export { cn } from './cn';
export { Icon } from './Icon';
export { Stepper } from './Stepper';

/** Presentational primitives styled to the Stitch design system. */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  block?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', block, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex min-h-touch-target-min items-center justify-center gap-2 rounded-xl px-5 text-label-lg font-bold uppercase tracking-wide transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' && 'bg-secondary text-on-secondary hover:brightness-110',
        variant === 'ghost' &&
          'bg-surface-container-high text-primary hover:bg-surface-container-highest',
        variant === 'danger' && 'bg-error text-on-error hover:brightness-110',
        block && 'w-full',
        className,
      )}
      {...props}
    />
  );
});

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'min-h-touch-target-min w-full rounded-lg border-2 border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none focus:border-secondary',
          className,
        )}
        {...props}
      />
    );
  },
);

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'min-h-touch-target-min w-full rounded-lg border-2 border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none focus:border-secondary',
        className,
      )}
      {...props}
    />
  );
});

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border-2 border-outline-variant bg-surface-container-lowest p-card-padding shadow-lg',
        className,
      )}
      {...props}
    />
  );
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 p-6 text-body-md text-on-surface-variant">
      <span className="size-4 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
      {label}
    </div>
  );
}
