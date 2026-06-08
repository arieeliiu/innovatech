'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, getUsers } from '../../../lib/api';
import { ProjectCard } from '../../../components/projects/ProjectCard';
import type { Project, User } from '../../../types';

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
  const activeProjects = projects.filter((project) => project.status !== 'DONE');

  const finishedProjects = projects.filter(
    (project) => project.status === 'DONE',
  );
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

      {!error && !isLoading && activeProjects.length > 0 && (
        <section className="mt-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Proyectos activos
            </h2>

            <p className="mt-1 text-slate-600">
              Proyectos en curso o pendientes de ejecución.
            </p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {activeProjects.map((project) => {
              const responsibleName = getResponsibleName(
                project.main_responsible_id,
              );

              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  responsibleName={responsibleName}
                  onViewDetail={() => router.push(`/admin/projects/${project.id}`)}
                />
              );
            })}
          </div>
        </section>
      )}

      {!error && !isLoading && finishedProjects.length > 0 && (
        <section className="mt-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Proyectos finalizados
            </h2>

            <p className="mt-1 text-slate-600">
              Historial de proyectos cerrados.
            </p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {finishedProjects.map((project) => {
              const responsibleName = getResponsibleName(
                project.main_responsible_id,
              );

              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  responsibleName={responsibleName}
                  onViewDetail={() => router.push(`/admin/projects/${project.id}`)}
                />
              );
            })}
          </div>
      </section>
    )}
    </section>
  );
}
