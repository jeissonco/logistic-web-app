import { normalizeJob } from '@logistic/core';
import { cn } from '@/components/ui';

/**
 * Colours + wording copied from the JOB column's dropdown chips in the Google Sheet,
 * so drivers see the same tag they'd see in the spreadsheet.
 */
const STYLES: Record<string, { className: string; text: string }> = {
  BS: { className: 'bg-[#f86308] text-black', text: 'BS' },
  CO: { className: 'bg-[#fce908] text-black', text: 'COLLECTION' },
  DO: { className: 'bg-[#a46afa] text-black', text: 'DROP OFF' },
  BMB: { className: 'bg-[#0a53a8] text-[#bfe1f6]', text: 'BMB' },
};

export function JobBadge({ code, className }: { code: string; className?: string }) {
  const { code: short, label } = normalizeJob(code);
  const style = STYLES[short];
  return (
    <span
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3 py-1 text-label-lg font-bold uppercase',
        style?.className ?? 'bg-surface-container-highest text-on-surface',
        className,
      )}
    >
      {style?.text ?? (short || '—')}
    </span>
  );
}
