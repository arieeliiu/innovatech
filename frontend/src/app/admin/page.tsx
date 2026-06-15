'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Folder,
  FolderPlus,
  Layers,
  Users,
} from 'lucide-react';
import { getProjects, getUsers } from '../../lib/api';

type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  main_responsible_id: string;
};

type User = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
};

type CardVariant = 'system' | 'soft' | 'mist';
type RingTone = 'light' | 'mid';

type PatternConfig = {
  position: string;
  tone: RingTone;
};

type StatCard = {
  label: string;
  value: number;
  icon: LucideIcon;
  variant: CardVariant;
  pattern?: PatternConfig;
};

type ActionCard = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  variant: CardVariant;
  pattern?: PatternConfig;
  className?: string;
};

function getCardClass(variant: CardVariant) {
  if (variant === 'system') {
    return 'innovatech-system';
  }

  return `innovatech-decorative ${variant === 'soft' ? 'innovatech-soft' : 'innovatech-mist'}`;
}

function RingPattern({ pattern }: { pattern?: PatternConfig }) {
  if (!pattern) return null;

  const ringClass =
    pattern.tone === 'mid'
      ? 'innovatech-ring innovatech-ring-mid'
      : 'innovatech-ring innovatech-ring-light';

  return (
    <div className={`innovatech-pattern ${pattern.position}`} aria-hidden="true">
      <span className={ringClass} />
      <span className={ringClass} />
      <span className={ringClass} />
    </div>
  );
}

function IconBox({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="innovatech-icon-box">
      <Icon size={20} strokeWidth={1.8} />
    </div>
  );
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setError('');
        setIsLoading(true);

        const projectsData = await getProjects();
        const usersData = await getUsers();

        const loadedProjects = projectsData.projects ?? projectsData.data ?? [];
        const loadedUsers = usersData.users ?? usersData.data ?? [];

        setProjects(Array.isArray(loadedProjects) ? loadedProjects : []);
        setUsers(Array.isArray(loadedUsers) ? loadedUsers : []);
      } catch {
        setError('No se pudieron cargar los datos');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const activeProjects = projects.filter((p) => (p.status || '').toUpperCase() !== 'DONE').length;
  const completedProjects = projects.filter((p) => (p.status || '').toUpperCase() === 'DONE').length;

  const stats: StatCard[] = [
    {
      label: 'Total de Proyectos',
      value: projects.length,
      icon: Folder,
      variant: 'soft',
      pattern: { position: 'innovatech-top-left', tone: 'light' },
    },
    {
      label: 'Proyectos Activos',
      value: activeProjects,
      icon: Activity,
      variant: 'system',
    },
    {
      label: 'Proyectos Completados',
      value: completedProjects,
      icon: CheckCircle2,
      variant: 'mist',
      pattern: { position: 'innovatech-top-right', tone: 'mid' },
    },
    {
      label: 'Total de Usuarios',
      value: users.length,
      icon: Users,
      variant: 'system',
    },
  ];

  const actions: ActionCard[] = [
    {
      title: 'Gestión de Proyectos',
      description: 'Ver y administrar todos los proyectos',
      href: '/admin/projects',
      icon: Folder,
      variant: 'soft',
      pattern: { position: 'innovatech-bottom-right-soft', tone: 'light' },
    },
    {
      title: 'Crear Nuevo Proyecto',
      description: 'Registrar un nuevo proyecto en el sistema',
      href: '/admin/projects/create',
      icon: FolderPlus,
      variant: 'system',
    },
    {
      title: 'Gestión de Tareas',
      description: 'Ver y administrar todas las tareas',
      href: '/admin/tasks',
      icon: ClipboardList,
      variant: 'system',
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Registrar y administrar usuarios del sistema',
      href: '/admin/users',
      icon: Users,
      variant: 'mist',
      pattern: { position: 'innovatech-mid-left', tone: 'mid' },
    },
    {
      title: 'Gestión de Recursos',
      description: 'Ver y administrar los recursos disponibles',
      href: '/admin/resources',
      icon: Layers,
      variant: 'soft',
      pattern: { position: 'innovatech-resources-rings', tone: 'light' },
      className: 'innovatech-resources-card',
    },
    {
      title: 'Analítica',
      description: 'Visualizar métricas y actividad del sistema',
      href: '/admin/analytics',
      icon: BarChart3,
      variant: 'system',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1160px] space-y-8 text-[var(--text)]">
      <div>
        <h1 className="innovatech-dashboard-title">Panel de administrador</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-500">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="innovatech-card innovatech-system p-6 text-sm text-[var(--text-muted)]">
          Cargando resumen del sistema...
        </div>
      ) : (
        <section className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.label}
                className={`innovatech-card innovatech-stat-card ${getCardClass(stat.variant)}`}
              >
                <RingPattern pattern={stat.pattern} />
                <div className="innovatech-card-content">
                  <p className="innovatech-label">{stat.label}</p>
                  <p className="innovatech-value">{stat.value}</p>
                </div>
                <div className="innovatech-icon-box">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section className="grid gap-[22px] lg:grid-cols-2">
        {actions.map((action) => (
          <article
            key={action.title}
            className={`innovatech-card innovatech-action-card ${getCardClass(action.variant)} ${action.className ?? ''}`}
          >
            <RingPattern pattern={action.pattern} />
            <div className="innovatech-action-left">
              <IconBox icon={action.icon} />
              <div className="innovatech-card-content">
                <h2 className="innovatech-title">{action.title}</h2>
                <p className="innovatech-description">{action.description}</p>
              </div>
            </div>
            <Link href={action.href} className="innovatech-button">
              Acceder
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
