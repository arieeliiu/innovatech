'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  deleteProject,
  finalizeProject,
  getProjectById,
  getProjectTasks,
  getProjectMembers,
  getUsers,
  addProjectMember,
  removeProjectMember,
} from '../../../../lib/api';

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

type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  responsible_id: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  progress: number;
  start_date: string;
  end_date: string;
};

type User = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
};

type ProjectMember = {
  id: string;
  project_id: string;
  user_id: string;
  project_role: string;
  joined_at: string;
  user?: {
    name?: string;
    email?: string;
  };
};

const columns = [
  {
    title: 'Por hacer',
    status: 'TODO',
  },
  {
    title: 'En progreso',
    status: 'IN_PROGRESS',
  },
  {
    title: 'Finalizadas',
    status: 'DONE',
  },
] as const;

export default function AdminProjectDetailPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [error, setError] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeConfirmation, setFinalizeConfirmation] = useState('');
  const [finalizeError, setFinalizeError] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);

  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loadingAddMember, setLoadingAddMember] = useState(false);
  const [memberError, setMemberError] = useState('');

  async function loadProjectDetail() {
    try {
      setError('');

      const [projectData, tasksData, usersData, membersData] = await Promise.all([
        getProjectById(projectId),
        getProjectTasks(projectId),
        getUsers(),
        getProjectMembers(projectId),
      ]);

      setProject(projectData.project);
      setTasks(tasksData.tasks ?? []);
      setMembers(membersData.members ?? []);

      setUsers(
        Array.isArray(usersData)
          ? usersData
          : usersData.users ?? usersData.data ?? [],
      );
    } catch {
      setError('No se pudo cargar el detalle del proyecto');
    }
  }

  function getUserName(userId?: string | null) {
    if (!userId) {
      return 'Sin responsable asignado';
    }

    const usersList = Array.isArray(users) ? users : [];
    const user = usersList.find((item) => item.id === userId);

    if (!user) {
      return 'Usuario no encontrado';
    }

    return user.name || user.email || 'Usuario sin nombre';
  }

  async function handleAddMember() {
    if (!selectedMemberId) {
      setMemberError('Por favor selecciona un usuario');
      return;
    }

    const selectedUser = users.find((user) => user.id === selectedMemberId);
    const userRole = selectedUser?.role || 'DEVELOPER';

    setLoadingAddMember(true);
    setMemberError('');

    try {
      await addProjectMember(projectId, {
        userId: selectedMemberId,
        projectRole: userRole,
      });

      // Reload members
      const updatedMembers = await getProjectMembers(projectId);
      setMembers(updatedMembers.members ?? []);

      // Reset form
      setSelectedMemberId('');
      setShowAddMemberForm(false);
    } catch (err) {
      setMemberError(
        err instanceof Error ? err.message : 'Error al agregar miembro',
      );
    } finally {
      setLoadingAddMember(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (
      !confirm('¿Estás seguro de que deseas remover este miembro del proyecto?')
    ) {
      return;
    }

    try {
      await removeProjectMember(projectId, memberId);

      // Reload members
      const updatedMembers = await getProjectMembers(projectId);
      setMembers(updatedMembers.members ?? []);
    } catch (err) {
      setMemberError(
        err instanceof Error ? err.message : 'Error al remover miembro',
      );
    }
  }

  async function handleDeleteProject() {
    if (!project) return;

    if (deleteConfirmation.trim().toLowerCase() !== 'eliminar') {
      setDeleteError('Debes escribir "eliminar" para confirmar.');
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError('');

      await deleteProject(project.id);

      router.push('/admin/projects');
    } catch {
      setDeleteError('No se pudo eliminar el proyecto');
    } finally {
      setIsDeleting(false);
    }
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setDeleteConfirmation('');
    setDeleteError('');
  }

  async function handleFinalizeProject() {
    if (!project) return;

    if (finalizeConfirmation.trim().toLowerCase() !== 'finalizar') {
      setFinalizeError('Debes escribir "finalizar" para confirmar.');
      return;
    }

    try {
      setIsFinalizing(true);
      setFinalizeError('');

      await finalizeProject(project.id);

      router.push('/admin/projects');
    } catch {
      setFinalizeError('No se pudo finalizar el proyecto');
    } finally {
      setIsFinalizing(false);
    }
  }

  function closeFinalizeModal() {
    setShowFinalizeModal(false);
    setFinalizeConfirmation('');
    setFinalizeError('');
  }

  useEffect(() => {
    if (projectId) {
      loadProjectDetail();
    }
  }, [projectId]);

  if (error) {
    return (
      <section>
        <p className="rounded-lg bg-red-100 p-4 text-red-700">{error}</p>

        <button
          type="button"
          onClick={() => router.push('/admin/projects')}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          Volver a proyectos
        </button>
      </section>
    );
  }

  if (!project) {
    return (
      <section>
        <p className="text-slate-600">Cargando proyecto...</p>
      </section>
    );
  }

  const progress = Math.min(Math.max(project.progress, 0), 100);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.push('/admin/projects')}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow transition hover:bg-slate-50"
        >
          Volver a proyectos
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowFinalizeModal(true)}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Finalizar proyecto
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Eliminar proyecto
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {project.name}
            </h1>

            <p className="mt-2 max-w-3xl text-slate-600">
              {project.description}
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            {project.status}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Fecha de inicio</p>
            <p className="font-medium text-slate-900">
              {project.start_date}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Fecha de término</p>
            <p className="font-medium text-slate-900">{project.end_date}</p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Responsable principal</p>
            <p className="font-medium text-slate-900">
              {getUserName(project.main_responsible_id)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div id="members-section" className="mt-8 rounded-xl bg-white p-6 shadow">
              <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Miembros del proyecto
                </h2>
                <p className="mt-1 text-slate-600">
                  Gestiona los miembros del equipo del proyecto.
                </p>
              </div>

                <button
                  type="button"
                  onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
                >
                  {showAddMemberForm ? 'Cancelar' : '+ Agregar miembro'}
                </button>
            </div>

            {memberError && (
              <div className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">
                {memberError}
              </div>
            )}

            {showAddMemberForm && (
              <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-900">
                      Usuario
                    </label>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
                    >
                      <option value="">Selecciona un usuario</option>
                      {Array.isArray(users) &&
                        users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name || user.email} ({user.role})
                          </option>
                        ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMember}
                    disabled={loadingAddMember}
                    className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {loadingAddMember ? 'Agregando...' : 'Agregar miembro'}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {members.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 p-4 text-slate-500">
                  No hay miembros en este proyecto.
                </p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {getUserName(member.user_id)}
                      </p>
                      <p className="text-sm text-slate-500">
                        Rol: {member.project_role} · Unido: {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.user_id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
      </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Tablero de tareas
          </h2>

          <p className="mt-1 text-slate-600">
            Seguimiento de tareas asociadas al proyecto.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.status === column.status,
          );

          return (
            <div
              key={column.status}
              className="min-h-96 rounded-xl bg-white p-4 shadow"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  {column.title}
                </h3>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnTasks.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    No hay tareas en esta columna.
                  </p>
                )}

                {columnTasks.map((task) => {
                  const taskProgress = Math.min(
                    Math.max(task.progress, 0),
                    100,
                  );

                  return (
                    <article
                      key={task.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                      <h4 className="font-semibold text-slate-900">
                        {task.title}
                      </h4>

                      <p className="mt-2 text-sm text-slate-600">
                        {task.description}
                      </p>

                      <div className="mt-4 text-xs text-slate-600">
                        <p>
                          <strong>Inicio:</strong> {task.start_date}
                        </p>
                        <p>
                          <strong>Término:</strong> {task.end_date}
                        </p>
                        <p>
                          <strong>Responsable:</strong>{' '}
                          {getUserName(task.responsible_id)}
                        </p>
                      </div>

                      <div className="mt-4">
                        <div className="mb-1 flex justify-between text-xs text-slate-600">
                          <span>Avance</span>
                          <span>{taskProgress}%</span>
                        </div>

                        <div className="h-2 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-slate-900"
                            style={{ width: `${taskProgress}%` }}
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900">
              Eliminar proyecto
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              Para eliminar este proyecto{' '}
              <strong className="text-slate-900">{project.name}</strong>,
              escribe <strong className="text-slate-900">eliminar</strong>.
            </p>

            <input
              className="mt-4 w-full rounded-lg border border-slate-300 p-2 text-slate-900 outline-none focus:border-red-500"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              placeholder="Escribe eliminar"
            />

            {deleteError && (
              <p className="mt-3 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={
                  isDeleting ||
                  deleteConfirmation.trim().toLowerCase() !== 'eliminar'
                }
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {isDeleting ? 'Eliminando...' : 'Confirmar eliminación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900">
              Finalizar proyecto
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              Al finalizar <strong className="text-slate-900">{project.name}</strong>, se removerán todos los miembros del proyecto. Esta acción no se puede deshacer.
            </p>

            <p className="mt-3 text-sm text-slate-600">
              Para confirmar, escribe <strong className="text-slate-900">finalizar</strong>.
            </p>

            <input
              className="mt-4 w-full rounded-lg border border-slate-300 p-2 text-slate-900 outline-none focus:border-amber-500"
              value={finalizeConfirmation}
              onChange={(event) => setFinalizeConfirmation(event.target.value)}
              placeholder="Escribe finalizar"
            />

            {finalizeError && (
              <p className="mt-3 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                {finalizeError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeFinalizeModal}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleFinalizeProject}
                disabled={
                  isFinalizing ||
                  finalizeConfirmation.trim().toLowerCase() !== 'finalizar'
                }
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
              >
                {isFinalizing ? 'Finalizando...' : 'Confirmar finalización'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
