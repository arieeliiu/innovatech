'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ProfileTopbar from '../../components/ProfileTopbar';

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
      ? 'block rounded-lg border-l-4 border-[#52E0DC] bg-[#52E0DC]/10 px-3 py-2 text-sm font-semibold text-[#F5F7FA]'
      : 'block rounded-lg border-l-4 border-transparent px-3 py-2 text-sm font-medium text-[#AAB4C0] transition hover:bg-[#162233] hover:text-[#F5F7FA]';
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
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700">
        Validando permisos...
      </main>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <main className="flex min-h-screen bg-[#1F2E49] text-[#F5F7FA]">
      <aside className="w-64 border-r border-white/10 bg-[#171C22] p-6">
        <h1 className="text-xl font-bold text-[#52E0DC]">
          Innovatech Solutions
        </h1>

        <nav className="mt-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#AAB4C0]">
            Panel de Administración
          </p>

          <Link
            href="/admin"
            className={getNavItemClass(/^\/admin$/)}
          >
            Dashboard
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[#AAB4C0]">
            Gestión
          </p>

          <Link
            href="/admin/projects"
            className={getNavItemClass(/^\/admin\/projects(?:\/[0-9a-fA-F-]{36})?$/)}
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

        </nav>
      </aside>

      <section className="flex min-h-screen flex-1 flex-col overflow-hidden">
        <ProfileTopbar />

        <div className="flex-1 px-6 py-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1450px]">{children}</div>
        </div>
      </section>
    </main>
  );
}