'use client';

import type { ReactNode } from 'react';
import {
  AppShell,
  type AppNavigationSection,
} from '../../components/layout/AppShell';
import { AuthGate } from '../../components/auth/AuthGate';

const adminNavigation: AppNavigationSection[] = [
  {
    title: 'Panel de administración',
    items: [
      { href: '/admin', label: 'Dashboard', match: /^\/admin$/ },
      {
        href: '/admin/users',
        label: 'Gestión de usuarios',
        match: /^\/admin\/users(?:\/create)?$/,
      },
    ],
  },
  {
    title: 'Gestión de proyectos',
    items: [
      {
        href: '/admin/projects',
        label: 'Proyectos',
        match: /^\/admin\/projects(?:\/.*)?$/,
      },
      { href: '/admin/tasks', label: 'Tareas', match: /^\/admin\/tasks$/ },
    ],
  },
  {
    title: 'Gestión de recursos',
    items: [
      {
        href: '/admin/resources',
        label: 'Recursos',
        match: /^\/admin\/resources$/,
      },
    ],
  },
  {
    title: 'Monitoreo',
    items: [
      {
        href: '/admin/analytics',
        label: 'Analítica',
        match: /^\/admin\/analytics$/,
      },
    ],
  },
];

const adminAllowedRoles = ['admin'] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate allowedRoles={adminAllowedRoles} unauthorizedRedirect="/projects">
      <AppShell homeHref="/admin" navigation={adminNavigation}>
        {children}
      </AppShell>
    </AuthGate>
  );
}
