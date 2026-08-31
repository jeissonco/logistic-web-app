'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '@/features/auth/SessionProvider';
import { api } from '@/lib/api-client';
import { Button, Card, Icon } from '@/components/ui';

export default function ProfilePage() {
  const session = useSession();
  const router = useRouter();

  async function logout() {
    await api.logout().catch(() => undefined);
    router.replace('/login');
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-stack-gap pt-4">
      <h2 className="text-headline-md text-primary">Profile</h2>

      <Card>
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-secondary-container text-headline-sm text-on-secondary">
            {session.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-headline-sm text-primary">{session.name}</p>
            <p className="text-body-md text-on-surface-variant">{session.driverId}</p>
          </div>
        </div>
      </Card>

      <Button variant="danger" block onClick={logout}>
        <Icon name="logout" className="text-lg" />
        Sign out
      </Button>
    </div>
  );
}
