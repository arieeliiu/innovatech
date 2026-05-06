'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, getUsers } from '../../../lib/api';

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

export default function AdminProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
      setError('No se pudieron cargar los proyectos');
    } finally {
      setIsLoading(false);
    }
  }

  function getResponsibleName(responsibleId?: string | null) {
    if (!responsibleId) {
      return 'Sin responsable';
    }

    const responsible = users.find((user) => user.id === responsibleId);

    if (!responsible) {
      return 'Responsable no encontrado';
    }

    return responsible.name || responsible.email || 'Usuario sin nombre';
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Gestión de proyectos
          </h1>

          <p className="mt-2 text-slate-600">
            Todos los proyectos registrados en Innovatech Solutions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/admin/projects/create')}
          className="rounded-lg bg-slate-900 px-5 py-2 font-medium text-white transition hover:bg-slate-700"
        >
          Crear proyecto
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="mt-8 text-slate-600">Cargando proyectos...</p>
      )}

      {!error && !isLoading && projects.length === 0 && (
        <div className="mt-8 rounded-xl bg-white p-6 text-slate-600 shadow">
          No hay proyectos registrados todavía.
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {projects.map((project) => {
          const progress = Math.min(Math.max(project.progress ?? 0, 0), 100);

          const responsibleName = getResponsibleName(
            project.main_responsible_id,
          );

          return (
            <article
              key={project.id}
              className="rounded-xl bg-white p-5 shadow transition hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  {project.name}
                </h2>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {project.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600">
                {project.description}
              </p>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-sm text-slate-700">
                  <span>Avance</span>
                  <span>{progress}%</span>
                </div>

                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-slate-900"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-700">
                <p>
                  <strong>Responsable:</strong> {responsibleName}
                </p>

                <p>
                  <strong>Inicio:</strong> {project.start_date}
                </p>

                <p>
                  <strong>Término:</strong> {project.end_date}
                </p>
              </div>

              <button
                onClick={() => router.push(`/admin/projects/${project.id}`)}
                className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-center text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Ver detalles
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
