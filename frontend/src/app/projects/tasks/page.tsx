'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createTask,
  deleteTask,
  getProjectTasks,
  getProjectMembers,
  getProjects,
  getUsers,
  updateTaskStatus,
  getTaskById,
  getTaskHistory,
} from '../../../lib/api';
import {
  getStoredRole,
  getStoredUserId,
  isProjectManagerRole,
} from '../../../lib/auth';
import {
  canChangeTaskStatus,
  canCreateTask,
} from '../../../lib/permissions';
import { formatDateShort, formatDateTimeShort } from '../../../lib/date';
import {
  formatTaskStatusText,
  getTaskStatusLabel,
} from '../../../lib/taskStatus';
import {
  PageTitle,
  primaryPageActionButtonClassName,
} from '../../../components/ui/PageTitle';
import type { ProjectMember } from '../../../types';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

type Project = {
  id: string;
  name: string;
  status?: string;
  main_responsible_id?: string;
};
type User = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  active?: boolean;
};

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

type Task = {
  id: string;
  project_id?: string;
  projectId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  progress: number;
  responsible_id?: string;
  responsibleId?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  created_by?: string | null;
};

type TaskHistoryEntry = {
  id: string;
  created_at: string;
  comment?: string;
};

const columns: { status: TaskStatus; title: string }[] = [
  { status: 'TODO', title: 'Por hacer' },
  { status: 'IN_PROGRESS', title: 'En progreso' },
  { status: 'DONE', title: 'Finalizadas' },
];

