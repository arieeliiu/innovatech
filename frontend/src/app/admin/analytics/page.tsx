'use client';

import { useEffect, useState } from 'react';
import {
  getAnalyticsOverview,
  type AnalyticsOverview,
} from '../../../lib/api';

export default function AnalyticsPage() {
  const [overview, setOverview] =
    useState<AnalyticsOverview | null>(null);

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
        err instanceof Error
          ? err.message
          : 'No se pudo cargar la analítica',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <p className="text-[#AAB4C0]">
        Cargando indicadores...
      </p>
    );
  }

  if (!overview) {
    return (
      <section>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
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
    <section>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F7FA]">
            Monitoreo y analítica
          </h1>

          <p className="mt-2 text-[#AAB4C0]">
            Indicadores generales de proyectos, tareas y recursos.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAnalytics}
          className="rounded-lg border border-[#52E0DC]/40 bg-[#52E0DC]/10 px-4 py-2 font-semibold text-[#52E0DC] transition hover:bg-[#52E0DC] hover:text-[#171C22]"
        >
          Actualizar indicadores
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Proyectos totales"
          value={overview.projects.total}
        />

        <KpiCard
          title="Proyectos activos"
          value={overview.projects.active}
          detail={`${overview.projects.completed} finalizados`}
        />

        <KpiCard
          title="Tareas totales"
          value={overview.tasks.total}
        />

        <KpiCard
          title="Profesionales"
          value={overview.resources.total}
          detail={`${overview.resources.available} disponibles`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-[#2A3B55] bg-[#172235] p-6 xl:col-span-2">
          <h2 className="text-xl font-bold text-[#F5F7FA]">
            Estado de proyectos
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatusCard
              label="Activos"
              value={overview.projects.active}
            />

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
              <span className="text-[#AAB4C0]">
                Avance promedio general
              </span>

              <span className="font-semibold text-[#F5F7FA]">
                {projectProgress}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-[#263A5A]">
              <div
                className="h-full rounded-full bg-[#52E0DC] transition-all"
                style={{ width: `${projectProgress}%` }}
              />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[#2A3B55] bg-[#172235] p-6">
          <h2 className="text-xl font-bold text-[#F5F7FA]">
            Recursos humanos
          </h2>

          <div className="mt-6 space-y-4">
            <MetricRow
              label="Disponibles"
              value={overview.resources.available}
              valueClass="text-[#52E0DC]"
            />

            <MetricRow
              label="No disponibles"
              value={overview.resources.unavailable}
              valueClass="text-red-300"
            />

            <MetricRow
              label="Total"
              value={overview.resources.total}
            />
          </div>
        </article>

        <article className="rounded-2xl border border-[#2A3B55] bg-[#172235] p-6 xl:col-span-3">
          <h2 className="text-xl font-bold text-[#F5F7FA]">
            Estado de tareas
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard
              label="Totales"
              value={overview.tasks.total}
            />

            <StatusCard
              label="Pendientes"
              value={overview.tasks.todo}
            />

            <StatusCard
              label="En progreso"
              value={overview.tasks.inProgress}
            />

            <StatusCard
              label="Completadas"
              value={overview.tasks.completed}
            />
          </div>
        </article>
      </div>
    </section>
  );
}

function KpiCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: number;
  detail?: string;
}) {
  return (
    <article className="rounded-2xl border border-[#2A3B55] bg-[#172235] p-5">
      <p className="text-sm text-[#AAB4C0]">{title}</p>

      <p className="mt-2 text-3xl font-bold text-[#F5F7FA]">
        {value}
      </p>

      {detail && (
        <p className="mt-2 text-sm text-[#AAB4C0]">
          {detail}
        </p>
      )}
    </article>
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
    <div className="rounded-xl border border-[#2A3B55] bg-[#1D2B42] p-4">
      <p className="text-sm text-[#AAB4C0]">{label}</p>

      <p className="mt-2 text-2xl font-bold text-[#F5F7FA]">
        {value}
      </p>
    </div>
  );
}

function MetricRow({
  label,
  value,
  valueClass = 'text-[#F5F7FA]',
}: {
  label: string;
  value: number;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#2A3B55] bg-[#1D2B42] px-4 py-3">
      <span className="text-[#AAB4C0]">{label}</span>

      <span className={`text-xl font-bold ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}