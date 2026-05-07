'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ProfileTopbar from '../../components/ProfileTopbar';
import { canCreateProjects, getStoredRole } from '../../lib/auth';

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getStoredRole());
  }, []);

  const canCreateProject = canCreateProjects(role);

  function getNavItemClass(matcher: RegExp) {
    const isActive = matcher.test(pathname);

    return isActive
      ? 'block rounded-lg border-l-4 border-slate-900 bg-slate-200 px-3 py-2 text-sm font-medium text-slate-900'
      : 'block rounded-lg border-l-4 border-transparent px-3 py-2 text-sm font-normal text-slate-700 transition hover:bg-slate-100';
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900">
            Innovatech Solutions
          </h2>

          <nav className="mt-8 space-y-2">
            <Link
              href="/projects"
              className={getNavItemClass(/^\/projects(?:\/[0-9a-fA-F-]{36}(?:\/members)?)?$/)}
            >
              Proyectos
            </Link>

            {canCreateProject && (
              <Link
                href="/projects/create"
                className={getNavItemClass(/^\/projects\/create$/)}
              >
                Crear proyecto
              </Link>
            )}

            <Link
              href="/projects/tasks"
              className={getNavItemClass(/^\/projects\/tasks$/)}
            >
              Tareas
            </Link>
          </nav>
        </aside>

        <section className="flex min-h-screen flex-1 flex-col">
          <ProfileTopbar />

          <div className="flex-1 p-8">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}