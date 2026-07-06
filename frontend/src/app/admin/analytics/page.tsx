'use client';

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import {
  Activity,
  CheckCircle2,
  Clock3,
  ClipboardList,
  FolderKanban,
  Loader2,
  TrendingUp,
  UserCheck,
  UsersRound,
  UserX,
} from 'lucide-react';
import { getAnalyticsOverview, type AnalyticsOverview } from '../../../lib/api';
import {
  Card,
  CardCirclePattern,
  type CardPatternPosition,
} from '../../../components/ui/Card';
import {
  PageTitle,
  pageActionButtonClassName,
} from '../../../components/ui/PageTitle';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError('');

      const data = await getAnalyticsOverview();
      setOverview(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo cargar la analítica',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadAnalytics);
  }, []);

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-[1240px]">
        <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <PageTitle>Monitoreo y analítica</PageTitle>
          <button
            type="button"
            disabled
            className={`${pageActionButtonClassName} opacity-50`}
          >
            Refrescar indicadores
          </button>
        </div>
        <Card className="p-6 text-content-muted">
          Cargando indicadores...
        </Card>
      </section>
    );
  }

  if (!overview) {
    return (
      <section className="mx-auto w-full max-w-[1240px]">
        <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <PageTitle>Monitoreo y analítica</PageTitle>
          <button
            type="button"
            onClick={loadAnalytics}
            className={pageActionButtonClassName}
          >
            Reintentar
          </button>
        </div>
        <div className="rounded-[14px] border border-danger/30 bg-danger-surface p-4 text-danger">
          {error || 'No se encontró información analítica'}
        </div>
      </section>
    );
  }

  const projectProgress = Math.min(
    Math.max(overview.projects.averageProgress, 0),
    100,
  );

  return (
    <section className="mx-auto w-full max-w-[1240px]">
      <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <PageTitle>Monitoreo y analítica</PageTitle>
        </div>

        <button
          type="button"
          onClick={loadAnalytics}
          className={pageActionButtonClassName}
        >
          Refrescar indicadores
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-[14px] border border-danger/30 bg-danger-surface p-4 text-danger">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
        <Link
          href="/admin/projects"
          className="block rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-content-strong"
        >
        <Card as="article" interactive className="h-full p-6">
          <h2 className="font-heading text-xl font-bold text-content-strong">
            Estado de proyectos
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard
              label="Total de Proyectos"
              value={overview.projects.total}
              mode="decorative"
              surface="soft"
              patternPosition="analytics-projects-total"
              icon={<FolderKanban size={20} strokeWidth={1.8} />}
            />

            <StatusCard
              label="Proyectos Activos"
              value={overview.projects.active}
              mode="system"
              icon={<Activity size={20} strokeWidth={1.8} />}
            />

            <StatusCard
              label="Proyectos Completados"
              value={overview.projects.completed}
              mode="decorative"
              surface="mist"
              patternPosition="analytics-projects-completed"
              ringTone="mid"
              icon={<CheckCircle2 size={20} strokeWidth={1.8} />}
            />

            <StatusCard
              label="Avance promedio"
              value={`${overview.projects.averageProgress}%`}
              mode="system"
              icon={<TrendingUp size={20} strokeWidth={1.8} />}
            />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-content-muted">
                Avance promedio general
              </span>

              <span className="font-semibold text-content-strong">
                {projectProgress}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-surface-alt">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${projectProgress}%` }}
              />
            </div>
          </div>
        </Card>
        </Link>

        <Link
          href="/admin/resources"
          className="block rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-content-strong"
        >
        <Card as="article" interactive className="h-full p-6">
          <h2 className="font-heading text-xl font-bold text-content-strong">
            Recursos humanos
          </h2>

          <div className="mt-6 space-y-4">
            <MetricRow
              label="Total"
              value={overview.resources.total}
              className="theme-card-light"
              patternPosition="analytics-resources-total"
              icon={<UsersRound size={18} />}
            />

            <MetricRow
              label="Disponibles"
              value={overview.resources.available}
              className="theme-card-light"
              patternPosition="analytics-resources-available"
              ringTone="mid"
              icon={<UserCheck size={18} />}
            />

            <MetricRow
              label="No disponibles"
              value={overview.resources.unavailable}
              className="theme-card-light"
              patternPosition="analytics-resources-unavailable"
              icon={<UserX size={18} />}
            />
          </div>
        </Card>
        </Link>

        <Link
          href="/admin/tasks"
          className="block rounded-[14px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-content-strong xl:col-span-2"
        >
        <Card as="article" interactive className="h-full p-6">
          <h2 className="font-heading text-xl font-bold text-content-strong">
            Estado de tareas
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard
              label="Totales"
              value={overview.tasks.total}
              mode="decorative"
              surface="soft"
              patternPosition="analytics-tasks-total"
              icon={<ClipboardList size={20} strokeWidth={1.8} />}
            />

            <StatusCard
              label="Pendientes"
              value={overview.tasks.todo}
              mode="system"
              icon={<Clock3 size={20} strokeWidth={1.8} />}
            />

            <StatusCard
              label="En progreso"
              value={overview.tasks.inProgress}
              mode="decorative"
              surface="soft"
              patternPosition="analytics-tasks-in-progress"
              icon={<Loader2 size={20} strokeWidth={1.8} />}
            />

            <StatusCard
              label="Completadas"
              value={overview.tasks.completed}
              mode="system"
              icon={<CheckCircle2 size={20} strokeWidth={1.8} />}
            />
          </div>
        </Card>
        </Link>
      </div>
    </section>
  );
}

