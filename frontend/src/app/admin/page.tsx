'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Activity,
  CheckCircle2,
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

type CardSurface = '50' | '100' | '200' | '400';
type PatternPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-right'
  | 'bottom-right-soft'
  | 'mid-left'
  | 'wide-right';
type RingTone = 'light' | 'mid' | 'dark';

type ActionCardProps = {
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  icon: ReactNode;
  fullWidth?: boolean;
  surface?: CardSurface;
  patternPosition?: PatternPosition;
  ringTone?: RingTone;
  tall?: boolean;
};

type StatCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  surface?: CardSurface;
  patternPosition?: PatternPosition;
  ringTone?: RingTone;
};

const surfaceStyles: Record<CardSurface, CSSProperties> = {
  '50': {
    backgroundColor: '#F9FBFB',
    borderColor: '#D3D8D9',
  },
  '100': {
    backgroundColor: '#F4F5F5',
    borderColor: '#D3D8D9',
  },
  '200': {
    backgroundColor: '#E6E9EA',
    borderColor: '#D3D8D9',
  },
  '400': {
    backgroundColor: '#A0A9AB',
    borderColor: '#6F787B',
  },
};

const ringStyles: Record<RingTone, { stroke: string; opacity: number }> = {
  light: { stroke: '#D3D8D9', opacity: 0.3 },
  mid: { stroke: '#A0A9AB', opacity: 0.26 },
  dark: { stroke: '#6F787B', opacity: 0.24 },
};

const patternPositions: Record<PatternPosition, { x: string; y: string; sizes: number[] }> = {
  'top-left': { x: '14%', y: '8%', sizes: [320, 200, 100] },
  'top-right': { x: '102%', y: '4%', sizes: [320, 200, 100] },
  'bottom-right': { x: '96%', y: '102%', sizes: [320, 200, 100] },
  'bottom-right-soft': { x: '90%', y: '102%', sizes: [320, 200, 100] },
  'mid-left': { x: '30%', y: '52%', sizes: [320, 200, 100] },
  'wide-right': { x: '94%', y: '96%', sizes: [360, 230, 120] },
};

function Pattern({
  position,
  ringTone,
}: {
  position: PatternPosition;
  ringTone: RingTone;
}) {
  const currentPosition = patternPositions[position];
  const currentRing = ringStyles[ringTone];

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {currentPosition.sizes.map((size) => (
        <span
          key={size}
          className="absolute rounded-full border-2"
          style={{
            left: currentPosition.x,
            top: currentPosition.y,
            width: size,
            height: size,
            borderColor: currentRing.stroke,
            opacity: currentRing.opacity,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  surface = '50',
  patternPosition = 'bottom-right',
  ringTone = 'light',
}: StatCardProps) {
  return (
    <article
      className="theme-card-interactive relative isolate min-h-[118px] overflow-hidden rounded-[24px] border px-6 py-5 transition duration-200 hover:-translate-y-0.5 hover:border-theme-border-strong"
      style={surfaceStyles[surface]}
    >
      <Pattern position={patternPosition} ringTone={ringTone} />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-content-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-highlight">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-feature-icon-border bg-feature-icon-background text-feature-icon shadow-sm">
          {icon}
        </div>
      </div>
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
  surface = '50',
  patternPosition = 'bottom-right-soft',
  ringTone = 'light',
  tall = false,
}: ActionCardProps) {
  return (
    <article
      className={`theme-card-interactive relative isolate overflow-hidden rounded-[24px] border px-6 py-5 transition duration-200 hover:-translate-y-0.5 hover:border-theme-border-strong ${
        fullWidth ? 'md:col-span-2' : ''
      } ${tall ? 'min-h-[140px]' : 'min-h-[136px]'}`}
      style={surfaceStyles[surface]}
    >
      <Pattern position={patternPosition} ringTone={ringTone} />

      <div className="relative z-10 flex h-full items-center justify-between gap-6">
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
          className="inline-flex shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover active:bg-primary-active"
        >
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
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-content-strong lg:text-4xl">
          Panel de Administrador
        </h1>
      </header>

      {error && (
        <div className="rounded-2xl border border-danger/30 bg-danger-surface p-4 text-danger">
          {error}
        </div>
      )}

      {!isLoading && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total de Proyectos"
            value={projects.length}
            icon={<FolderKanban size={21} strokeWidth={1.8} />}
            surface="50"
            patternPosition="top-left"
            ringTone="light"
          />
          <StatCard
            label="Proyectos Activos"
            value={activeProjects}
            icon={<Activity size={21} strokeWidth={1.8} />}
            surface="100"
            patternPosition="bottom-right-soft"
            ringTone="light"
          />
          <StatCard
            label="Proyectos Completados"
            value={completedProjects}
            icon={<CheckCircle2 size={21} strokeWidth={1.8} />}
            surface="200"
            patternPosition="top-right"
            ringTone="mid"
          />
          <StatCard
            label="Total de Usuarios"
            value={users.length}
            icon={<Users size={21} strokeWidth={1.8} />}
            surface="100"
            patternPosition="bottom-right"
            ringTone="light"
          />
        </section>
      )}

      <section className="grid gap-5 md:grid-cols-2">
        <ActionCard
          title="Gestión de Proyectos"
          description="Ver y administrar todos los proyectos"
          href="/admin/projects"
          buttonLabel="Ver proyectos"
          icon={<FolderKanban size={24} strokeWidth={1.8} />}
          surface="50"
          patternPosition="bottom-right-soft"
          ringTone="light"
        />

        <ActionCard
          title="Crear Nuevo Proyecto"
          description="Registrar un nuevo proyecto en el sistema"
          href="/admin/projects/create"
          buttonLabel="Crear"
          icon={<FolderPlus size={24} strokeWidth={1.8} />}
          surface="100"
          patternPosition="top-right"
          ringTone="light"
        />

        <ActionCard
          title="Gestión de Tareas"
          description="Ver y administrar todas las tareas"
          href="/admin/tasks"
          buttonLabel="Ver tareas"
          icon={<ClipboardList size={24} strokeWidth={1.8} />}
          surface="50"
          patternPosition="mid-left"
          ringTone="light"
        />

        <ActionCard
          title="Registrar Usuario"
          description="Agregar nuevos usuarios al sistema"
          href="/admin/users/create"
          buttonLabel="Registrar"
          icon={<UserPlus size={24} strokeWidth={1.8} />}
          surface="400"
          patternPosition="wide-right"
          ringTone="dark"
          tall
        />

        <ActionCard
          title="Usuarios registrados"
          description="Ver y eliminar usuarios existentes"
          href="/admin/users"
          buttonLabel="Ver usuarios"
          icon={<Users size={24} strokeWidth={1.8} />}
          surface="200"
          patternPosition="wide-right"
          ringTone="mid"
          fullWidth
        />
      </section>
    </div>
  );
}
