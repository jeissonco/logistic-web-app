import { cn } from './cn';

/** Material Symbols Outlined glyph. Font is loaded via <link> in the root layout. */
export function Icon({
  name,
  className,
  filled,
  ...props
}: { name: string; filled?: boolean } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      translate="no"
      className={cn('material-symbols-outlined', className)}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      {...props}
    >
      {name}
    </span>
  );
}
