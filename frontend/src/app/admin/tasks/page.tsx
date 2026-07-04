'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createTask,
  createTaskComment,
  getProjectMembers,
  getProjectTasks,
  getProjects,
  getUsers,
  updateTaskStatus,
  getTaskById,
  getTaskHistory,
  getTaskComments,
} from '../../../lib/api';
import { formatDateShort } from '../../../lib/date';
import {
  formatTaskStatusText,
  getTaskStatusLabel,
} from '../../../lib/taskStatus';
import { PageTitle } from '../../../components/ui/PageTitle';
import type { ProjectMember } from '../../../types';

type Project = {
  id: string;
  name: string;
  status?: string;
};

type User = { id: string; name?: string; email?: string; role?: string };

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
};

const columns: { status: TaskStatus; title: string }[] = [
  { status: 'TODO', title: 'Por hacer' },
  { status: 'IN_PROGRESS', title: 'En progreso' },
  { status: 'DONE', title: 'Finalizadas' },
];

export default function AdminTasksPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  const [showCreateForm, setShowCreateForm] = useState(false);
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
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [taskComments, setTaskComments] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editProgress, setEditProgress] = useState<number | ''>('');
  const [commentForm, setCommentForm] = useState({
    title: '',
    description: '',
  });

  function upsertTaskInState(updatedTask: Task) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task,
      ),
    );

    setSelectedTask((currentTask) =>
      currentTask && currentTask.id === updatedTask.id
        ? { ...currentTask, ...updatedTask }
        : currentTask,
    );
  }

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

  async function loadInitialData() {
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

      setProjects(loadedProjects);
      setUsers(loadedUsers);

      const activeLoadedProjects = loadedProjects.filter(
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
      setForm((current) =>
        current.responsibleId && !memberIds.has(current.responsibleId)
          ? { ...current, responsibleId: '' }
          : current,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar las tareas del proyecto',
      );
    } finally {
      setLoadingTasks(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) loadTasks(selectedProjectId);
  }, [selectedProjectId]);

  const activeProjects = useMemo(
    () => projects.filter((project) => project.status !== 'DONE'),
    [projects],
  );

  const selectedProject = useMemo(
    () => activeProjects.find((project) => project.id === selectedProjectId),
    [activeProjects, selectedProjectId],
  );

  const responsibleUsers = useMemo(() => {
    const memberIds = new Set(projectMembers.map((member) => member.user_id));
    return users.filter((user) => memberIds.has(user.id));
  }, [projectMembers, users]);

  function getResponsibleName(task: Task) {
    const responsibleId = task.responsible_id ?? task.responsibleId;
    if (!responsibleId) return 'Sin responsable';
    const user = users.find((u) => u.id === responsibleId);
    if (!user) return 'Responsable no encontrado';
    return user.name || user.email || 'Usuario sin nombre';
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProjectId) return setError('Debes seleccionar un proyecto');
    try {
      setError('');
      setMessage('');
      await createTask(selectedProjectId, {
        projectId: selectedProjectId,
        title: form.title,
        description: form.description,
        responsibleId: form.responsibleId,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
      });
      setForm({
        title: '',
        description: '',
        responsibleId: '',
        startDate: '',
        endDate: '',
      });
      setShowCreateForm(false);
      setMessage('Tarea creada correctamente');
      await loadTasks(selectedProjectId);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'No se pudo crear la tarea',
      );
    }
  }

  async function handleChangeStatus(task: Task, newStatus: TaskStatus) {
    if (!selectedProjectId) return;
    try {
      setError('');
      setMessage('');
      const currentProgress = task.progress ?? 0;
      const newProgress = newStatus === 'DONE' ? 100 : currentProgress;
      const response = await updateTaskStatus(task.id, {
        status: newStatus,
        progress: newProgress,
        comment: `Cambio de estado a ${getTaskStatusLabel(newStatus)}`,
      });
      upsertTaskInState(
        response.task ?? { ...task, status: newStatus, progress: newProgress },
      );
      setMessage('Estado actualizado correctamente');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el estado de la tarea',
      );
    }
  }

  async function openTaskModal(task: Task) {
    setSelectedTask(task);
    setEditProgress(task.progress ?? 0);
    setCommentForm({ title: '', description: '' });
    setShowCommentForm(false);
    setShowHistoryModal(false);
    setLoadingHistory(true);
    setLoadingComments(true);
    try {
      const [taskResp, historyResp, commentsResp] = await Promise.all([
        getTaskById(task.id),
        getTaskHistory(task.id),
        getTaskComments(task.id),
      ]);
      setSelectedTask(taskResp.task ?? task);
      setTaskHistory(historyResp.history ?? []);
      setTaskComments(commentsResp.comments ?? []);
    } catch {
      setTaskHistory([]);
      setTaskComments([]);
    } finally {
      setLoadingHistory(false);
      setLoadingComments(false);
    }
  }

  function closeTaskModal() {
    setSelectedTask(null);
    setTaskHistory([]);
    setTaskComments([]);
    setEditProgress('');
    setCommentForm({ title: '', description: '' });
    setShowCommentForm(false);
    setShowHistoryModal(false);
  }

  async function handleSaveProgress() {
    if (!selectedTask || !selectedProjectId) return;
    const progressValue = typeof editProgress === 'number' ? editProgress : 0;
    const normalizedProgress =
      selectedTask.status === 'DONE'
        ? 100
        : progressValue >= 100
          ? 0
          : progressValue;

    if ((selectedTask.progress ?? 0) === normalizedProgress) {
      setError('');
      setMessage('No hay cambios para guardar');
      return;
    }

    try {
      setSavingProgress(true);
      setError('');
      const response = await updateTaskStatus(selectedTask.id, {
        status: selectedTask.status,
        progress: normalizedProgress,
        comment: `Actualizó avance a ${progressValue}%`,
      });
      upsertTaskInState(
        response.task ?? { ...selectedTask, progress: normalizedProgress },
      );
      setMessage(response.message ?? 'Cambios guardados correctamente');
      closeTaskModal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron guardar los cambios',
      );
    } finally {
      setSavingProgress(false);
    }
  }

  async function handleSaveComment() {
    if (!selectedTask || !selectedProjectId) return;

    const title = commentForm.title.trim();
    const description = commentForm.description.trim();

    if (!title || !description) {
      setError('Completa el título y la descripción del comentario');
      return;
    }

    try {
      setSavingComment(true);
      setError('');
      await createTaskComment(selectedTask.id, { title, description });
      setCommentForm({ title: '', description: '' });
      setShowCommentForm(false);
      setMessage('Comentario agregado correctamente');
      const commentsResp = await getTaskComments(selectedTask.id);
      setTaskComments(commentsResp.comments ?? []);
    } catch {
      setError('No se pudo guardar el comentario');
    } finally {
      setSavingComment(false);
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
          No hay proyectos activos disponibles para gestionar tareas.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1240px]">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <PageTitle>Tablero de tareas</PageTitle>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className={primaryButtonClass}
        >
          + Nueva tarea
        </button>
      </div>

      <div className="mt-6 max-w-xl">
        <label className={labelClass}>Proyecto seleccionado</label>
        <select
          className={inputClass}
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          {activeProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
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

      {showCreateForm && (
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
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Descripción</label>
              <textarea
                className={`${inputClass} h-28 resize-none`}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
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
              <select
                className={inputClass}
                value={form.responsibleId}
                onChange={(e) =>
                  setForm({ ...form, responsibleId: e.target.value })
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
              {responsibleUsers.length === 0 && (
                <p className="mt-1 text-xs text-danger">
                  Este proyecto no tiene miembros disponibles para asignar.
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Fecha de inicio</label>
              <input
                type="date"
                className={dateInputClass}
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
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
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                min={form.startDate || undefined}
                onMouseDown={preventDateTextSelection}
                onClick={openDatePicker}
              />
            </div>

            <div className="flex items-end">
              <button type="submit" className={`w-full ${primaryButtonClass}`}>
                Crear tarea
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
                      className="cursor-pointer rounded-[14px] border border-theme-border bg-surface-alt p-4 transition hover:border-theme-border-strong hover:bg-surface-hover"
                    >
                      <h3 className="font-semibold text-content-strong">
                        {task.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 break-words text-sm text-content-muted">
                        {task.description}
                      </p>
                      <div className="mt-3 space-y-1 text-xs text-content-muted">
                        <p>
                          <strong>Responsable:</strong>{' '}
                          {getResponsibleName(task)}
                        </p>
                        <p>
                          <strong>Inicio:</strong>{' '}
                          {formatDateShort(task.start_date ?? task.startDate)}
                        </p>
                        <p>
                          <strong>Avance:</strong>{' '}
                          <span className="font-semibold text-content-strong">
                            {task.progress}%
                          </span>
                        </p>
                      </div>
                      <div
                        className="mt-4 flex flex-wrap gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {task.status !== 'TODO' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
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
                            onClick={(e) => {
                              e.stopPropagation();
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChangeStatus(task, 'DONE');
                            }}
                            className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover"
                          >
                            Finalizar
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm"
          onClick={closeTaskModal}
        >
          <div
            className="max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-y-auto rounded-[14px] border border-theme-border bg-surface p-4 shadow-floating"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="break-words font-heading text-lg font-semibold text-content-strong">
                {selectedTask.title}
              </h3>
              <button
                onClick={closeTaskModal}
                className="text-lg text-content-muted transition hover:text-content-strong"
              >
                ✕
              </button>
            </div>

            <p className="mt-1 max-h-16 overflow-y-auto whitespace-pre-wrap break-words pr-1 text-sm text-content-muted">
              {selectedTask.description}
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div>
                <p className="text-xs text-content-muted">Responsable</p>
                <p className="text-sm font-medium text-content-strong">
                  {getResponsibleName(selectedTask)}
                </p>
              </div>

              <div>
                <p className="text-xs text-content-muted">Estado</p>
                <p className="text-sm font-medium text-content-strong">
                  {getTaskStatusLabel(selectedTask.status)}
                </p>
              </div>

              <div>
                <p className="text-xs text-content-muted">Inicio</p>
                <p className="text-sm font-medium text-content-strong">
                  {formatDateShort(
                    selectedTask.start_date ?? selectedTask.startDate,
                  )}
                </p>
              </div>

              {selectedTask.status === 'DONE' && (
                <div>
                  <p className="text-xs text-content-muted">Término</p>
                  <p className="text-sm font-medium text-content-strong">
                    {formatDateShort(
                      selectedTask.end_date ?? selectedTask.endDate,
                    )}
                  </p>
                </div>
              )}

              <div className="col-span-2 sm:col-span-3">
                <p className="mb-1 text-xs text-content-muted">Avance</p>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={editProgress}
                    onChange={(e) => setEditProgress(Number(e.target.value))}
                    className="flex-1 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editProgress}
                      onChange={(e) => setEditProgress(Number(e.target.value))}
                      className="w-12 rounded-lg border border-theme-border bg-surface-alt p-1 text-center text-xs text-content-strong outline-none focus:border-theme-border-strong"
                    />
                    <span className="text-xs font-medium text-content-muted">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowHistoryModal(false);
                  setShowCommentForm((current) => !current);
                }}
                aria-expanded={showCommentForm}
                aria-controls="task-comment-form"
                className="rounded-lg border border-theme-border bg-surface-alt px-3 py-1 text-xs font-medium text-content-strong transition hover:border-theme-border-strong hover:bg-surface-hover"
              >
                {showCommentForm
                  ? '- Ocultar formulario'
                  : '+ Agregar comentario'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCommentForm(false);
                  setShowHistoryModal(true);
                }}
                className="rounded-lg border border-theme-border bg-surface-alt px-3 py-1 text-xs font-medium text-content-strong transition hover:border-theme-border-strong hover:bg-surface-hover"
              >
                Ver historial
              </button>

              {selectedTask.status !== 'TODO' && (
                <button
                  type="button"
                  onClick={() => {
                    handleChangeStatus(selectedTask, 'TODO');
                    closeTaskModal();
                  }}
                  className="rounded-lg border border-theme-border bg-surface-alt px-3 py-1 text-xs text-content-strong transition hover:border-theme-border-strong hover:bg-surface-hover"
                >
                  Mover a Por hacer
                </button>
              )}
              {selectedTask.status !== 'IN_PROGRESS' && (
                <button
                  type="button"
                  onClick={() => {
                    handleChangeStatus(selectedTask, 'IN_PROGRESS');
                    closeTaskModal();
                  }}
                  className="rounded-lg border border-theme-border bg-surface-alt px-3 py-1 text-xs text-content-strong transition hover:border-theme-border-strong hover:bg-surface-hover"
                >
                  Mover a En progreso
                </button>
              )}
              {selectedTask.status !== 'DONE' && (
                <button
                  type="button"
                  onClick={() => {
                    handleChangeStatus(selectedTask, 'DONE');
                    closeTaskModal();
                  }}
                  className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover"
                >
                  Finalizar
                </button>
              )}
            </div>

            {showCommentForm && (
              <div
                id="task-comment-form"
                className="mt-2 rounded-[10px] border border-theme-border bg-surface-alt p-3"
              >
                <div className="grid gap-2">
                    <div>
                      <label className="block text-xs font-medium text-content-muted">
                        Título
                      </label>
                      <input
                        value={commentForm.title}
                        onChange={(e) =>
                          setCommentForm({
                            ...commentForm,
                            title: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-md border border-theme-border bg-surface px-2 py-1.5 text-sm text-content-strong outline-none placeholder:text-content-muted/60 focus:border-theme-border-strong"
                        placeholder="Resumen corto del comentario"
                        maxLength={120}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-content-muted">
                        Descripción
                      </label>
                      <textarea
                        value={commentForm.description}
                        onChange={(e) =>
                          setCommentForm({
                            ...commentForm,
                            description: e.target.value,
                          })
                        }
                        className="mt-1 h-20 w-full resize-none rounded-md border border-theme-border bg-surface p-2 text-sm text-content-strong outline-none placeholder:text-content-muted/60 focus:border-theme-border-strong"
                        placeholder="Escribe el comentario..."
                        maxLength={500}
                      />
                      <p className="mt-0.5 text-right text-xs text-content-muted">
                        {commentForm.description.length}/500
                      </p>
                    </div>
                </div>
                <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveComment}
                      disabled={savingComment}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
                    >
                      {savingComment ? 'Guardando...' : 'Guardar comentario'}
                    </button>
                </div>
              </div>
            )}

            <div className="mt-3">
              <div>
                <p className="text-sm font-semibold text-content-strong">
                  Comentarios
                </p>
                {loadingComments ? (
                  <p className="mt-2 text-sm text-content-muted">
                    Cargando comentarios...
                  </p>
                ) : taskComments && taskComments.length > 0 ? (
                  <div className="mt-2 max-h-40 space-y-2 overflow-auto rounded-lg border border-theme-border bg-surface-alt p-2">
                    {taskComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-lg border border-theme-border bg-surface p-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-content-strong">
                            {comment.title}
                          </p>
                          <p className="shrink-0 text-xs text-content-muted">
                            {new Date(comment.created_at).toLocaleString(
                              'es-CL',
                            )}
                          </p>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-content-muted">
                          {formatTaskStatusText(comment.description)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-content-muted">
                    Sin comentarios
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button onClick={closeTaskModal} className={secondaryButtonClass}>
                Cancelar
              </button>
              <button
                onClick={handleSaveProgress}
                disabled={savingProgress}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProgress ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>

          {showHistoryModal && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
              onClick={(event) => {
                event.stopPropagation();
                setShowHistoryModal(false);
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="task-history-title"
                className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-hidden rounded-[14px] border border-theme-border bg-surface p-5 shadow-floating"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-3">
                  <h4
                    id="task-history-title"
                    className="font-heading text-lg font-semibold text-content-strong"
                  >
                    Historial de cambios
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowHistoryModal(false)}
                    className="text-lg text-content-muted transition hover:text-content-strong"
                    aria-label="Cerrar historial"
                  >
                    ✕
                  </button>
                </div>

                {loadingHistory ? (
                  <p className="mt-4 text-sm text-content-muted">
                    Cargando historial...
                  </p>
                ) : taskHistory && taskHistory.length > 0 ? (
                  <div className="mt-4 max-h-[60dvh] space-y-2 overflow-y-auto pr-2">
                    {taskHistory.map((h) => (
                      <div
                        key={h.id}
                        className="rounded-lg border border-theme-border bg-surface-alt p-3"
                      >
                        <p className="text-xs text-content-muted">
                          {new Date(h.created_at).toLocaleString('es-CL')}
                        </p>
                        <p className="mt-1 text-sm font-medium text-content-strong">
                          {getTaskStatusLabel(h.previous_status)} →{' '}
                          {getTaskStatusLabel(h.new_status)}
                        </p>
                        {h.comment && (
                          <p className="mt-1 text-sm text-content-muted">
                            {formatTaskStatusText(h.comment)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-content-muted">
                    Sin cambios registrados
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
