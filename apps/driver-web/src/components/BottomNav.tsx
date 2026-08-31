'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, cn } from '@/components/ui';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  disabled?: boolean;
}

const ITEMS: NavItem[] = [
  { href: '/route', label: 'Route', icon: 'alt_route' },
  { href: '/manifest', label: 'Manifest', icon: 'assignment' },
  { href: '/mapping', label: 'Mapping', icon: 'map' },
  { href: '/profile', label: 'Profile', icon: 'person' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex h-20 w-full max-w-2xl -translate-x-1/2 items-stretch gap-1 rounded-t-xl border-t-2 border-outline-variant bg-surface px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.disabled ? '#' : item.href}
            aria-disabled={item.disabled}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'my-2 flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg transition active:scale-95',
              active
                ? 'border-b-4 border-primary bg-secondary-container text-on-secondary'
                : 'text-on-surface-variant',
              item.disabled && 'pointer-events-none opacity-40',
            )}
          >
            <Icon name={item.icon} className="text-2xl" />
            <span className="text-[11px] font-bold tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
