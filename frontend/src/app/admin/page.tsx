'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  FolderPlus,
  Layers,
  Users,
} from 'lucide-react';
import { getProjects, getUsers } from '../../lib/api';
import {
  Card,
  CardCirclePattern,
  type CardPatternPosition,
  type CardRingTone,
} from '../../components/ui/Card';
import { PageTitle } from '../../components/ui/PageTitle';

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
  active?: boolean;
  role?: string;
};

type CardSurface = 'soft' | 'mist' | 'resources';
type CardMode = 'decorative' | 'system';

type ActionCardProps = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  mode?: CardMode;
  surface?: CardSurface;
  patternPosition?: CardPatternPosition;
  ringTone?: CardRingTone;
  showPattern?: boolean;
};

type StatCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  mode?: CardMode;
  surface?: CardSurface;
  patternPosition?: CardPatternPosition;
  ringTone?: CardRingTone;
  showPattern?: boolean;
};

const decorativeSurfaceStyles: Record<CardSurface, CSSProperties> = {
  soft: {
    backgroundColor: 'var(--rs-200)',
    borderColor: 'var(--rs-300)',
  },
  mist: {
    backgroundColor: 'var(--rs-300)',
    borderColor: 'var(--rs-300)',
  },
  resources: {
    backgroundColor: 'var(--rs-100)',
    borderColor: 'var(--rs-200)',
  },
};

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
    <Card
      as="article"
      interactive
      className={`relative isolate flex min-h-[120px] items-start justify-between gap-[18px] overflow-hidden px-[26px] py-6 ${getCardShell(
        mode,
      )}`}
      style={getCardStyle(mode, surface)}
    >
      {mode === 'decorative' && showPattern && (
        <CardCirclePattern position={patternPosition} ringTone={ringTone} />
      )}

      <div className="relative z-10 min-w-0">
        <p
          className={`text-[15px] font-medium leading-[1.3] ${getStrongText(mode)}`}
        >
          {label}
        </p>
        <p
          className={`mt-4 font-heading text-[30px] font-bold leading-[0.95] ${getValueText(mode)}`}
        >
          {value}
        </p>
      </div>

      <div
        className={`relative z-10 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border shadow-sm ${getIconShell(mode)}`}
      >
        {icon}
      </div>
    </Card>
  );
}

function ActionCard({
  title,
  description,
  href,
  icon,
  mode = 'system',
  surface = 'soft',
  patternPosition = 'bottom-right-soft',
  ringTone = 'light',
  showPattern = true,
}: ActionCardProps) {
  return (
    <Card
      as="article"
      interactive
      className={`relative isolate min-h-[138px] overflow-hidden px-7 py-7 ${getCardShell(
        mode,
      )}`}
      style={getCardStyle(mode, surface)}
    >
      {mode === 'decorative' && showPattern && (
        <CardCirclePattern position={patternPosition} ringTone={ringTone} />
      )}

      <div className="relative z-10 flex h-full items-center justify-between gap-[26px]">
        <div className="flex min-w-0 items-center gap-[18px]">
          <div
            className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border shadow-sm ${getIconShell(mode)}`}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <h2
              className={`font-heading text-[23px] font-semibold leading-[1.02] ${getStrongText(mode)}`}
            >
              {title}
            </h2>
            <p
              className={`mt-[10px] text-[15px] leading-[1.45] ${getMutedText(mode)}`}
            >
              {description}
            </p>
          </div>
        </div>

        <Link
          href={href}
          className={`inline-flex min-h-[38px] w-[100px] shrink-0 items-center justify-center rounded-full px-[18px] text-sm font-medium tracking-[0.03em] transition ${getButtonClass(
            mode,
          )}`}
        >
          Acceder
        </Link>
      </div>
    </Card>
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
        setUsers(
          Array.isArray(loadedUsers)
            ? loadedUsers.filter((user: User) => user.active !== false)
            : [],
        );
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
    <div className="mx-auto w-full max-w-[1240px] space-y-[25px] text-content">
      <header className="pb-4">
        <PageTitle>Panel de administrador</PageTitle>
      </header>

      {error && (
        <div className="rounded-[14px] border border-danger/30 bg-danger-surface p-4 text-danger">
          {error}
        </div>
      )}

      <section className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total de Proyectos"
          value={isLoading ? 0 : projects.length}
          icon={<FolderKanban size={20} strokeWidth={1.8} />}
          mode="decorative"
          surface="soft"
          patternPosition="top-left"
          ringTone="light"
        />

        <StatCard
          label="Proyectos Activos"
          value={isLoading ? 0 : activeProjects}
          icon={<Activity size={20} strokeWidth={1.8} />}
          mode="system"
        />

        <StatCard
          label="Proyectos Completados"
          value={isLoading ? 0 : completedProjects}
          icon={<CheckCircle2 size={20} strokeWidth={1.8} />}
          mode="decorative"
          surface="mist"
          patternPosition="top-right"
          ringTone="mid"
        />

        <StatCard
          label="Total de Usuarios"
          value={isLoading ? 0 : users.length}
          icon={<Users size={20} strokeWidth={1.8} />}
          mode="system"
        />
      </section>

      <section className="grid gap-[22px] lg:grid-cols-2">
        <ActionCard
          title="Gestión de Proyectos"
          description="Ver y administrar todos los proyectos"
          href="/admin/projects"
          icon={<FolderKanban size={20} strokeWidth={1.8} />}
          mode="decorative"
          surface="soft"
          patternPosition="bottom-right-soft"
          ringTone="light"
        />

        <ActionCard
          title="Crear Nuevo Proyecto"
          description="Registrar un nuevo proyecto en el sistema"
          href="/admin/projects?create=1"
          icon={<FolderPlus size={20} strokeWidth={1.8} />}
          mode="system"
        />

        <ActionCard
          title="Gestión de Tareas"
          description="Ver y administrar todas las tareas"
          href="/admin/tasks"
          icon={<ClipboardList size={20} strokeWidth={1.8} />}
          mode="system"
        />

        <ActionCard
          title="Gestión de Usuarios"
          description="Registrar y administrar usuarios del sistema"
          href="/admin/users"
          icon={<Users size={20} strokeWidth={1.8} />}
          mode="decorative"
          surface="mist"
          patternPosition="mid-left"
          ringTone="mid"
        />

        <ActionCard
          title="Gestión de Recursos"
          description="Ver y administrar los recursos disponibles"
          href="/admin/resources"
          icon={<Layers size={20} strokeWidth={1.8} />}
          mode="decorative"
          surface="resources"
          patternPosition="resources-rings"
          ringTone="light"
        />

        <ActionCard
          title="Analítica"
          description="Visualizar métricas y actividad del sistema"
          href="/admin/analytics"
          icon={<BarChart3 size={20} strokeWidth={1.8} />}
          mode="system"
        />
      </section>
    </div>
  );
}