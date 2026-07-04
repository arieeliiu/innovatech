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
import { ProjectHeader } from '../../../../components/projects/ProjectHeader';
import { ProjectMembersPanel } from '../../../../components/projects/ProjectMembersPanel';
import { ProjectTaskBoard } from '../../../../components/projects/ProjectTaskBoard';
import { ConfirmProjectActionModal } from '../../../../components/projects/ConfirmProjectActionModal';
import type { Project, ProjectMember, Task, User } from '../../../../types';

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

      const [projectData, tasksData, usersData, membersData] =
        await Promise.all([
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
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'No se pudo eliminar el proyecto',
      );
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
    if (projectId) {
      loadProjectDetail();
    }
  }, [projectId]);

  if (error) {
    return (
      <section className="mx-auto w-full max-w-[1240px]">
        <p className="rounded-lg border border-danger/30 bg-danger-surface p-4 text-sm text-danger">
          {error}
        </p>

        <button
          type="button"
          onClick={() => router.push('/admin/projects')}
          className="mt-4 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary-hover"
        >
          Volver a proyectos
        </button>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="mx-auto w-full max-w-[1240px]">
        <p className="text-content-muted">Cargando proyecto...</p>
      </section>
    );
  }

  const isProjectFinished = project.status === 'DONE';

  return (
    <section className="mx-auto w-full max-w-[1240px]">
      <ProjectHeader
        project={project}
        responsibleName={getUserName(project.main_responsible_id)}
        canFinalizeProject={!isProjectFinished}
        canDeleteProject
        onBack={() => router.push('/admin/projects')}
        onFinalize={() => setShowFinalizeModal(true)}
        onDelete={() => setShowDeleteModal(true)}
      />

      <ProjectMembersPanel
        members={members}
        users={users}
        canManageMembers={!isProjectFinished}
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

      <ProjectTaskBoard tasks={tasks} getUserName={getUserName} />

      {showDeleteModal && (
        <ConfirmProjectActionModal
          title="Eliminar proyecto"
          description={
            <>
              Para eliminar este proyecto{' '}
              <strong className="text-content-strong">{project.name}</strong>,
              escribe <strong className="text-content-strong">eliminar</strong>.
            </>
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

      {showFinalizeModal && !isProjectFinished && (
        <ConfirmProjectActionModal
          title="Finalizar proyecto"
          description={
            <>
              Al finalizar este proyecto{' '}
              <strong className="text-content-strong">{project.name}</strong>,
              se marcará como finalizado y quedará como historial.
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
    </section>
  );
}
