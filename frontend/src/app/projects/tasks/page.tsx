'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createTask,
  getProjectTasks,
  getProjectMembers,
  getProjects,
  getUsers,
  updateTaskStatus,
  getTaskById,
  getTaskHistory,
} from '../../../lib/api';
import {
  canManageTasks,
  getStoredRole,
  getStoredUserId,
  isAdminRole,
} from '../../../lib/auth';
import { formatDateShort } from '../../../lib/date';

type Project = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
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
};

const columns: { status: TaskStatus; title: string }[] = [
  { status: 'TODO', title: 'Por hacer' },
  { status: 'IN_PROGRESS', title: 'En progreso' },
  { status: 'DONE', title: 'Finalizadas' },
];

export default function ProjectTasksPage() {
  const [role, setRole] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [editProgress, setEditProgress] = useState<number | ''>('');
  const [newComment, setNewComment] = useState('');

  async function loadInitialData(currentRole: string | null, currentUserId: string | null) {
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

      if (isAdminRole(currentRole) || currentRole === 'gestor' || !currentUserId) {
        setProjects(normalizedProjects);
      } else {
        const visibleProjects = await Promise.all(
          normalizedProjects.map(async (project) => {
            const membersData = await getProjectMembers(project.id);
            const members = membersData.members ?? [];

            const isMember = members.some(
              (member: { user_id?: string }) => member.user_id === currentUserId,
            );

            return isMember || project.main_responsible_id === currentUserId
              ? project
              : null;
          }),
        );

        setProjects(visibleProjects.filter(Boolean) as Project[]);
      }

      setUsers(loadedUsers);

      if (loadedProjects.length > 0) {
        setSelectedProjectId(loadedProjects[0].id);
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

      const data = await getProjectTasks(projectId);

      setTasks(data.tasks ?? []);
    } catch {
      setError('No se pudieron cargar las tareas del proyecto');
    } finally {
      setLoadingTasks(false);
    }
  }

  useEffect(() => {
    const currentRole = getStoredRole();
    const currentUserId = getStoredUserId();

    setRole(currentRole);
    loadInitialData(currentRole, currentUserId);
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadTasks(selectedProjectId);
    }
  }, [selectedProjectId]);

  const selectedProject = useMemo(() => {
    return projects.find((project) => project.id === selectedProjectId);
  }, [projects, selectedProjectId]);

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

    if (!selectedProjectId) {
      setError('Debes seleccionar un proyecto');
      return;
    }

    try {
      setError('');
      setMessage('');

      await createTask(selectedProjectId, {
        projectId: selectedProjectId,
        title: form.title,
        description: form.description,
        responsibleId: form.responsibleId,
        startDate: form.startDate,
        endDate: form.endDate,
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
    } catch {
      setError('No se pudo crear la tarea');
    }
  }

  async function handleChangeStatus(task: Task, newStatus: TaskStatus) {
    if (!selectedProjectId) return;

    try {
      setError('');
      setMessage('');

      await updateTaskStatus(task.id, {
        status: newStatus,
        progress: newStatus === 'DONE' ? 100 : task.progress ?? 0,
        comment: `Cambio de estado a ${newStatus}`,
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

  if (loading) {
    return (
      <section>
        <h1 className="text-3xl font-bold text-slate-900">
          Tablero de tareas
        </h1>

        <div className="mt-6 rounded-xl bg-white p-6 text-slate-700 shadow">
          Cargando proyectos...
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section>
        <h1 className="text-3xl font-bold text-slate-900">
          Tablero de tareas
        </h1>

        <div className="mt-6 rounded-xl bg-white p-6 text-slate-700 shadow">
          No estás asociado a ningún proyecto.
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Tablero de tareas
          </h1>

          <p className="mt-2 text-slate-600">
            Gestiona las tareas asociadas a cada proyecto.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="rounded-lg bg-slate-900 px-5 py-2 font-medium text-white transition hover:bg-slate-700"
        >
          + Nueva tarea
        </button>
      </div>

      <div className="mt-6 max-w-xl">
        <label className="block text-sm font-medium text-slate-700">
          Proyecto
        </label>

        <select
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none"
          value={selectedProjectId}
          onChange={(event) => setSelectedProjectId(event.target.value)}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <p className="mt-4 text-sm text-slate-600">
          Proyecto seleccionado:{' '}
          <span className="font-medium text-slate-900">
            {selectedProject.name}
          </span>
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">{error}</p>
      )}

      {message && (
        <p className="mt-4 rounded-lg bg-green-100 p-3 text-green-700">
          {message}
        </p>
      )}

      {showCreateForm && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Crear nueva tarea
            </h2>

            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
            >
              Cerrar
            </button>
          </div>

          <form onSubmit={handleCreateTask} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Título
              </label>

              <input
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none"
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Descripción
              </label>

              <textarea
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Responsable
              </label>

              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none"
                value={form.responsibleId}
                onChange={(event) =>
                  setForm({ ...form, responsibleId: event.target.value })
                }
                required
              >
                <option value="">Selecciona un responsable</option>

                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email || 'Usuario sin nombre'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Fecha de inicio
              </label>

              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none"
                value={form.startDate}
                onChange={(event) =>
                  setForm({ ...form, startDate: event.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Fecha de término
              </label>

              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none"
                value={form.endDate}
                onChange={(event) =>
                  setForm({ ...form, endDate: event.target.value })
                }
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-5 py-2 font-medium text-white transition hover:bg-slate-700"
              >
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
                className="flex max-h-[650px] min-h-[420px] flex-col rounded-xl bg-slate-200 p-4"
              >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">
                  {column.title}
                </h2>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                  {columnTasks.length}
                </span>
              </div>

              {loadingTasks ? (
                <p className="rounded-lg bg-white p-4 text-sm text-slate-600 shadow">
                  Cargando tareas...
                </p>
              ) : columnTasks.length === 0 ? (
                <p className="rounded-lg bg-white p-4 text-sm text-slate-500 shadow">
                  No hay tareas en esta columna.
                </p>
              ) : (
                <div className="space-y-3 overflow-y-auto pr-2">
                  {columnTasks.map((task) => (
                    <article
                      key={task.id}
                      className="rounded-xl bg-white p-4 shadow"
                    >
                      <h3 className="font-semibold text-slate-900">
                        {task.title}
                      </h3>

                      <p className="mt-2 text-sm text-slate-600">
                        {task.description}
                      </p>

                      <div className="mt-4 space-y-1 text-sm text-slate-700">
                        <p>
                          <strong>Responsable:</strong>{' '}
                          {getResponsibleName(task)}
                        </p>

                        <p>
                          <strong>Avance:</strong> {task.progress}%
                        </p>

                        <p>
                          <strong>Inicio:</strong>{' '}
                          {task.start_date ?? task.startDate}
                        </p>

                        <p>
                          <strong>Término:</strong>{' '}
                          {task.end_date ?? task.endDate}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {task.status !== 'TODO' && (
                          <button
                            type="button"
                            onClick={() => handleChangeStatus(task, 'TODO')}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                          >
                            Pasar a Por hacer
                          </button>
                        )}

                        {task.status !== 'IN_PROGRESS' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleChangeStatus(task, 'IN_PROGRESS')
                            }
                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                          >
                            Pasar a En progreso
                          </button>
                        )}

                        {task.status !== 'DONE' && (
                          <button
                            type="button"
                            onClick={() => handleChangeStatus(task, 'DONE')}
                            className="rounded-lg bg-slate-900 px-3 py-1 text-xs text-white hover:bg-slate-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedTask.title}</h3>
              <button onClick={closeTaskModal} className="text-sm text-slate-600">Cerrar</button>
            </div>

            <p className="mt-2 text-sm text-slate-600">{selectedTask.description}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Responsable</p>
                <p className="font-medium text-slate-900">{getResponsibleName(selectedTask)}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Inicio</p>
                <p className="font-medium text-slate-900">{formatDateShort(selectedTask.start_date ?? selectedTask.startDate)}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Término</p>
                <p className="font-medium text-slate-900">{formatDateShort(selectedTask.end_date ?? selectedTask.endDate)}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Avance</p>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editProgress}
                    onChange={(e) => setEditProgress(Number(e.target.value))}
                    className="w-24 rounded-lg border border-slate-300 p-2"
                  />
                  <span className="text-sm text-slate-600">%</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm text-slate-700">Comentarios</label>
              <textarea value={newComment} onChange={(e)=>setNewComment(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 p-2" placeholder="Agregar comentario" />
            </div>

            {loadingHistory ? (
              <p className="mt-4 text-sm text-slate-600">Cargando historial...</p>
            ) : (
              <div className="mt-4 space-y-2 max-h-40 overflow-auto">
                {taskHistory.map((h) => (
                  <div key={h.id} className="rounded-lg border border-slate-100 p-2">
                    <p className="text-xs text-slate-500">{new Date(h.created_at).toLocaleString()}</p>
                    <p className="text-sm text-slate-700">{h.comment}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeTaskModal} className="rounded-lg border border-slate-300 px-4 py-2">Cancelar</button>
              <button onClick={handleSaveProgress} disabled={savingProgress} className="rounded-lg bg-slate-900 px-4 py-2 text-white">{savingProgress ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}