export default function ProjectTasksPage() {
  const [role, setRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const creatingTaskRef = useRef(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    responsibleId: '',
    startDate: '',
    endDate: '',
  });

  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskHistory, setTaskHistory] = useState<TaskHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const [editProgress, setEditProgress] = useState<number | ''>('');
  const [newComment, setNewComment] = useState('');

  function openDatePicker(event: React.MouseEvent<HTMLInputElement>) {
    const input = event.currentTarget as HTMLInputElement & {
      showPicker?: () => void;
    };

    try {
      input.showPicker?.();
    } catch {
      // Algunos navegadores bloquean showPicker fuera de una interacción.
    }
  }

  function preventDateTextSelection(event: React.MouseEvent<HTMLInputElement>) {
    event.preventDefault();
  }

  async function loadInitialData(
    currentRole: string | null,
    currentUserId: string | null,
  ) {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const [projectsData, usersData] = await Promise.all([
        getProjects(),
        getUsers(),
      ]);

      const loadedProjects = projectsData.projects ?? [];
      const loadedUsers = usersData.users ?? usersData.data ?? usersData ?? [];

      const normalizedProjects = Array.isArray(loadedProjects)
        ? loadedProjects
        : [];

      if (isProjectManagerRole(currentRole)) {
        setProjects(normalizedProjects);
      } else {
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
      }

      setUsers(loadedUsers);

      const activeLoadedProjects = normalizedProjects.filter(
        (project: Project) => project.status !== 'DONE',
      );

      if (activeLoadedProjects.length > 0) {
        setSelectedProjectId(activeLoadedProjects[0].id);
      } else {
        setSelectedProjectId('');
      }
    } catch {
      setError('No se pudieron cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  }

  async function loadTasks(projectId: string) {
    try {
      setLoadingTasks(true);
      setError('');
      setMessage('');

      const [tasksData, membersData] = await Promise.all([
        getProjectTasks(projectId),
        getProjectMembers(projectId),
      ]);
      const loadedMembers = membersData.members ?? [];
      const memberIds = new Set(
        loadedMembers.map((member: ProjectMember) => member.user_id),
      );

      setTasks(tasksData.tasks ?? []);
      setProjectMembers(loadedMembers);
      setForm((current) => {
        if (!isProjectManagerRole(role)) {
          return {
            ...current,
            responsibleId:
              currentUserId && memberIds.has(currentUserId)
                ? currentUserId
                : '',
          };
        }

        return current.responsibleId && !memberIds.has(current.responsibleId)
          ? { ...current, responsibleId: '' }
          : current;
      });
    } catch {
      setError('No se pudieron cargar las tareas del proyecto');
    } finally {
      setLoadingTasks(false);
    }
  }

  useEffect(() => {
    const currentRole = getStoredRole();
    const currentUserId = getStoredUserId();

    void Promise.resolve().then(() => {
      setRole(currentRole);
      setCurrentUserId(currentUserId);
      return loadInitialData(currentRole, currentUserId);
    });
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      void Promise.resolve().then(() => loadTasks(selectedProjectId));
    }
    // La carga se reinicia al cambiar el proyecto seleccionado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const activeProjects = useMemo(
    () => projects.filter((project) => project.status !== 'DONE'),
    [projects],
  );

  const selectedProject = useMemo(() => {
    return activeProjects.find((project) => project.id === selectedProjectId);
  }, [activeProjects, selectedProjectId]);
  const canCreateTasksForProject = canCreateTask(role, Boolean(selectedProject));
  const canChooseResponsible = isProjectManagerRole(role);

  function canUpdateTask(task: Task) {
    const responsibleId = task.responsible_id ?? task.responsibleId;
    return canChangeTaskStatus(role, responsibleId === currentUserId);
  }

  const responsibleUsers = useMemo(() => {
    const memberIds = new Set(projectMembers.map((member) => member.user_id));
    return users.filter(
      (user) => user.active !== false && memberIds.has(user.id),
    );
  }, [projectMembers, users]);
  const currentUser = users.find((user) => user.id === currentUserId);

  function getResponsibleName(task: Task) {
    const responsibleId = task.responsible_id ?? task.responsibleId;

    if (!responsibleId) {
      return 'Sin responsable';
    }

    const user = users.find((item) => item.id === responsibleId);

    if (!user) {
      return 'Responsable no encontrado';
    }

    return user.name || user.email || 'Usuario sin nombre';
  }

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (creatingTaskRef.current) return;

    if (!selectedProjectId) {
      setError('Debes seleccionar un proyecto');
      return;
    }

    try {
      creatingTaskRef.current = true;
      setCreatingTask(true);
      setError('');
      setMessage('');

      await createTask(selectedProjectId, {
        projectId: selectedProjectId,
        title: form.title,
        description: form.description,
        responsibleId: canChooseResponsible
          ? form.responsibleId
          : (currentUserId ?? ''),
        startDate: form.startDate,
        endDate: form.endDate,
      });

      setForm({
        title: '',
        description: '',
        responsibleId: canChooseResponsible ? '' : (currentUserId ?? ''),
        startDate: '',
        endDate: '',
      });

      setShowCreateForm(false);
      setMessage('Tarea creada correctamente');

      await loadTasks(selectedProjectId);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo crear la tarea',
      );
    } finally {
      creatingTaskRef.current = false;
      setCreatingTask(false);
    }
  }

  function canDeleteTask(task: Task) {
    return isProjectManagerRole(role) || task.created_by === currentUserId;
  }

  async function handleDeleteTask() {
    if (!taskToDelete || deletingTask) return;

    try {
      setDeletingTask(true);
      setError('');
      const response = await deleteTask(taskToDelete.id);
      setTasks((current) =>
        current.filter((task) => task.id !== taskToDelete.id),
      );
      setTaskToDelete(null);
      setMessage(response.message ?? 'Tarea eliminada correctamente');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo eliminar la tarea',
      );
    } finally {
      setDeletingTask(false);
    }
  }

  async function handleChangeStatus(task: Task, newStatus: TaskStatus) {
    if (!selectedProjectId) return;

    try {
      setError('');
      setMessage('');

      await updateTaskStatus(task.id, {
        status: newStatus,
        progress: newStatus === 'DONE' ? 100 : (task.progress ?? 0),
        comment: `Cambio de estado a ${getTaskStatusLabel(newStatus)}`,
      });

      await loadTasks(selectedProjectId);
    } catch {
      setError('No se pudo actualizar el estado de la tarea');
    }
  }

  async function openTaskModal(task: Task) {
    setSelectedTask(task);
    setEditProgress(task.progress ?? 0);
    setNewComment('');
    setLoadingHistory(true);

    try {
      const [taskResp, historyResp] = await Promise.all([
        getTaskById(task.id),
        getTaskHistory(task.id),
      ]);

      setSelectedTask(taskResp.task ?? task);
      setTaskHistory(historyResp.history ?? []);
    } catch {
      setTaskHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  function closeTaskModal() {
    setSelectedTask(null);
    setTaskHistory([]);
    setEditProgress('');
    setNewComment('');
  }

  async function handleSaveProgress() {
    if (!selectedTask) return;

    const progressValue = typeof editProgress === 'number' ? editProgress : 0;

    try {
      setSavingProgress(true);

      await updateTaskStatus(selectedTask.id, {
        status: selectedTask.status,
        progress: progressValue,
        comment: newComment || `Actualizó avance a ${progressValue}%`,
      });

      await loadTasks(selectedProjectId);
      closeTaskModal();
    } catch {
      // ignore for now
    } finally {
      setSavingProgress(false);
    }
  }

  const labelClass = 'block text-sm font-medium text-content-strong';

  const inputClass =
    'mt-1 w-full rounded-lg border border-theme-border bg-surface-alt p-2 text-content-strong outline-none transition placeholder:text-content-muted/60 focus:border-theme-border-strong';

  const dateInputClass = `${inputClass} calendar-themed cursor-pointer`;

  const panelClass =
    'theme-card-interactive rounded-[14px] border border-theme-border bg-surface p-6';

  const secondaryButtonClass =
    'rounded-lg border border-theme-border bg-surface-alt px-4 py-2 text-sm font-medium text-content-strong transition hover:border-theme-border-strong hover:bg-surface-hover';

  const primaryButtonClass =
    'rounded-lg bg-primary px-5 py-2 font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50';
  const canUpdateSelectedTask = selectedTask
    ? canUpdateTask(selectedTask)
    : false;

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-[1240px]">
        <PageTitle>Tablero de tareas</PageTitle>

        <div className="theme-card-interactive mt-6 rounded-[14px] border border-theme-border bg-surface p-6 text-content-muted">
          Cargando proyectos...
        </div>
      </section>
    );
  }

  if (activeProjects.length === 0) {
    return (
      <section className="mx-auto w-full max-w-[1240px]">
        <PageTitle>Tablero de tareas</PageTitle>

        <div className="theme-card-interactive mt-6 rounded-[14px] border border-theme-border bg-surface p-6 text-content-muted">
          No tienes proyectos activos disponibles para gestionar tareas.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1240px]">
      <PageTitle>Tablero de tareas</PageTitle>

      <div className="mt-6 flex w-full max-w-xl flex-col items-stretch gap-3 sm:flex-row sm:items-end lg:w-[calc((100%-2rem)/3)] lg:max-w-none">
        <div className="min-w-0 w-full sm:flex-1">
          <label className={`${labelClass} mb-2`}>Proyecto seleccionado</label>

          <select
            className={inputClass}
            value={selectedProjectId}
            onChange={(event) => setSelectedProjectId(event.target.value)}
          >
            {activeProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {canCreateTasksForProject && (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className={`shrink-0 ${primaryPageActionButtonClassName}`}
          >
            + Nueva tarea
          </button>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger-surface p-3 text-sm text-danger">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-4 rounded-lg border border-success/30 bg-success-surface p-3 text-sm text-success">
          {message}
        </p>
      )}

      {showCreateForm && canCreateTasksForProject && (
        <div className={`mt-6 ${panelClass}`}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-heading text-xl font-semibold text-content-strong">
              Crear nueva tarea
            </h2>

            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className={secondaryButtonClass}
            >
              Cerrar
            </button>
          </div>

          <form
            onSubmit={handleCreateTask}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="md:col-span-2">
              <label className={labelClass}>Título</label>

              <input
                className={inputClass}
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Descripción</label>

              <textarea
                className={`${inputClass} h-28 resize-none`}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                maxLength={500}
                required
              />
              <p className="mt-1 text-right text-xs text-content-muted">
                {form.description.length}/500
              </p>
            </div>

            <div>
              <label className={labelClass}>Responsable</label>

              {canChooseResponsible ? (
                <select
                  className={inputClass}
                  value={form.responsibleId}
                  onChange={(event) =>
                    setForm({ ...form, responsibleId: event.target.value })
                  }
                  required
                >
                  <option value="">Selecciona un responsable</option>

                  {responsibleUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email || 'Usuario sin nombre'}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={`${inputClass} cursor-not-allowed opacity-80`}>
                  {currentUser?.name ||
                    currentUser?.email ||
                    'Cuenta actual'}
                </div>
              )}
              {canChooseResponsible && responsibleUsers.length === 0 && (
                <p className="mt-1 text-xs text-danger">
                  Este proyecto no tiene miembros disponibles para asignar.
                </p>
              )}
              {!canChooseResponsible && (
                <p className="mt-1 text-xs text-content-muted">
                  La tarea se asignará automáticamente a tu cuenta.
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Fecha de inicio</label>

              <input
                type="date"
                className={dateInputClass}
                value={form.startDate}
                onChange={(event) =>
                  setForm({ ...form, startDate: event.target.value })
                }
                onMouseDown={preventDateTextSelection}
                onClick={openDatePicker}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Fecha de término</label>

              <input
                type="date"
                className={dateInputClass}
                value={form.endDate}
                onChange={(event) =>
                  setForm({ ...form, endDate: event.target.value })
                }
                min={form.startDate || undefined}
                onMouseDown={preventDateTextSelection}
                onClick={openDatePicker}
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creatingTask}
                className={primaryButtonClass}
              >
                {creatingTask ? 'Creando...' : 'Crear tarea'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.status === column.status,
          );

          return (
            <div
              key={column.status}
              className="theme-card-interactive flex max-h-[650px] min-h-[420px] flex-col rounded-[14px] border border-theme-border bg-surface p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading font-semibold text-content-strong">
                  {column.title}
                </h2>

                <span className="rounded-full border border-theme-border bg-surface-alt px-3 py-1 text-xs font-semibold text-content-strong">
                  {columnTasks.length}
                </span>
              </div>

              {loadingTasks ? (
                <p className="rounded-lg border border-theme-border bg-surface-alt p-4 text-sm text-content-muted">
                  Cargando tareas...
                </p>
              ) : columnTasks.length === 0 ? (
                <p className="rounded-lg border border-theme-border bg-surface-alt p-4 text-sm text-content-muted">
                  No hay tareas en esta columna.
                </p>
              ) : (
                <div className="space-y-3 overflow-y-auto pr-2">
                  {columnTasks.map((task) => (
                    <article
                      key={task.id}
                      onClick={() => openTaskModal(task)}
                      className="relative cursor-pointer rounded-[14px] border border-theme-border bg-surface-alt p-4 transition hover:border-theme-border-strong hover:bg-surface-hover"
                    >
                      {canDeleteTask(task) && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setTaskToDelete(task);
                          }}
                          className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-lg text-content-muted transition hover:bg-danger-surface hover:text-danger"
                          aria-label={`Eliminar tarea ${task.title}`}
                          title="Eliminar tarea"
                        >
                          ×
                        </button>
                      )}

                      <h3 className="pr-8 font-semibold text-content-strong">
                        {task.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 break-words text-sm text-content-muted">
                        {task.description}
                      </p>

                      <div className="mt-4 space-y-1 text-sm text-content-muted">
                        <p>
                          <strong className="text-content-strong">
                            Responsable:
                          </strong>{' '}
                          {getResponsibleName(task)}
                        </p>

                        <p>
                          <strong className="text-content-strong">
                            Avance:
                          </strong>{' '}
                          {task.progress}%
                        </p>

                        <p>
                          <strong className="text-content-strong">
                            Inicio:
                          </strong>{' '}
                          {formatDateShort(
                            task.start_date ?? task.startDate,
                          )}
                        </p>

                        <p>
                          <strong className="text-content-strong">
                            Término:
                          </strong>{' '}
                          {formatDateShort(task.end_date ?? task.endDate)}
                        </p>
                      </div>

                      {canUpdateTask(task) && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {task.status !== 'TODO' && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleChangeStatus(task, 'TODO');
                            }}
                            className="rounded-lg border border-theme-border bg-surface px-3 py-1 text-xs text-content-strong transition hover:border-theme-border-strong hover:bg-surface-hover"
                          >
                            Pasar a Por hacer
                          </button>
                        )}

                        {task.status !== 'IN_PROGRESS' && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleChangeStatus(task, 'IN_PROGRESS');
                            }}
                            className="rounded-lg border border-theme-border bg-surface px-3 py-1 text-xs text-content-strong transition hover:border-theme-border-strong hover:bg-surface-hover"
                          >
                            Pasar a En progreso
                          </button>
                        )}

                        {task.status !== 'DONE' && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleChangeStatus(task, 'DONE');
                            }}
                            className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover"
                          >
                            Finalizar
                          </button>
                        )}
                      </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {taskToDelete && (
        <ConfirmDialog
          title="Eliminar tarea"
          description={`¿Deseas eliminar “${taskToDelete.title}”? También se eliminarán sus comentarios y su historial.`}
          confirmLabel="Eliminar tarea"
          loadingLabel="Eliminando..."
          loading={deletingTask}
          onCancel={() => setTaskToDelete(null)}
          onConfirm={handleDeleteTask}
        />
      )}

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm">
          <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-[14px] border border-theme-border bg-surface p-5 shadow-floating">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-content-strong">
                {selectedTask.title}
              </h3>
              <button
                onClick={closeTaskModal}
                className="text-sm text-content-muted transition hover:text-content-strong"
              >
                Cerrar
              </button>
            </div>

            <p className="mt-2 max-h-20 overflow-y-auto whitespace-pre-wrap break-words pr-1 text-sm text-content-muted">
              {selectedTask.description}
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs text-content-muted">Responsable</p>
                <p className="font-medium text-content-strong">
                  {getResponsibleName(selectedTask)}
                </p>
              </div>

              <div>
                <p className="text-xs text-content-muted">Inicio</p>
                <p className="font-medium text-content-strong">
                  {formatDateShort(
                    selectedTask.start_date ?? selectedTask.startDate,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-content-muted">Término</p>
                <p className="font-medium text-content-strong">
                  {formatDateShort(
                    selectedTask.end_date ?? selectedTask.endDate,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-content-muted">Avance</p>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editProgress}
                    onChange={(e) => setEditProgress(Number(e.target.value))}
                    disabled={!canUpdateSelectedTask}
                    className="w-24 rounded-lg border border-theme-border bg-surface-alt p-2 text-center text-sm text-content-strong outline-none focus:border-theme-border-strong disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <span className="text-sm text-content-muted">%</span>
                </div>
              </div>
            </div>

            {canUpdateSelectedTask && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-content-strong">
                Comentarios
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mt-2 h-20 w-full resize-none rounded-lg border border-theme-border bg-surface-alt p-2 text-content-strong outline-none placeholder:text-content-muted/60 focus:border-theme-border-strong"
                placeholder="Agregar comentario"
                maxLength={500}
              />
              <p className="mt-1 text-right text-xs text-content-muted">
                {newComment.length}/500
              </p>
            </div>
            )}

            {loadingHistory ? (
              <p className="mt-4 text-sm text-content-muted">
                Cargando historial...
              </p>
            ) : (
              <div className="mt-4 space-y-2 max-h-40 overflow-auto">
                {taskHistory.map((h) => (
                  <div
                    key={h.id}
                    className="rounded-lg border border-theme-border bg-surface-alt p-2"
                  >
                    <p className="text-xs text-content-muted">
                      {formatDateTimeShort(h.created_at)}
                    </p>
                    <p className="whitespace-pre-wrap break-words text-sm text-content-strong">
                      {formatTaskStatusText(h.comment)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeTaskModal} className={secondaryButtonClass}>
                Cancelar
              </button>
              {canUpdateSelectedTask && (
                <button
                  onClick={handleSaveProgress}
                  disabled={savingProgress}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingProgress ? 'Guardando...' : 'Guardar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
