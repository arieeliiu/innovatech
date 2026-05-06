'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createTask,
  createTaskComment,
  getProjectTasks,
  getProjects,
  getUsers,
  updateTaskStatus,
  getTaskById,
  getTaskHistory,
  getTaskComments,
} from '../../../lib/api';
import { formatDateShort } from '../../../lib/date';

type Project = { id: string; name: string };

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
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', responsibleId: '', startDate: '', endDate: '' });

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
  const [editProgress, setEditProgress] = useState<number | ''>('');
  const [commentForm, setCommentForm] = useState({ title: '', description: '' });

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

  async function loadInitialData() {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const [projectsData, usersData] = await Promise.all([getProjects(), getUsers()]);

      const loadedProjects = projectsData.projects ?? [];
      const loadedUsers = usersData.users ?? usersData.data ?? usersData ?? [];

      setProjects(loadedProjects);
      setUsers(loadedUsers);

      if (loadedProjects.length > 0) setSelectedProjectId(loadedProjects[0].id);
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
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) loadTasks(selectedProjectId);
  }, [selectedProjectId]);

  const selectedProject = useMemo(() => projects.find((p) => p.id === selectedProjectId), [projects, selectedProjectId]);

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
      setError(''); setMessage('');
      await createTask(selectedProjectId, { projectId: selectedProjectId, title: form.title, description: form.description, responsibleId: form.responsibleId, startDate: form.startDate, endDate: form.endDate || undefined });
      setForm({ title: '', description: '', responsibleId: '', startDate: '', endDate: '' });
      setShowCreateForm(false); setMessage('Tarea creada correctamente');
      await loadTasks(selectedProjectId);
    } catch {
      setError('No se pudo crear la tarea');
    }
  }

  async function handleChangeStatus(task: Task, newStatus: TaskStatus) {
    if (!selectedProjectId) return;
    try {
      setError(''); setMessage('');
      const currentProgress = task.progress ?? 0;
      const newProgress = newStatus === 'DONE' ? 100 : currentProgress;
      const response = await updateTaskStatus(task.id, { status: newStatus, progress: newProgress, comment: `Cambio de estado a ${newStatus}` });
      upsertTaskInState(response.task ?? { ...task, status: newStatus, progress: newProgress });
      setMessage('Estado actualizado correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado de la tarea');
    }
  }

  async function openTaskModal(task: Task) {
    setSelectedTask(task);
    setEditProgress(task.progress ?? 0);
    setCommentForm({ title: '', description: '' });
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
      upsertTaskInState(response.task ?? { ...selectedTask, progress: normalizedProgress });
      setMessage(response.message ?? 'Cambios guardados correctamente');
      closeTaskModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar los cambios');
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
      setMessage('Comentario agregado correctamente');
      const commentsResp = await getTaskComments(selectedTask.id);
      setTaskComments(commentsResp.comments ?? []);
    } catch {
      setError('No se pudo guardar el comentario');
    } finally {
      setSavingComment(false);
    }
  }

  if (loading) {
    return (
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Tablero de tareas</h1>
        <div className="mt-6 rounded-xl bg-white p-6 text-slate-700 shadow">Cargando proyectos...</div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Tablero de tareas</h1>
        <div className="mt-6 rounded-xl bg-white p-6 text-slate-700 shadow">No hay proyectos disponibles.</div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tablero de tareas</h1>
          <p className="mt-2 text-slate-600">Gestiona todas las tareas asociadas a cada proyecto.</p>
        </div>

        <button type="button" onClick={() => setShowCreateForm(true)} className="rounded-lg bg-slate-900 px-5 py-2 font-medium text-white transition hover:bg-slate-700">+ Nueva tarea</button>
      </div>

      <div className="mt-6 max-w-xl">
        <label className="block text-sm font-medium text-slate-700">Proyecto</label>
        <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none" value={selectedProjectId} onChange={(e)=>setSelectedProjectId(e.target.value)}>
          {projects.map((project)=>(<option key={project.id} value={project.id}>{project.name}</option>))}
        </select>
      </div>

      {selectedProject && (
        <p className="mt-4 text-sm text-slate-600">Proyecto seleccionado:{' '}<span className="font-medium text-slate-900">{selectedProject.name}</span></p>
      )}

      {error && <p className="mt-4 rounded-lg bg-red-100 p-3 text-red-700">{error}</p>}
      {message && <p className="mt-4 rounded-lg bg-green-100 p-3 text-green-700">{message}</p>}

      {showCreateForm && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-900">Crear nueva tarea</h2>
            <button type="button" onClick={()=>setShowCreateForm(false)} className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100">Cerrar</button>
          </div>

          <form onSubmit={handleCreateTask} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Título</label>
              <input className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Descripción</label>
              <textarea className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Responsable</label>
              <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none" value={form.responsibleId} onChange={(e)=>setForm({...form,responsibleId:e.target.value})} required>
                <option value="">Selecciona un responsable</option>
                {users.map((user)=>(<option key={user.id} value={user.id}>{user.name||user.email||'Usuario sin nombre'}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Fecha de inicio</label>
              <input type="date" className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none" value={form.startDate} onChange={(e)=>setForm({...form,startDate:e.target.value})} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Fecha de término</label>
              <input type="date" className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none" value={form.endDate} onChange={(e)=>setForm({...form,endDate:e.target.value})} />
            </div>

            <div className="flex items-end">
              <button type="submit" className="w-full rounded-lg bg-slate-900 px-5 py-2 font-medium text-white transition hover:bg-slate-700">Crear tarea</button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {columns.map((column)=>{
          const columnTasks = tasks.filter((task)=>task.status===column.status);
          return (
            <div key={column.status} className="flex max-h-[650px] min-h-[420px] flex-col rounded-xl bg-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">{column.title}</h2>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">{columnTasks.length}</span>
              </div>

              {loadingTasks ? (
                <p className="rounded-lg bg-white p-4 text-sm text-slate-600 shadow">Cargando tareas...</p>
              ) : columnTasks.length===0 ? (
                <p className="rounded-lg bg-white p-4 text-sm text-slate-500 shadow">No hay tareas en esta columna.</p>
              ) : (
                <div className="space-y-3 overflow-y-auto pr-2">
                  {columnTasks.map((task)=>(
                    <article key={task.id} onClick={() => openTaskModal(task)} className="cursor-pointer rounded-xl bg-white p-4 shadow transition hover:shadow-lg">
                      <h3 className="font-semibold text-slate-900">{task.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{task.description}</p>
                      <div className="mt-3 space-y-1 text-xs text-slate-700">
                        <p><strong>Responsable:</strong> {getResponsibleName(task)}</p>
                        <p><strong>Inicio:</strong> {formatDateShort(task.start_date ?? task.startDate)}</p>
                        <p><strong>Avance:</strong> <span className="font-semibold text-slate-900">{task.progress}%</span></p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                        {task.status!=='TODO' && (<button type="button" onClick={(e)=>{e.stopPropagation(); handleChangeStatus(task,'TODO');}} className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100">Pasar a Por hacer</button>)}
                        {task.status!=='IN_PROGRESS' && (<button type="button" onClick={(e)=>{e.stopPropagation(); handleChangeStatus(task,'IN_PROGRESS');}} className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100">Pasar a En progreso</button>)}
                        {task.status!=='DONE' && (<button type="button" onClick={(e)=>{e.stopPropagation(); handleChangeStatus(task,'DONE');}} className="rounded-lg bg-slate-900 px-3 py-1 text-xs text-white hover:bg-slate-700">Finalizar</button>)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeTaskModal}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedTask.title}</h3>
              <button onClick={closeTaskModal} className="text-lg text-slate-600 hover:text-slate-900">✕</button>
            </div>

            <p className="mt-2 text-sm text-slate-600">{selectedTask.description}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Responsable</p>
                <p className="font-medium text-slate-900">{getResponsibleName(selectedTask)}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Estado</p>
                <p className="font-medium text-slate-900">
                  {selectedTask.status === 'TODO' ? 'Por hacer' : selectedTask.status === 'IN_PROGRESS' ? 'En progreso' : 'Finalizada'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Inicio</p>
                <p className="font-medium text-slate-900">{formatDateShort(selectedTask.start_date ?? selectedTask.startDate)}</p>
              </div>

              {selectedTask.status === 'DONE' && (
                <div>
                  <p className="text-xs text-slate-500">Término</p>
                  <p className="font-medium text-slate-900">{formatDateShort(selectedTask.end_date ?? selectedTask.endDate)}</p>
                </div>
              )}

              <div className="md:col-span-2">
                <p className="text-xs text-slate-500 mb-2">Avance</p>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={100} value={editProgress} onChange={(e) => setEditProgress(Number(e.target.value))} className="flex-1 cursor-pointer" />
                  <div className="flex items-center gap-1">
                    <input type="number" min={0} max={100} value={editProgress} onChange={(e) => setEditProgress(Number(e.target.value))} className="w-16 rounded-lg border border-slate-300 p-1 text-center text-sm" />
                    <span className="text-sm font-medium text-slate-600">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedTask.status !== 'TODO' && (
                <button type="button" onClick={() => { handleChangeStatus(selectedTask, 'TODO'); closeTaskModal(); }} className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100">
                  Mover a Por hacer
                </button>
              )}
              {selectedTask.status !== 'IN_PROGRESS' && (
                <button type="button" onClick={() => { handleChangeStatus(selectedTask, 'IN_PROGRESS'); closeTaskModal(); }} className="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100">
                  Mover a En progreso
                </button>
              )}
              {selectedTask.status !== 'DONE' && (
                <button type="button" onClick={() => { handleChangeStatus(selectedTask, 'DONE'); closeTaskModal(); }} className="rounded-lg bg-slate-900 px-3 py-1 text-xs text-white hover:bg-slate-700">
                  Finalizar
                </button>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">Agregar comentario</p>
              <div className="mt-3 grid gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600">Título</label>
                  <input
                    value={commentForm.title}
                    onChange={(e) => setCommentForm({ ...commentForm, title: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
                    placeholder="Resumen corto del comentario"
                    maxLength={120}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">Descripción</label>
                  <textarea
                    value={commentForm.description}
                    onChange={(e) => setCommentForm({ ...commentForm, description: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
                    placeholder="Escribe el comentario..."
                    maxLength={2000}
                    rows={4}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveComment}
                  disabled={savingComment}
                  className="rounded-lg border border-slate-900 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-900 hover:text-white disabled:opacity-60"
                >
                  {savingComment ? 'Guardando...' : 'Agregar comentario'}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Historial de cambios</p>
                {loadingHistory ? (
                  <p className="mt-2 text-sm text-slate-600">Cargando historial...</p>
                ) : taskHistory && taskHistory.length > 0 ? (
                  <div className="mt-2 max-h-48 space-y-2 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                    {taskHistory.map((h) => (
                      <div key={h.id} className="rounded-lg border-l-2 border-slate-300 bg-white p-2">
                        <p className="text-xs text-slate-500">{new Date(h.created_at).toLocaleString('es-CL')}</p>
                        <p className="mt-1 text-sm text-slate-700">{h.previous_status} → {h.new_status}</p>
                        {h.comment && <p className="mt-1 text-xs text-slate-500">{h.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Sin cambios registrados</p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">Comentarios</p>
                {loadingComments ? (
                  <p className="mt-2 text-sm text-slate-600">Cargando comentarios...</p>
                ) : taskComments && taskComments.length > 0 ? (
                  <div className="mt-2 max-h-48 space-y-2 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                    {taskComments.map((comment) => (
                      <div key={comment.id} className="rounded-lg bg-white p-2 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-slate-900">{comment.title}</p>
                          <p className="shrink-0 text-xs text-slate-500">{new Date(comment.created_at).toLocaleString('es-CL')}</p>
                        </div>
                        <p className="mt-1 text-sm text-slate-700">{comment.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">Sin comentarios</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeTaskModal} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100">Cancelar</button>
              <button onClick={handleSaveProgress} disabled={savingProgress} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60">
                {savingProgress ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
