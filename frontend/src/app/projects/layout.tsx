'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AppShell,
  type AppNavigationSection,
} from '../../components/layout/AppShell';
import { AuthGate } from '../../components/auth/AuthGate';
import { canCreateProjects, getStoredRole } from '../../lib/auth';

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getStoredRole());
  }, []);

  const navigation = useMemo<AppNavigationSection[]>(() => {
    const projectItems = [
      {
        href: '/projects',
        label: 'Proyectos',
        match: /^\/projects(?:\/[0-9a-fA-F-]{36}(?:\/members)?)?$/,
      },
    ];

    if (canCreateProjects(role)) {
      projectItems.push({
        href: '/projects/create',
        label: 'Crear proyecto',
        match: /^\/projects\/create$/,
      });
    }

    return [
      { title: 'Gestión de proyectos', items: projectItems },
      {
        title: 'Trabajo',
        items: [
          {
            href: '/projects/tasks',
            label: 'Tareas',
            match: /^\/projects\/tasks$/,
          },
        ],
      },
    ];
  }, [role]);

  return (
    <AuthGate>
      <AppShell homeHref="/projects" navigation={navigation}>
        {children}
      </AppShell>
    </AuthGate>
  );
}
