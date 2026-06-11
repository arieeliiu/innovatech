'use client';

import { useEffect, useState } from 'react';
import {
  getResources,
  type ResourceSummary,
} from '../../../lib/api';

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
    return <p className="text-[#AAB4C0]">Cargando recursos...</p>;
  }

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F5F7FA]">
          Gestión de recursos
        </h1>

        <p className="mt-2 text-[#AAB4C0]">
          Consulta la carga y disponibilidad de los profesionales.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#2A3B55] bg-[#172235] p-5">
          <p className="text-sm text-[#AAB4C0]">Profesionales</p>
          <p className="mt-2 text-3xl font-bold">{resources.length}</p>
        </div>

        <div className="rounded-2xl border border-[#2A3B55] bg-[#172235] p-5">
          <p className="text-sm text-[#AAB4C0]">Disponibles</p>
          <p className="mt-2 text-3xl font-bold text-[#52E0DC]">
            {available}
          </p>
        </div>

        <div className="rounded-2xl border border-[#2A3B55] bg-[#172235] p-5">
          <p className="text-sm text-[#AAB4C0]">No disponibles</p>
          <p className="mt-2 text-3xl font-bold text-red-300">
            {unavailable}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {resources.map((resource) => (
          <article
            key={resource.userId}
            className="rounded-2xl border border-[#2A3B55] bg-[#172235] p-6"
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row">
              <div>
                <h2 className="text-xl font-bold text-[#F5F7FA]">
                  {resource.name}
                </h2>

                <p className="text-sm text-[#AAB4C0]">
                  {resource.email}
                </p>

                <p className="mt-1 text-sm text-[#AAB4C0]">
                  Rol: {resource.role}
                </p>
              </div>

              <div className="text-left md:text-right">
                <span
                  className={
                    resource.availabilityStatus === 'AVAILABLE'
                      ? 'inline-flex rounded-full bg-[#52E0DC]/15 px-3 py-1 text-sm font-semibold text-[#52E0DC]'
                      : 'inline-flex rounded-full bg-red-500/15 px-3 py-1 text-sm font-semibold text-red-300'
                  }
                >
                  {resource.availabilityStatus === 'AVAILABLE'
                    ? 'Disponible'
                    : 'No disponible'}
                </span>

                <p className="mt-2 text-sm text-[#AAB4C0]">
                  {resource.activeProjects}/{resource.maximumProjects}{' '}
                  proyectos activos
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-[#F5F7FA]">
                Proyectos activos
              </p>

              {resource.projects.length === 0 ? (
                <p className="text-sm text-[#AAB4C0]">
                  Sin proyectos activos.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {resource.projects.map((project) => (
                    <span
                      key={project.id}
                      className="rounded-lg border border-[#2A3B55] bg-[#162233] px-3 py-2 text-sm text-[#F5F7FA]"
                    >
                      {project.name ?? 'Proyecto sin nombre'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}