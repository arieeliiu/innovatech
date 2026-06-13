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

type CardSurface = 'soft' | 'mist';
type PatternPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-right-soft'
  | 'mid-left'
  | 'wide-right';
type RingTone = 'light' | 'mid';
type CardMode = 'decorative' | 'system';

type ActionCardProps = {
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  icon: ReactNode;
  fullWidth?: boolean;
  mode?: CardMode;
  surface?: CardSurface;
  patternPosition?: PatternPosition;
  ringTone?: RingTone;
  showPattern?: boolean;
};

type StatCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  mode?: CardMode;
  surface?: CardSurface;
  patternPosition?: PatternPosition;
  ringTone?: RingTone;
  showPattern?: boolean;
};

const decorativeSurfaceStyles: Record<CardSurface, CSSProperties> = {
  soft: {
    backgroundColor: '#E6E9EA',
    borderColor: '#D3D8D9',
  },
  mist: {
    backgroundColor: '#D3D8D9',
    borderColor: '#BAC2C4',
  },
};

const ringStyles: Record<RingTone, { stroke: string; opacity: number }> = {
  light: { stroke: '#A0A9AB', opacity: 0.42 },
  mid: { stroke: '#6F787B', opacity: 0.34 },
};

const patternPositions: Record<PatternPosition, { x: string; y: string; sizes: number[] }> = {
  'top-left': { x: '14%', y: '8%', sizes: [320, 200, 100] },
  'top-right': { x: '102%', y: '4%', sizes: [320, 200, 100] },
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
          className="absolute rounded-full"
          style={{
            left: currentPosition.x,
            top: currentPosition.y,
            width: size,
            height: size,
            borderColor: currentRing.stroke,
            borderStyle: 'solid',
            borderWidth: 1,
            opacity: currentRing.opacity,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

function getCardShell(mode: CardMode) {
  if (mode === 'decorative') {
    return 'text-[#060C0F]';
  }

  return 'border-theme-border bg-surface text-content';
}

function getCardStyle(mode: CardMode, surface: CardSurface) {
  if (mode === 'decorative') {
    return decorativeSurfaceStyles[surface];
  }

  return undefined;
}

function getMutedText(mode: CardMode) {
  return mode === 'decorative' ? 'text-[#505C5E]' : 'text-content-muted';
}

function getStrongText(mode: CardMode) {
  return mode === 'decorative' ? 'text-[#060C0F]' : 'text-content-strong';
}

function getValueText(mode: CardMode) {
  return mode === 'decorative' ? 'text-[#060C0F]' : 'text-highlight';
}

function getIconShell(mode: CardMode) {
  return mode === 'decorative'
    ? 'border-[#BAC2C4] bg-[#F9FBFB] text-[#243032]'
    : 'border-feature-icon-border bg-feature-icon-background text-feature-icon';
}

function getButtonClass(mode: CardMode) {
  return mode === 'decorative'
    ? 'bg-[#060C0F] text-[#F9FBFB] hover:bg-[#161F22] active:bg-[#243032]'
    : 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active';
}

function StatCard({
  label,
  value,
  icon,
  mode = 'system',
  surface = 'soft',
  patternPosition = 'bottom-right-soft',
  ringTone = 'light',
  showPattern = true,
}: StatCardProps) {
  return (
    <article
      className={`theme-card-interactive relative isolate min-h-[118px] overflow-hidden rounded-[24px] border px-6 py-5 transition duration-200 hover:-translate-y-0.5 hover:border-theme-border-strong ${getCardShell(
        mode,
      )}`}
      style={getCardStyle(mode, surface)}
    >
      {mode === 'decorative' && showPattern && (
        <Pattern position={patternPosition} ringTone={ringTone} />
      )}

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm font-medium ${getMutedText(mode)}`}>{label}</p>
          <p className={`mt-3 text-3xl font-semibold tracking-tight ${getValueText(mode)}`}>
            {value}
          </p>
        </div>

        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm ${getIconShell(mode)}`}>
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
  mode = 'system',
  surface = 'soft',
  patternPosition = 'bottom-right-soft',
  ringTone = 'light',
  showPattern = true,
}: ActionCardProps) {
  return (
    <article
      className={`theme-card-interactive relative isolate min-h-[136px] overflow-hidden rounded-[24px] border px-6 py-5 transition duration-200 hover:-translate-y-0.5 hover:border-theme-border-strong ${getCardShell(
        mode,
      )} ${fullWidth ? 'md:col-span-2' : ''}`}
      style={getCardStyle(mode, surface)}
    >
      {mode === 'decorative' && showPattern && (
        <Pattern position={patternPosition} ringTone={ringTone} />
      )}

      <div className="relative z-10 flex h-full items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm ${getIconShell(mode)}`}>
            {icon}
          </div>

          <div className="min-w-0">
            <h2 className={`text-lg font-semibold tracking-tight ${getStrongText(mode)}`}>
              {title}
            </h2>
            <p className={`mt-1 text-sm leading-6 ${getMutedText(mode)}`}>
              {description}
            </p>
          </div>
        </div>

        <Link
          href={href}
          className={`inline-flex shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${getButtonClass(
            mode,
          )}`}
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
        <h1 className="font-heading text-3xl font-medium tracking-tight text-content-strong lg:text-4xl">
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
            mode="decorative"
            surface="soft"
            patternPosition="top-left"
            ringTone="light"
          />

          <StatCard
            label="Proyectos Activos"
            value={activeProjects}
            icon={<Activity size={21} strokeWidth={1.8} />}
            mode="system"
          />

          <StatCard
            label="Proyectos Completados"
            value={completedProjects}
            icon={<CheckCircle2 size={21} strokeWidth={1.8} />}
            mode="decorative"
            surface="mist"
            patternPosition="top-right"
            ringTone="mid"
          />

          <StatCard
            label="Total de Usuarios"
            value={users.length}
            icon={<Users size={21} strokeWidth={1.8} />}
            mode="system"
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
          mode="decorative"
          surface="soft"
          patternPosition="bottom-right-soft"
          ringTone="light"
        />

        <ActionCard
          title="Crear Nuevo Proyecto"
          description="Registrar un nuevo proyecto en el sistema"
          href="/admin/projects/create"
          buttonLabel="Crear"
          icon={<FolderPlus size={24} strokeWidth={1.8} />}
          mode="system"
        />

        <ActionCard
          title="Gestión de Tareas"
          description="Ver y administrar todas las tareas"
          href="/admin/tasks"
          buttonLabel="Ver tareas"
          icon={<ClipboardList size={24} strokeWidth={1.8} />}
          mode="decorative"
          surface="mist"
          patternPosition="mid-left"
          ringTone="mid"
        />

        <ActionCard
          title="Registrar Usuario"
          description="Agregar nuevos usuarios al sistema"
          href="/admin/users/create"
          buttonLabel="Registrar"
          icon={<UserPlus size={24} strokeWidth={1.8} />}
          mode="system"
        />

        <ActionCard
          title="Usuarios registrados"
          description="Ver y eliminar usuarios existentes"
          href="/admin/users"
          buttonLabel="Ver usuarios"
          icon={<Users size={24} strokeWidth={1.8} />}
          mode="decorative"
          surface="soft"
          showPattern={false}
          fullWidth
        />
      </section>
    </div>
  );
}
