'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProjectHeader } from '../../../components/projects/ProjectHeader';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { ProjectMembersPanel } from '../../../components/projects/ProjectMembersPanel';
import { ProjectTaskBoard } from '../../../components/projects/ProjectTaskBoard';
import {
  addProjectMember,
  deleteProject,
  finalizeProject,
  getProjectById,
  getProjectMembers,
  getProjectTasks,
  getUsers,
  removeProjectMember,
} from '../../../lib/api';
import { getStoredRole, getStoredUserId } from '../../../lib/auth';
import {
  canManageProjectMembers,
  canViewProjectDetail,
  canViewProjectMembers,
  canViewTaskBoard,
  getPermissions,
} from '../../../lib/permissions';
import type { Project, ProjectMember, Task, User } from '../../../types';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const [role, setRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);

  const [error, setError] = useState('');

  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loadingAddMember, setLoadingAddMember] = useState(false);
  const [memberError, setMemberError] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeConfirmation, setFinalizeConfirmation] = useState('');
  const [finalizeError, setFinalizeError] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);

  async function loadProjectDetail(
    currentRole: string | null,
    storedUserId: string | null,
  ) {
    try {
      setError('');

      const [projectData, tasksData, usersData, membersData] =
        await Promise.all([
          getProjectById(projectId),
          getProjectTasks(projectId),
          getUsers(),
          getProjectMembers(projectId),
        ]);

      const projectDetail = projectData.project;
      const memberList = membersData.members ?? [];

      const isAssociatedProject =
        projectDetail.main_responsible_id === storedUserId ||
        memberList.some(
          (member: { user_id?: string }) => member.user_id === storedUserId,
        );

      const isAllowed = canViewProjectDetail(
        currentRole,
        isAssociatedProject,
      );

      if (!isAllowed) {
        setError('No tienes acceso a este proyecto');
        setProject(null);
        setTasks([]);
        setUsers([]);
        setMembers([]);
        return;
      }

      setProject(projectDetail);
      setTasks(tasksData.tasks ?? []);
      setMembers(memberList);
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

    const user = users.find((item) => item.id === userId);

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

      const updatedMembers = await getProjectMembers(projectId);

      setMembers(updatedMembers.members ?? []);
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

      router.push('/projects');
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

      router.push('/projects');
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
    const storedRole = getStoredRole();
    const storedUserId = getStoredUserId();

    setRole(storedRole);
    setCurrentUserId(storedUserId);

    if (projectId) {
      loadProjectDetail(storedRole, storedUserId);
    }
  }, [projectId]);

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <section className="mx-auto max-w-6xl">
          <p className="rounded-lg bg-red-100 p-4 text-red-700">{error}</p>

          <button
            type="button"
            onClick={() => router.push('/projects')}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white"
          >
            Volver a proyectos
          </button>
        </section>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <section className="mx-auto max-w-6xl">
          <p className="text-slate-600">Cargando proyecto...</p>
        </section>
      </main>
    );
  }

  const isAssociatedProject =
    project.main_responsible_id === currentUserId ||
    members.some((member) => member.user_id === currentUserId);

  const permissions = getPermissions(role);

  const canManageMembers = canManageProjectMembers(role);
  const canViewMembers = canViewProjectMembers(role, isAssociatedProject);
  const canViewTasks = canViewTaskBoard(role, isAssociatedProject);

  const canDeleteCurrentProject = permissions.canDeleteProject;
  const canFinalizeCurrentProject = permissions.canFinalizeProject;

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-7xl">
        <ProjectHeader
          project={project}
          responsibleName={getUserName(project.main_responsible_id)}
          canFinalizeProject={canFinalizeCurrentProject}
          canDeleteProject={canDeleteCurrentProject}
          onBack={() => router.push('/projects')}
          onFinalize={() => setShowFinalizeModal(true)}
          onDelete={() => setShowDeleteModal(true)}
        />

        {canViewMembers && (
          <ProjectMembersPanel
            members={members}
            users={users}
            canManageMembers={canManageMembers}
            showAddMemberForm={showAddMemberForm}
            selectedMemberId={selectedMemberId}
            loadingAddMember={loadingAddMember}
            memberError={memberError}
            onToggleAddMemberForm={() => setShowAddMemberForm(!showAddMemberForm)}
            onSelectedMemberChange={setSelectedMemberId}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            getUserName={getUserName}
          />
        )}

        {showDeleteModal && canDeleteCurrentProject && (
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

        {showFinalizeModal && canFinalizeCurrentProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900">
                Finalizar proyecto
              </h2>

              <p className="mt-3 text-sm text-slate-600">
                Al finalizar{' '}
                <strong className="text-slate-900">{project.name}</strong>, se
                removerán todos los miembros del proyecto.
              </p>

              <p className="mt-3 text-sm text-slate-600">
                Para confirmar, escribe{' '}
                <strong className="text-slate-900">finalizar</strong>.
              </p>

              <input
                className="mt-4 w-full rounded-lg border border-slate-300 p-2 text-slate-900 outline-none focus:border-amber-500"
                value={finalizeConfirmation}
                onChange={(event) =>
                  setFinalizeConfirmation(event.target.value)
                }
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
        {canViewTasks && (
          <ProjectTaskBoard tasks={tasks} getUserName={getUserName} />
        )}
      </section>
    </main>
  );
}