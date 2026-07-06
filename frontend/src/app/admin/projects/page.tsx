'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Clock3 } from 'lucide-react';
import { getProjects, getUsers } from '../../../lib/api';
import { ProjectCard } from '../../../components/projects/ProjectCard';
import { CreateProjectModal } from '../../../components/projects/CreateProjectModal';
import { Card } from '../../../components/ui/Card';
import { FeedbackAlert } from '../../../components/ui/FeedbackAlert';
import {
  PageTitle,
  primaryPageActionButtonClassName,
} from '../../../components/ui/PageTitle';
import type { Project, User } from '../../../types';
import { takeFlashNotice } from '../../../lib/flashNotice';

const projectPatternPositions = [
  'top-left',
  'bottom-right-soft',
  'resources-rings',
] as const;

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projectView, setProjectView] = useState<'active' | 'finished'>(
    'active',
  );

  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [flashMessage, setFlashMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    void Promise.resolve().then(() => {
      setShowCreateModal(
        new URLSearchParams(window.location.search).get('create') === '1',
      );
      return loadData();
    });
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => setFlashMessage(takeFlashNotice()));
  }, []);
  const activeProjects = projects.filter(
    (project) => project.status !== 'DONE',
  );

  const finishedProjects = projects.filter(
    (project) => project.status === 'DONE',
  );
  const visibleProjects =
    projectView === 'active' ? activeProjects : finishedProjects;

  return (
    <section className="mx-auto w-full max-w-[1240px]">
      {flashMessage && (
        <FeedbackAlert
          message={flashMessage}
          onClose={() => setFlashMessage('')}
        />
      )}

      <header className="flex flex-col justify-between gap-4 pt-3 pb-4 md:flex-row md:items-center">
        <PageTitle>Gestión de proyectos</PageTitle>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className="inline-flex rounded-full border border-theme-border bg-surface-alt p-1"
            role="group"
            aria-label="Filtrar proyectos"
          >
            <button
              type="button"
              onClick={() => setProjectView('active')}
              aria-pressed={projectView === 'active'}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition ${
                projectView === 'active'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-content-muted hover:bg-surface-hover hover:text-content-strong'
              }`}
            >
              <Clock3 size={14} />
              Activos
            </button>

            <button
              type="button"
              onClick={() => setProjectView('finished')}
              aria-pressed={projectView === 'finished'}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition ${
                projectView === 'finished'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-content-muted hover:bg-surface-hover hover:text-content-strong'
              }`}
            >
              <Check size={14} />
              Finalizados
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className={primaryPageActionButtonClassName}
          >
            Crear proyecto
          </button>
        </div>
      </header>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger-surface p-3 text-danger">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="mt-8 text-content-muted">Cargando proyectos...</p>
      )}

      {!error && !isLoading && projects.length === 0 && (
        <Card className="mt-8 p-6 text-content-muted">
          No hay proyectos registrados todavía.
        </Card>
      )}

      {!error && !isLoading && projects.length > 0 && (
        <section className="mt-6">
          {visibleProjects.length === 0 ? (
            <Card className="p-6 text-content-muted">
              No hay proyectos en esta categoría.
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {visibleProjects.map((project, index) => {
                const responsibleName = getResponsibleName(
                  project.main_responsible_id,
                );
                const row = Math.floor(index / 2);
                const column = index % 2;
                const useMutedSurface = (row + column) % 2 === 0;
                const patternPosition =
                  projectPatternPositions[
                    Math.floor(index / 2) % projectPatternPositions.length
                  ];

                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    responsibleName={responsibleName}
                    variant={
                      useMutedSurface
                        ? row % 2 === 0
                          ? 'decorativeSoft'
                          : 'decorativeStrong'
                        : 'surface'
                    }
                    patternPosition={patternPosition}
                    onViewDetail={() =>
                      router.push(`/admin/projects/${project.id}`)
                    }
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {showCreateModal && (
        <CreateProjectModal
          users={users}
          loadingUsers={isLoading}
          onClose={() => {
            setShowCreateModal(false);
            if (
              new URLSearchParams(window.location.search).get('create') === '1'
            ) {
              router.replace('/admin/projects');
            }
          }}
          onCreated={async () => {
            await loadData();
            setFlashMessage('Proyecto creado correctamente');
          }}
        />
      )}
    </section>
  );
}
