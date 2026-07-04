'use client';

import { useEffect, useState } from 'react';
import { getResources, type ResourceSummary } from '../../../lib/api';
import { Card, MetricCard } from '../../../components/ui/Card';
import { PageTitle } from '../../../components/ui/PageTitle';

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [available, setAvailable] = useState(0);
  const [unavailable, setUnavailable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadResources() {
    try {
      setLoading(true);
      setError('');

      const response = await getResources();

      setResources(response.resources ?? []);
      setAvailable(response.available ?? 0);
      setUnavailable(response.unavailable ?? 0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los recursos',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResources();
  }, []);

  if (loading) {
    return (
      <p className="mx-auto w-full max-w-[1240px] text-content-muted">
        Cargando recursos...
      </p>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1240px]">
      <div className="mb-8">
        <PageTitle>Gestión de recursos</PageTitle>
      </div>

      {error && (
        <div className="mb-6 rounded-[14px] border border-danger/30 bg-danger-surface p-4 text-danger">
          {error}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <MetricCard label="Profesionales" value={resources.length} />
        <MetricCard
          label="Disponibles"
          value={available}
          valueClassName="text-success"
        />
        <MetricCard
          label="No disponibles"
          value={unavailable}
          valueClassName="text-danger"
        />
      </div>

      <div className="space-y-4">
        {resources.map((resource) => (
          <Card as="article" key={resource.userId} className="p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div>
                <h2 className="font-heading text-xl font-bold text-content-strong">
                  {resource.name}
                </h2>

                <p className="text-sm text-content-muted">{resource.email}</p>

                <p className="mt-1 text-sm text-content-muted">
                  Rol: {resource.role}
                </p>
              </div>

              <div className="text-left md:text-right">
                <span
                  className={
                    resource.availabilityStatus === 'AVAILABLE'
                      ? 'inline-flex rounded-full bg-success-surface px-3 py-1 text-sm font-semibold text-success'
                      : 'inline-flex rounded-full bg-danger-surface px-3 py-1 text-sm font-semibold text-danger'
                  }
                >
                  {resource.availabilityStatus === 'AVAILABLE'
                    ? 'Disponible'
                    : 'No disponible'}
                </span>

                <p className="mt-2 text-sm text-content-muted">
                  {resource.activeProjects}/{resource.maximumProjects} proyectos
                  activos
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-content-strong">
                Proyectos activos
              </p>

              {resource.projects.length === 0 ? (
                <p className="text-sm text-content-muted">
                  Sin proyectos activos.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {resource.projects.map((project) => (
                    <span
                      key={project.id}
                      className="rounded-lg border border-theme-border bg-surface-alt px-3 py-2 text-sm text-content"
                    >
                      {project.name ?? 'Proyecto sin nombre'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
