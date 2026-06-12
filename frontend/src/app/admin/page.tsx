'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
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

type StatCardProps = {
  label: string;
  value: number;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="theme-card-interactive rounded-[22px] border border-theme-border bg-surface px-6 py-5 transition duration-200 hover:-translate-y-0.5 hover:border-theme-border-strong">
      <p className="text-sm font-medium text-content-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-highlight">
        {value}
      </p>
    </article>
  );
}

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
      className={`theme-action-card theme-card-interactive rounded-[22px] border border-theme-border px-6 py-5 transition duration-200 hover:-translate-y-0.5 hover:border-theme-border-strong ${
        fullWidth ? 'md:col-span-2' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-feature-icon-border bg-feature-icon-background text-feature-icon shadow-sm">
            {icon}
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-content-strong">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-content-muted">
              {description}
            </p>
          </div>
        </div>

        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover active:bg-primary-active"
        >
          {buttonLabel}
          <ArrowUpRight size={15} strokeWidth={2} />
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
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-content-strong lg:text-4xl">
          Panel de Administrador
        </h1>
        <p className="max-w-2xl text-content-muted">
          Bienvenido al panel de administración de Innovatech Solutions
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-danger/30 bg-danger-surface p-4 text-danger">
          {error}
        </div>
      )}

      {!isLoading && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total de Proyectos" value={projects.length} />
          <StatCard label="Proyectos Activos" value={activeProjects} />
          <StatCard label="Proyectos Completados" value={completedProjects} />
          <StatCard label="Total de Usuarios" value={users.length} />
        </section>
      )}

      <section className="grid gap-5 md:grid-cols-2">
        <ActionCard
          title="Gestión de Proyectos"
          description="Ver y administrar todos los proyectos"
          href="/admin/projects"
          buttonLabel="Ver proyectos"
          icon={<FolderKanban size={24} strokeWidth={1.8} />}
        />

        <ActionCard
          title="Crear Nuevo Proyecto"
          description="Registrar un nuevo proyecto en el sistema"
          href="/admin/projects/create"
          buttonLabel="Crear"
          icon={<FolderPlus size={24} strokeWidth={1.8} />}
        />

        <ActionCard
          title="Gestión de Tareas"
          description="Ver y administrar todas las tareas"
          href="/admin/tasks"
          buttonLabel="Ver tareas"
          icon={<ClipboardList size={24} strokeWidth={1.8} />}
        />

        <ActionCard
          title="Registrar Usuario"
          description="Agregar nuevos usuarios al sistema"
          href="/admin/users/create"
          buttonLabel="Registrar"
          icon={<UserPlus size={24} strokeWidth={1.8} />}
        />

        <ActionCard
          title="Usuarios registrados"
          description="Ver y eliminar usuarios existentes"
          href="/admin/users"
          buttonLabel="Ver usuarios"
          icon={<Users size={24} strokeWidth={1.8} />}
          fullWidth
        />
      </section>
    </div>
  );
}
