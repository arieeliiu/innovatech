'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Code2,
  MessagesSquare,
  PencilRuler,
  Search,
  UserCheck,
  UsersRound,
  UserX,
} from 'lucide-react';
import {
  addProjectMember,
  getProjects,
  getResources,
  type ResourceSummary,
} from '../../../lib/api';
import { Card, MetricCard } from '../../../components/ui/Card';
import {
  PageTitle,
  primaryPageActionButtonClassName,
} from '../../../components/ui/PageTitle';
import { getUserRoleLabel, USER_ROLE_OPTIONS } from '../../../lib/userRules';
import type { Project } from '../../../types';

const RESOURCES_PER_PAGE = 15;
const resourceRoleOptions = USER_ROLE_OPTIONS.filter((option) =>
  ['MANAGER', 'ARCHITECT', 'DEVELOPER', 'CONSULTANT'].includes(option.value),
);

function getResourceIcon(role: ResourceSummary['role']) {
  if (role === 'ARCHITECT') return <PencilRuler size={20} strokeWidth={1.8} />;
  if (role === 'DEVELOPER') return <Code2 size={20} />;
  return <MessagesSquare size={20} />;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceSummary[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [available, setAvailable] = useState(0);
  const [unavailable, setUnavailable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [assignmentMode, setAssignmentMode] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentMessage, setAssignmentMessage] = useState('');
  const [assigning, setAssigning] = useState(false);

  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('es');

    return resources.filter((resource) => {
      const matchesRole = roleFilter === 'ALL' || resource.role === roleFilter;
      const matchesAvailability =
        availabilityFilter === 'ALL' ||
        resource.availabilityStatus === availabilityFilter;
      const matchesQuery =
        !query ||
        resource.name.toLocaleLowerCase('es').includes(query) ||
        (resource.email ?? '').toLocaleLowerCase('es').includes(query);

      return matchesRole && matchesAvailability && matchesQuery;
    });
  }, [availabilityFilter, resources, roleFilter, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredResources.length / RESOURCES_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedResources = useMemo(
    () =>
      filteredResources.slice(
        (safeCurrentPage - 1) * RESOURCES_PER_PAGE,
        safeCurrentPage * RESOURCES_PER_PAGE,
      ),
    [filteredResources, safeCurrentPage],
  );

  async function loadResources() {
    try {
      setLoading(true);
      setError('');
      const [response, projectsResponse] = await Promise.all([
        getResources(),
        getProjects(),
      ]);
      setResources(response.resources ?? []);
      const projectList =
        projectsResponse.projects ?? projectsResponse.data ?? [];
      setProjects(Array.isArray(projectList) ? projectList : []);
      setAvailable(response.available ?? 0);
      setUnavailable(response.unavailable ?? 0);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudieron cargar los recursos',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadResources);
  }, []);

  function resetPage() {
    setCurrentPage(1);
  }

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );
  function closeAssignmentMode() {
    setAssignmentMode(false);
    setSelectedProjectId('');
    setSelectedResourceIds([]);
    setAssignmentError('');
  }

  function toggleSelectedResource(userId: string) {
    setSelectedResourceIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  }

  async function handleBulkAssignment() {
    if (!selectedProjectId || selectedResourceIds.length === 0) return;

    try {
      setAssigning(true);
      setAssignmentError('');
      setAssignmentMessage('');

      const attemptedResourceIds = [...selectedResourceIds];
      const results = await Promise.allSettled(
        attemptedResourceIds.map((userId) => {
          const resource = resources.find((item) => item.userId === userId);
          return addProjectMember(selectedProjectId, {
            userId,
            projectRole: resource?.role ?? 'DEVELOPER',
          });
        }),
      );
      const assignedCount = results.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      const failedCount = results.length - assignedCount;

      if (assignedCount > 0) {
        setAssignmentMessage(
          `${assignedCount} ${assignedCount === 1 ? 'profesional asignado' : 'profesionales asignados'} a ${selectedProject?.name ?? 'el proyecto'}.`,
        );
      }
      if (failedCount > 0) {
        setSelectedResourceIds(
          attemptedResourceIds.filter(
            (_, index) => results[index].status === 'rejected',
          ),
        );
        setAssignmentError(
          `${failedCount} ${failedCount === 1 ? 'asignación no pudo completarse' : 'asignaciones no pudieron completarse'}.`,
        );
      } else {
        closeAssignmentMode();
      }

      await loadResources();
    } finally {
      setAssigning(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1240px]">
      <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <PageTitle>Gestión de recursos</PageTitle>
        <button
          type="button"
          onClick={() => {
            if (assignmentMode) {
              closeAssignmentMode();
              return;
            }
            setAssignmentMode(true);
            setAssignmentError('');
            setAssignmentMessage('');
          }}
          className={primaryPageActionButtonClassName}
        >
          {assignmentMode ? 'Cancelar asignación' : 'Asignar a proyecto'}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-[14px] border border-danger/30 bg-danger-surface p-4 text-danger">
          {error}
        </div>
      )}

      {assignmentMessage && (
        <div className="mb-6 rounded-[14px] border border-success/30 bg-success-surface p-4 text-success">
          {assignmentMessage}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Profesionales"
          value={resources.length}
          icon={<UsersRound size={20} />}
          variant="decorativeSoft"
          patternPosition="top-left"
        />
        <MetricCard
          label="Disponibles"
          value={available}
          icon={<UserCheck size={20} />}
        />
        <MetricCard
          label="No disponibles"
          value={unavailable}
          icon={<UserX size={20} />}
          variant="decorativeStrong"
          patternPosition="top-right"
          ringTone="mid"
        />
      </div>

      {assignmentMode && (
        <Card className="mb-6 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <label className="min-w-0 flex-1 text-sm font-semibold text-content-strong">
              Proyecto
              <select
                value={selectedProjectId}
                onChange={(event) => {
                  setSelectedProjectId(event.target.value);
                  setSelectedResourceIds([]);
                  setAssignmentError('');
                }}
                className="mt-2 min-h-11 w-full rounded-[10px] border border-theme-border bg-surface px-3 font-normal text-content outline-none focus:border-theme-border-strong"
              >
                <option value="">Selecciona un proyecto activo</option>
                {projects
                  .filter((project) => project.status !== 'DONE')
                  .map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handleBulkAssignment}
              disabled={
                assigning ||
                !selectedProjectId ||
                selectedResourceIds.length === 0
              }
              className="bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {assigning
                ? 'Asignando...'
                : `Asignar${selectedResourceIds.length > 0 ? ` (${selectedResourceIds.length})` : ''}`}
            </button>
          </div>

          <p className="mt-3 text-xs text-content-muted">
            Selecciona los profesionales directamente en la lista y utiliza sus
            filtros para encontrarlos.
          </p>

          {assignmentError && (
            <p className="mt-3 rounded-lg border border-danger/30 bg-danger-surface p-3 text-sm text-danger">
              {assignmentError}
            </p>
          )}
        </Card>
      )}

      <div className="mb-6 flex min-h-12 flex-col overflow-hidden rounded-[14px] border border-theme-border bg-surface shadow-card lg:flex-row lg:items-stretch">
        <label className="flex min-w-0 flex-1 items-center gap-3 px-4">
          <Search size={18} className="shrink-0 text-content-muted" />
          <span className="sr-only">Buscar profesional</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              resetPage();
            }}
            placeholder="Buscar por nombre o correo"
            className="min-h-12 w-full bg-transparent text-content-strong outline-none placeholder:text-content-muted/70"
          />
        </label>

        <label className="flex min-h-12 items-center border-t border-theme-border px-4 lg:border-t-0 lg:border-l">
          <span className="sr-only">Filtrar por rol</span>
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              resetPage();
            }}
            className="min-w-[180px] rounded-[10px] border border-theme-border bg-surface px-3 py-2 text-sm text-content outline-none"
          >
            <option value="ALL">Todos los roles</option>
            {resourceRoleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-h-12 items-center border-t border-theme-border px-4 lg:border-t-0 lg:border-l">
          <span className="sr-only">Filtrar por disponibilidad</span>
          <select
            value={availabilityFilter}
            onChange={(event) => {
              setAvailabilityFilter(event.target.value);
              resetPage();
            }}
            className="min-w-[180px] rounded-[10px] border border-theme-border bg-surface px-3 py-2 text-sm text-content outline-none"
          >
            <option value="ALL">Todos</option>
            <option value="AVAILABLE">Disponibles</option>
            <option value="UNAVAILABLE">No disponibles</option>
          </select>
        </label>

        <span className="flex min-h-12 items-center border-t border-theme-border px-4 text-sm text-content-muted lg:border-t-0 lg:border-l">
          {filteredResources.length}{' '}
          {filteredResources.length === 1 ? 'profesional' : 'profesionales'}
        </span>
      </div>

      {loading && (
        <Card className="p-6 text-center text-content-muted">
          Cargando recursos...
        </Card>
      )}

      {!loading && filteredResources.length === 0 && !error && (
        <Card className="p-6 text-center text-content-muted">
          No hay profesionales que coincidan con la búsqueda o los filtros.
        </Card>
      )}

      {!loading && filteredResources.length > 0 && (
        <>
          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(150px,0.65fr)_minmax(220px,1fr)_180px] items-center gap-4 border-b border-theme-border bg-surface-alt px-5 py-3 text-xs font-semibold uppercase tracking-wide text-content-muted md:grid">
              <span>Profesional</span>
              <span>Rol</span>
              <span>Proyectos activos</span>
              <span>Disponibilidad</span>
            </div>

            <div className="divide-y divide-theme-border">
              {paginatedResources.map((resource) => {
                const alreadyAssigned = resource.projects.some(
                  (project) => project.id === selectedProjectId,
                );
                const selectionDisabled =
                  !selectedProjectId ||
                  !resource.canReceiveNewProjects ||
                  alreadyAssigned;

                return (
                <article
                  key={resource.userId}
                  className={`grid gap-4 px-5 py-4 transition hover:bg-surface-hover md:grid-cols-[minmax(0,1.4fr)_minmax(150px,0.65fr)_minmax(220px,1fr)_180px] md:items-center ${assignmentMode && selectionDisabled ? 'opacity-60' : ''}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {assignmentMode && (
                      <input
                        type="checkbox"
                        aria-label={`Seleccionar a ${resource.name}`}
                        checked={selectedResourceIds.includes(resource.userId)}
                        disabled={selectionDisabled}
                        onChange={() => toggleSelectedResource(resource.userId)}
                        className="h-4 w-4 shrink-0 accent-primary disabled:cursor-not-allowed"
                      />
                    )}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-feature-icon-border bg-feature-icon-background text-feature-icon shadow-sm">
                      {getResourceIcon(resource.role)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-content-strong">
                        {resource.name}
                      </h2>
                      <p className="truncate text-sm text-content-muted">
                        {resource.email ?? 'Sin correo'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="inline-flex rounded-full border border-theme-border bg-surface-alt px-3 py-1 text-sm text-content">
                      {getUserRoleLabel(resource.role)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm text-content">
                      {resource.projects.length === 0
                        ? 'Sin proyectos activos'
                        : resource.projects
                            .map(
                              (project) =>
                                project.name ?? 'Proyecto sin nombre',
                            )
                            .join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-start gap-5">
                    <span
                      className="shrink-0 text-sm font-semibold tabular-nums text-content-muted"
                      aria-label={`${resource.activeProjects} de ${resource.maximumProjects} proyectos activos`}
                    >
                      {resource.activeProjects}/{resource.maximumProjects}
                    </span>
                    <span
                      className={
                        resource.availabilityStatus === 'AVAILABLE'
                          ? 'inline-flex rounded-full bg-success-surface px-3 py-1 text-xs font-semibold text-success'
                          : 'inline-flex rounded-full bg-danger-surface px-3 py-1 text-xs font-semibold text-danger'
                      }
                    >
                      {resource.availabilityStatus === 'AVAILABLE'
                        ? alreadyAssigned && assignmentMode
                          ? 'Ya asignado'
                          : 'Disponible'
                        : 'No disponible'}
                    </span>
                  </div>
                </article>
                );
              })}
            </div>
          </Card>

          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-content-muted">
              Mostrando {(safeCurrentPage - 1) * RESOURCES_PER_PAGE + 1}–
              {Math.min(
                safeCurrentPage * RESOURCES_PER_PAGE,
                filteredResources.length,
              )}{' '}
              de {filteredResources.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safeCurrentPage === 1}
                className="border border-theme-border bg-surface px-4 py-2 text-content-strong transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="min-w-24 text-center text-sm text-content-muted">
                {safeCurrentPage} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={safeCurrentPage === totalPages}
                className="border border-theme-border bg-surface px-4 py-2 text-content-strong transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

    </section>
  );
}
