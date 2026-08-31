import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { SessionProvider } from '@/features/auth/SessionProvider';
import { TopAppBar } from '@/components/TopAppBar';
import { BottomNav } from '@/components/BottomNav';

export const dynamic = 'force-dynamic';

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <SessionProvider session={session}>
      <TopAppBar />
      <main className="flex-1 px-margin-mobile pb-28 pt-20">{children}</main>
      <BottomNav />
    </SessionProvider>
  );
}
