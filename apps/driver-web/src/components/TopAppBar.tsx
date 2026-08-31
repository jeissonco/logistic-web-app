'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/features/auth/SessionProvider';
import { api } from '@/lib/api-client';
import { Icon } from '@/components/ui';

function titleFor(pathname: string): string {
  if (pathname.startsWith('/manifest')) return 'MANIFEST';
  if (pathname.startsWith('/directory')) return 'DIRECTORY';
  if (pathname.startsWith('/mapping')) return 'MAPPING';
  if (pathname.startsWith('/profile')) return 'PROFILE';
  if (pathname.startsWith('/days')) return 'DAYS';
  return 'DELIVERY OPS';
}

const MENU = [
  { href: '/route', label: 'Route', icon: 'alt_route' },
  { href: '/manifest', label: 'Manifest', icon: 'assignment' },
  { href: '/profile', label: 'Profile', icon: 'person' },
];

export function TopAppBar() {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function logout() {
    await api.logout().catch(() => undefined);
    router.replace('/login');
    router.refresh();
  }

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full max-w-2xl items-center justify-between border-b-2 border-outline-variant bg-surface px-4 shadow-md">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          className="rounded-lg p-2 transition active:scale-95 hover:bg-surface-container-highest"
        >
          <Icon name="menu" className="text-primary" />
        </button>
        <h1 className="text-headline-sm font-black tracking-tight text-primary">{titleFor(pathname)}</h1>
      </div>
      <Icon name="signal_cellular_alt" className="text-primary" />

      {open ? (
        <>
          <button
            aria-label="Close menu"
            className="fixed inset-0 z-40 cursor-default bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-4 top-16 z-50 mt-1 w-56 overflow-hidden rounded-xl border-2 border-outline-variant bg-surface-container-lowest shadow-lg">
            <p className="px-4 py-3 text-label-lg uppercase tracking-wide text-on-surface-variant">
              {session.name}
            </p>
            {MENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 border-t-2 border-outline-variant px-4 py-3 text-body-md text-primary hover:bg-surface-container-high"
              >
                <Icon name={item.icon} className="text-xl text-secondary" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 border-t-2 border-outline-variant px-4 py-3 text-left text-body-md text-error hover:bg-surface-container-high"
            >
              <Icon name="logout" className="text-xl" />
              Sign out
            </button>
          </div>
        </>
      ) : null}
    </header>
  );
}
