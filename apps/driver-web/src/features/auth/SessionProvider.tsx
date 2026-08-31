'use client';

import { createContext, useContext } from 'react';
import type { Session } from '@logistic/core';

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

/** The signed-in driver. Guaranteed non-null inside the `(app)` route group. */
export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession used outside the authenticated area');
  return session;
}
