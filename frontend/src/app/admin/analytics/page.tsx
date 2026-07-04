'use client';

import { useEffect, useState } from 'react';
import { getAnalyticsOverview, type AnalyticsOverview } from '../../../lib/api';
import { Card, MetricCard } from '../../../components/ui/Card';
import { PageTitle } from '../../../components/ui/PageTitle';

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
    loadAnalytics();
  }, []);

  if (loading) {
    return <p className="text-content-muted">Cargando indicadores...</p>;
  }

  if (!overview) {
    return (
      <section className="mx-auto w-full max-w-[1240px]">
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
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <PageTitle>Monitoreo y analítica</PageTitle>
        </div>

        <button
          type="button"
          onClick={loadAnalytics}
          className="rounded-lg border border-theme-border-strong bg-surface px-4 py-2 font-semibold text-content-strong transition hover:bg-surface-hover"
        >
          Actualizar indicadores
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-[14px] border border-danger/30 bg-danger-surface p-4 text-danger">
          {error}
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Proyectos totales" value={overview.projects.total} />

        <MetricCard
          label="Proyectos activos"
          value={overview.projects.active}
          detail={`${overview.projects.completed} finalizados`}
        />

        <MetricCard label="Tareas totales" value={overview.tasks.total} />

        <MetricCard
          label="Profesionales"
          value={overview.resources.total}
          detail={`${overview.resources.available} disponibles`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card as="article" className="p-6 xl:col-span-2">
          <h2 className="font-heading text-xl font-bold text-content-strong">
            Estado de proyectos
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatusCard label="Activos" value={overview.projects.active} />

            <StatusCard
              label="Finalizados"
              value={overview.projects.completed}
            />

            <StatusCard
              label="Avance promedio"
              value={`${overview.projects.averageProgress}%`}
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

        <Card as="article" className="p-6">
          <h2 className="font-heading text-xl font-bold text-content-strong">
            Recursos humanos
          </h2>

          <div className="mt-6 space-y-4">
            <MetricRow
              label="Disponibles"
              value={overview.resources.available}
              valueClass="text-success"
            />

            <MetricRow
              label="No disponibles"
              value={overview.resources.unavailable}
              valueClass="text-danger"
            />

            <MetricRow label="Total" value={overview.resources.total} />
          </div>
        </Card>

        <Card as="article" className="p-6 xl:col-span-3">
          <h2 className="font-heading text-xl font-bold text-content-strong">
            Estado de tareas
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard label="Totales" value={overview.tasks.total} />

            <StatusCard label="Pendientes" value={overview.tasks.todo} />

            <StatusCard label="En progreso" value={overview.tasks.inProgress} />

            <StatusCard label="Completadas" value={overview.tasks.completed} />
          </div>
        </Card>
      </div>
    </section>
  );
}

function StatusCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <Card variant="subtle" className="p-4">
      <p className="text-sm text-content-muted">{label}</p>

      <p className="mt-2 font-heading text-2xl font-bold text-content-strong">
        {value}
      </p>
    </Card>
  );
}

function MetricRow({
  label,
  value,
  valueClass = 'text-content-strong',
}: {
  label: string;
  value: number;
  valueClass?: string;
}) {
  return (
    <Card
      variant="subtle"
      className="flex items-center justify-between px-4 py-3"
    >
      <span className="text-content-muted">{label}</span>

      <span className={`text-xl font-bold ${valueClass}`}>{value}</span>
    </Card>
  );
}
