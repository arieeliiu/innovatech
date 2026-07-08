'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProjectHeader } from '../../../components/projects/ProjectHeader';
import { ProjectMembersPanel } from '../../../components/projects/ProjectMembersPanel';
import { ProjectTaskBoard } from '../../../components/projects/ProjectTaskBoard';
import { ConfirmProjectActionModal } from '../../../components/projects/ConfirmProjectActionModal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { FeedbackAlert } from '../../../components/ui/FeedbackAlert';
import {
  addProjectMember,
  deleteProject,
  finalizeProject,
  getProjectById,
  getProjectMembers,
  getResources,
  getProjectTasks,
  getUsers,
  removeProjectMember,
} from '../../../lib/api';
import type { ResourceSummary } from '../../../lib/api';
import { getStoredRole, getStoredUserId } from '../../../lib/auth';
import { setFlashNotice } from '../../../lib/flashNotice';
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
  const [resources, setResources] = useState<ResourceSummary[]>([]);

  const [error, setError] = useState('');

  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [loadingAddMember, setLoadingAddMember] = useState(false);
  const [memberError, setMemberError] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

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

      const [projectData, tasksData, usersData, membersData, resourcesData] =
        await Promise.all([
          getProjectById(projectId),
          getProjectTasks(projectId),
          getUsers(),
          getProjectMembers(projectId),
          getResources(),
        ]);

      const projectDetail = projectData.project;
      const memberList = membersData.members ?? [];

      const isAssociatedProject =
        projectDetail.main_responsible_id === storedUserId ||
        memberList.some(
          (member: { user_id?: string }) => member.user_id === storedUserId,
        );

      const currentPermissions = getPermissions(currentRole);
      const isAllowed =
        canViewProjectDetail(currentRole, isAssociatedProject) &&
        (projectDetail.status !== 'DONE' ||
          currentPermissions.canViewFinishedProjects);

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
      setResources(resourcesData.resources ?? []);
      setUsers(
        Array.isArray(usersData)
          ? usersData
          : (usersData.users ?? usersData.data ?? []),
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

      const [updatedMembers, updatedResources] = await Promise.all([
        getProjectMembers(projectId),
        getResources(),
      ]);

      setMembers(updatedMembers.members ?? []);
      setResources(updatedResources.resources ?? []);
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
    setMemberToRemove(memberId);
  }

  async function confirmRemoveMember() {
    if (!memberToRemove) return;

    try {
      setIsRemovingMember(true);
      setMemberError('');
      const memberName = getUserName(memberToRemove);
      await removeProjectMember(projectId, memberToRemove);

      const [updatedMembers, updatedResources] = await Promise.all([
        getProjectMembers(projectId),
        getResources(),
      ]);

      setMembers(updatedMembers.members ?? []);
      setResources(updatedResources.resources ?? []);
      setMemberToRemove(null);
      setFeedbackMessage(`${memberName} fue removido del proyecto.`);
    } catch (err) {
      setMemberError(
        err instanceof Error ? err.message : 'Error al remover miembro',
      );
    } finally {
      setIsRemovingMember(false);
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

      setFlashNotice(`El proyecto “${project.name}” fue eliminado correctamente.`);
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

      setFlashNotice(`El proyecto “${project.name}” fue finalizado correctamente.`);
      router.push('/projects');
    } catch (err) {
      setFinalizeError(
        err instanceof Error ? err.message : 'No se pudo finalizar el proyecto',
      );
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

    void Promise.resolve().then(() => {
      setRole(storedRole);
      setCurrentUserId(storedUserId);

      if (projectId) {
        return loadProjectDetail(storedRole, storedUserId);
      }
    });
    // La carga se reinicia al cambiar el identificador de la ruta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (error) {
    return (
      <main>
        <section className="mx-auto w-full max-w-[1240px]">
          <p className="rounded-lg border border-danger/30 bg-danger-surface p-4 text-sm text-danger">
            {error}
          </p>

          <button
            type="button"
            onClick={() => router.push('/projects')}
            className="mt-4 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary-hover"
          >
            Volver a proyectos
          </button>
        </section>
      </main>
    );
  }

  if (!project) {
    return (
      <main>
        <section className="mx-auto w-full max-w-[1240px]">
          <p className="text-content-muted">Cargando proyecto...</p>
        </section>
      </main>
    );
  }

  const isAssociatedProject =
    project.main_responsible_id === currentUserId ||
    members.some((member) => member.user_id === currentUserId);

  const permissions = getPermissions(role);
  const isProjectFinished = project.status === 'DONE';

  const canManageMembers = canManageProjectMembers(role) && !isProjectFinished;
  const canViewMembers = canViewProjectMembers(role, isAssociatedProject);
  const canViewTasks = canViewTaskBoard(role, isAssociatedProject);

  const canDeleteCurrentProject = permissions.canDeleteProject;
  const canFinalizeCurrentProject =
    permissions.canFinalizeProject && !isProjectFinished;

  return (
    <main>
      <section className="mx-auto w-full max-w-[1240px]">
        {feedbackMessage && (
          <FeedbackAlert
            message={feedbackMessage}
            onClose={() => setFeedbackMessage('')}
          />
        )}

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
            resources={resources}
            canManageMembers={canManageMembers}
            showAddMemberForm={showAddMemberForm}
            selectedMemberId={selectedMemberId}
            loadingAddMember={loadingAddMember}
            memberError={memberError}
            onToggleAddMemberForm={() =>
              setShowAddMemberForm(!showAddMemberForm)
            }
            onSelectedMemberChange={setSelectedMemberId}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            getUserName={getUserName}
          />
        )}

        {memberToRemove && (
          <ConfirmDialog
            title="Remover miembro"
            description={`¿Deseas remover a ${getUserName(memberToRemove)} de este proyecto? Podrás volver a asignarlo más adelante.`}
            confirmLabel="Remover miembro"
            loadingLabel="Removiendo..."
            loading={isRemovingMember}
            onCancel={() => setMemberToRemove(null)}
            onConfirm={confirmRemoveMember}
          />
        )}

        {showDeleteModal && canDeleteCurrentProject && (
          <ConfirmProjectActionModal
            title="Eliminar proyecto"
            description={
              <p>
                Para eliminar este proyecto{' '}
                <strong className="text-content-strong">{project.name}</strong>.
              </p>
            }
            confirmationLabel="eliminar"
            confirmationValue={deleteConfirmation}
            error={deleteError}
            isLoading={isDeleting}
            confirmButtonLabel="Confirmar eliminación"
            loadingButtonLabel="Eliminando..."
            variant="danger"
            onConfirmationChange={setDeleteConfirmation}
            onCancel={closeDeleteModal}
            onConfirm={handleDeleteProject}
          />
        )}

        {showFinalizeModal && canFinalizeCurrentProject && (
          <ConfirmProjectActionModal
            title="Finalizar proyecto"
            description={
              <>
                <p>
                  Al finalizar{' '}
                  <strong className="text-content-strong">
                    {project.name}
                  </strong>
                  , se marcará como finalizado y quedará como historial.
                </p>
              </>
            }
            confirmationLabel="finalizar"
            confirmationValue={finalizeConfirmation}
            error={finalizeError}
            isLoading={isFinalizing}
            confirmButtonLabel="Confirmar finalización"
            loadingButtonLabel="Finalizando..."
            variant="warning"
            onConfirmationChange={setFinalizeConfirmation}
            onCancel={closeFinalizeModal}
            onConfirm={handleFinalizeProject}
          />
        )}
        {canViewTasks && (
          <ProjectTaskBoard tasks={tasks} getUserName={getUserName} />
        )}
      </section>
    </main>
  );
}
