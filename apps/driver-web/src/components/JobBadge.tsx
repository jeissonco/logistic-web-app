import { normalizeJob } from '@logistic/core';
import { cn } from '@/components/ui';

/** Colour per normalized JOB code (see docs/sheet-schema.md). */
const STYLES: Record<string, string> = {
  BS: 'bg-[#e8710a] text-white', // Box Swap — orange
  DO: 'bg-[#6d28d9] text-white', // Drop Off — purple
  CO: 'bg-[#f5c000] text-[#3a2e00]', // Collection — yellow
};

export function JobBadge({ code, className }: { code: string; className?: string }) {
  const { code: short, label } = normalizeJob(code);
  return (
    <span
      title={label}
      className={cn(
        'inline-flex items-center rounded px-2 py-1 text-label-lg font-black uppercase tracking-wide',
        STYLES[short] ?? 'bg-outline text-white',
        className,
      )}
    >
      {short || '—'}
    </span>
  );
}
