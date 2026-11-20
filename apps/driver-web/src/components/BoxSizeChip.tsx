import type { BoxSize } from '@logistic/core';
import { cn } from '@/components/ui';

/** Google Sheets dropdown chip colours used for BOX SIZE / DROPPED / PICKED UP. */
const STYLES: Record<BoxSize, string> = {
  Small: 'bg-[#ffcfc9] text-[#b10202]',
  Big: 'bg-[#ffc8aa] text-[#753800]',
  '100L': 'bg-[#d4edbc] text-[#11734b]',
  Corporate: 'bg-[#bfe1f6] text-[#0a53a8]',
  '240L': 'bg-[#e6cff2] text-[#5a3286]',
  '240L Locked': 'bg-[#5a3286] text-[#e6cff2]',
  Archive: 'bg-[#ffe5a0] text-[#473821]',
  Collection: 'bg-[#3d3d3d] text-white',
};

export function BoxSizeChip({
  size,
  count,
  className,
}: {
  size: BoxSize;
  count?: number | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-body-md font-medium',
        STYLES[size],
        className,
      )}
    >
      {count != null ? `${count} × ${size}` : size}
    </span>
  );
}
