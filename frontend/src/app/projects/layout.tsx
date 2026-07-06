'use client';

import type { ReactNode } from 'react';
import {
  AppShell,
  type AppNavigationSection,
} from '../../components/layout/AppShell';
import { AuthGate } from '../../components/auth/AuthGate';

const navigation: AppNavigationSection[] = [
  {
    title: 'Gestión de proyectos',
    items: [
      {
        href: '/projects',
        label: 'Proyectos',
        match: /^\/projects(?:\/[0-9a-fA-F-]{36}(?:\/members)?)?$/,
      },
    ],
  },
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

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <AppShell homeHref="/projects" navigation={navigation}>
        {children}
      </AppShell>
    </AuthGate>
  );
}
