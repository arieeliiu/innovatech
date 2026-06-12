'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  FolderKanban,
  FolderPlus,
  UserPlus,
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

type ActionCardProps = {
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  icon: ReactNode;
  fullWidth?: boolean;
};

const statCardClass =
  'rounded-2xl border border-theme-border bg-surface p-6 shadow-card';

const actionButtonClass =
  'shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover active:bg-primary-active';

function ActionCard({
  title,
  description,
  href,
  buttonLabel,
  icon,
  fullWidth = false,
}: ActionCardProps) {
  return (
    <article
      className={`theme-action-card rounded-2xl border border-theme-border p-6 shadow-card transition hover:border-theme-border-strong ${
        fullWidth ? 'md:col-span-2' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-feature-icon-border bg-feature-icon-background text-feature-icon shadow-sm">
            {icon}
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-content-strong">
              {title}
            </h2>
            <p className="mt-1 text-sm text-content-muted">{description}</p>
          </div>
        </div>

        <Link href={href} className={actionButtonClass}>
          {buttonLabel}
        </Link>
      </div>
    </article>
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

  const activeProjects = projects.filter(
    (project) => (project.status || '').toUpperCase() !== 'DONE',
  ).length;

  const completedProjects = projects.filter(
    (project) => (project.status || '').toUpperCase() === 'DONE',
  ).length;

  return (
    <div className="space-y-8 text-content">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-content-strong lg:text-4xl">
          Panel de Administrador
        </h1>
        <p className="mt-2 text-content-muted">
          Bienvenido al panel de administración de Innovatech Solutions
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger-surface p-4 text-danger">
          {error}
        </div>
      )}

      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className={statCardClass}>
            <p className="text-sm text-content-muted">Total de Proyectos</p>
            <p className="mt-2 text-3xl font-bold text-highlight">
              {projects.length}
            </p>
          </div>

          <div className={statCardClass}>
            <p className="text-sm text-content-muted">Proyectos Activos</p>
            <p className="mt-2 text-3xl font-bold text-highlight">
              {activeProjects}
            </p>
          </div>

          <div className={statCardClass}>
            <p className="text-sm text-content-muted">
              Proyectos Completados
            </p>
            <p className="mt-2 text-3xl font-bold text-highlight">
              {completedProjects}
            </p>
          </div>

          <div className={statCardClass}>
            <p className="text-sm text-content-muted">Total de Usuarios</p>
            <p className="mt-2 text-3xl font-bold text-highlight">
              {users.length}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <ActionCard
          title="Gestión de Proyectos"
          description="Ver y administrar todos los proyectos"
          href="/admin/projects"
          buttonLabel="Ver proyectos"
          icon={<FolderKanban size={24} strokeWidth={1.9} />}
        />

        <ActionCard
          title="Crear Nuevo Proyecto"
          description="Registrar un nuevo proyecto en el sistema"
          href="/admin/projects/create"
          buttonLabel="Crear"
          icon={<FolderPlus size={24} strokeWidth={1.9} />}
        />

        <ActionCard
          title="Gestión de Tareas"
          description="Ver y administrar todas las tareas"
          href="/admin/tasks"
          buttonLabel="Ver tareas"
          icon={<ClipboardList size={24} strokeWidth={1.9} />}
        />

        <ActionCard
          title="Registrar Usuario"
          description="Agregar nuevos usuarios al sistema"
          href="/admin/users/create"
          buttonLabel="Registrar"
          icon={<UserPlus size={24} strokeWidth={1.9} />}
        />

        <ActionCard
          title="Usuarios registrados"
          description="Ver y eliminar usuarios existentes"
          href="/admin/users"
          buttonLabel="Ver usuarios"
          icon={<Users size={24} strokeWidth={1.9} />}
          fullWidth
        />
      </div>
    </div>
  );
}
