/** Join truthy class strings. Tiny — no clsx dependency needed yet. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
