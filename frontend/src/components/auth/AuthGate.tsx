'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  clearStoredSession,
  getRoleFromToken,
  getStoredToken,
  isTokenUsable,
} from '../../lib/auth';
import type { AppRole } from '../../lib/permissions';

type AuthGateProps = {
  children: ReactNode;
  allowedRoles?: readonly Exclude<AppRole, null>[];
  unauthorizedRedirect?: string;
};

export function AuthGate({
  children,
  allowedRoles,
  unauthorizedRedirect = '/projects',
}: AuthGateProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(() => {
      const token = getStoredToken();

      if (!isTokenUsable(token)) {
        clearStoredSession();
        router.replace('/');
        return;
      }

      const role = getRoleFromToken(token);

      if (!role) {
        clearStoredSession();
        router.replace('/');
        return;
      }

      if (allowedRoles && !allowedRoles.includes(role)) {
        router.replace(unauthorizedRedirect);
        return;
      }

      setIsAuthorized(true);
    });
  }, [allowedRoles, router, unauthorizedRedirect]);

  if (!isAuthorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-app text-content-muted">
        Validando sesión...
      </main>
    );
  }

  return children;
}
