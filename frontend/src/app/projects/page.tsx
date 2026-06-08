'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { getProjectMembers, getProjects, getUsers } from '../../lib/api';
import { getStoredRole, getStoredUserId, isAdminRole } from '../../lib/auth';
import { getPermissions } from '../../lib/permissions';
import type { Project, User } from '../../types';

export default function ProjectsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function loadProjects(
    currentRole: string | null,
    currentUserId: string | null,
  ) {
    try {
      setError('');
      setIsLoading(true);

      const projectsData = await getProjects();
      const usersData = await getUsers();

      const loadedProjects = projectsData.projects ?? projectsData.data ?? [];
      const loadedUsers = usersData.users ?? usersData.data ?? [];

      const normalizedProjects = Array.isArray(loadedProjects)
        ? loadedProjects
        : [];

      const permissions = getPermissions(currentRole);

      if (permissions.projectAccess === 'all') {
        setProjects(normalizedProjects);
      } else if (
        permissions.projectAccess === 'associated' &&
        currentUserId
      ) {
        const visibleProjects = await Promise.all(
          normalizedProjects.map(async (project) => {
            const membersData = await getProjectMembers(project.id);
            const members = membersData.members ?? [];

            const isMember = members.some(
              (member: { user_id?: string }) =>
                member.user_id === currentUserId,
            );

            return isMember || project.main_responsible_id === currentUserId
              ? project
              : null;
          }),
        );

        setProjects(visibleProjects.filter(Boolean) as Project[]);
      } else {
        setProjects([]);
      }

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

  function getProjectRoute(projectId: string) {
    return isAdminRole(role)
      ? `/admin/projects/${projectId}`
      : `/projects/${projectId}`;
  }

  useEffect(() => {
    const currentRole = getStoredRole();
    const currentUserId = getStoredUserId();

    setRole(currentRole);
    loadProjects(currentRole, currentUserId);
  }, []);

  const permissions = getPermissions(role);
  const canCreateProject = permissions.canCreateProject;
  const activeProjects = projects.filter((project) => project.status !== 'DONE');

  const finishedProjects = projects.filter(
    (project) => project.status === 'DONE',
  );

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Gestión de proyectos
            </h1>

            <p className="mt-2 text-slate-600">
              Listado de proyectos registrados en Innovatech Solutions.
            </p>
          </div>

          {canCreateProject && (
            <button
              type="button"
              onClick={() => router.push('/projects/create')}
              className="rounded-lg bg-slate-900 px-5 py-2 font-medium text-white transition hover:bg-slate-700"
            >
              Crear proyecto
            </button>
          )}
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
            No hay proyectos disponibles para tu usuario.
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
                    onViewDetail={() => router.push(getProjectRoute(project.id))}
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
                    onViewDetail={() => router.push(getProjectRoute(project.id))}
                  />
                );
              })}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}