'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ProfileTopbar from '../../components/ProfileTopbar';
import ThemeLogo from '../../components/ThemeLogo';

function getUserRoleFromToken() {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');

  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    return payload.user_metadata?.role || payload.role || payload.user?.role || null;
  } catch {
    return null;
  }
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  function getNavItemClass(matcher: RegExp) {
    const isActive = matcher.test(pathname);

    return isActive
      ? 'block rounded-lg border-l-4 border-nav-active-border bg-nav-active px-3 py-2 text-sm font-semibold text-nav-active-foreground'
      : 'block rounded-lg border-l-4 border-transparent px-3 py-2 text-sm font-medium text-content-muted transition hover:bg-nav-hover hover:text-content-strong';
  }

  useEffect(() => {
    const role = getUserRoleFromToken();

    if (role?.toLowerCase() !== 'admin') {
      router.push('/projects');
      return;
    }

    setIsAuthorized(true);
    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-app text-content-muted">
        Validando permisos...
      </main>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <main className="flex min-h-screen bg-app text-content">
      <aside className="theme-sidebar-surface w-64 shrink-0 border-r border-theme-border p-6">
        <Link href="/admin" className="block">
          <ThemeLogo className="w-[190px]" />
        </Link>

        <nav className="mt-8 space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-content-strong">
              Panel de administración
            </p>

            <Link href="/admin" className={getNavItemClass(/^\/admin$/)}>
              Dashboard
            </Link>

            <Link
              href="/admin/users/create"
              className={getNavItemClass(/^\/admin\/users\/create$/)}
            >
              Registrar usuario
            </Link>

            <Link
              href="/admin/users"
              className={getNavItemClass(/^\/admin\/users$/)}
            >
              Usuarios registrados
            </Link>
          </div>

          <div className="space-y-2 border-t border-theme-border pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-content-strong">
              Gestión de proyectos
            </p>

            <Link
              href="/admin/projects"
              className={getNavItemClass(
                /^\/admin\/projects(?:\/[0-9a-fA-F-]{36})?$/,
              )}
            >
              Proyectos
            </Link>

            <Link
              href="/admin/projects/create"
              className={getNavItemClass(/^\/admin\/projects\/create$/)}
            >
              Crear proyecto
            </Link>

            <Link
              href="/admin/tasks"
              className={getNavItemClass(/^\/admin\/tasks$/)}
            >
              Tareas
            </Link>
          </div>

          <div className="space-y-2 border-t border-theme-border pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-content-strong">
              Gestión de recursos
            </p>

            <Link
              href="/admin/resources"
              className={getNavItemClass(/^\/admin\/resources$/)}
            >
              Recursos
            </Link>
          </div>

          <div className="space-y-2 border-t border-theme-border pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-content-strong">
              Monitoreo
            </p>

            <Link
              href="/admin/analytics"
              className={getNavItemClass(/^\/admin\/analytics$/)}
            >
              Analítica
            </Link>
          </div>
        </nav>
      </aside>

      <section className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <ProfileTopbar />

        <div className="flex-1 px-6 py-7 lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-[1450px]">{children}</div>
        </div>
      </section>
    </main>
  );
}