function StatusCard({
  label,
  value,
  mode = 'system',
  surface = 'soft',
  patternPosition,
  ringTone = 'light',
  className = '',
  icon,
}: {
  label: string;
  value: number | string;
  mode?: 'decorative' | 'system';
  surface?: 'soft' | 'mist';
  patternPosition?: CardPatternPosition;
  ringTone?: 'light' | 'mid';
  className?: string;
  icon?: ReactNode;
}) {
  const decorativeStyles: Record<'soft' | 'mist', CSSProperties> = {
    soft: {
      backgroundColor: 'var(--rs-200)',
      borderColor: 'var(--rs-300)',
    },
    mist: {
      backgroundColor: 'var(--rs-300)',
      borderColor: 'var(--rs-300)',
    },
  };

  return (
    <Card
      interactive
      className={`relative isolate flex min-h-[120px] items-start justify-between gap-[18px] overflow-hidden px-[26px] py-6 ${
        mode === 'decorative'
          ? 'text-[#060C0F]'
          : 'border-theme-border bg-surface text-content'
      } ${className}`}
      style={mode === 'decorative' ? decorativeStyles[surface] : undefined}
    >
      {mode === 'decorative' && patternPosition && (
        <CardCirclePattern position={patternPosition} ringTone={ringTone} />
      )}

      <div className="relative z-10 min-w-0">
        <p
          className={`text-[15px] font-medium leading-[1.3] ${
            mode === 'decorative' ? 'text-[#060C0F]' : 'text-content-strong'
          }`}
        >
          {label}
        </p>
        <p
          className={`mt-4 font-heading text-[30px] font-bold leading-[0.95] ${
            mode === 'decorative' ? 'text-[#060C0F]' : 'text-highlight'
          }`}
        >
          {value}
        </p>
      </div>

      {icon && (
        <span
          className={`relative z-10 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border shadow-sm ${
            mode === 'decorative'
              ? 'border-[#BAC2C4] bg-[#F9FBFB] text-[#243032]'
              : 'border-feature-icon-border bg-feature-icon-background text-feature-icon'
          }`}
        >
          {icon}
        </span>
      )}
    </Card>
  );
}

function MetricRow({
  label,
  value,
  valueClass = 'text-content-strong',
  className = '',
  patternPosition,
  ringTone = 'light',
  icon,
}: {
  label: string;
  value: number;
  valueClass?: string;
  className?: string;
  patternPosition?: CardPatternPosition;
  ringTone?: 'light' | 'mid';
  icon?: ReactNode;
}) {
  return (
    <Card
      variant="subtle"
      className={`relative isolate flex items-center justify-between overflow-hidden px-4 py-3 ${className}`}
    >
      {patternPosition && (
        <CardCirclePattern position={patternPosition} ringTone={ringTone} />
      )}

      <span className="relative z-10 flex items-center gap-3 text-[15px] font-medium text-content-strong">
        {icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-feature-icon-border bg-feature-icon-background text-feature-icon">
            {icon}
          </span>
        )}
        {label}
      </span>

      <span
        className={`relative z-10 font-heading text-xl font-bold ${valueClass}`}
      >
        {value}
      </span>
    </Card>
  );
}
