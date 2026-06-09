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
      ? 'block rounded-lg border-l-4 border-[#52E0DC] bg-[#52E0DC]/10 px-3 py-2 text-sm font-semibold text-[#F5F7FA]'
      : 'block rounded-lg border-l-4 border-transparent px-3 py-2 text-sm font-medium text-[#AAB4C0] transition hover:bg-[#162233] hover:text-[#F5F7FA]';
  }

  return (
    <main className="min-h-screen bg-[#1F2E49] text-[#F5F7FA]">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-white/10 bg-[#171C22] p-6">
          <Link href="/projects" className="block">
            <img
              src="/innovatech-logo.png"
              alt="Innovatech Solutions"
              className="h-auto w-[190px] object-contain"
            />
          </Link>

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