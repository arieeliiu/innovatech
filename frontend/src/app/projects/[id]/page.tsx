'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getProjectById,
  getProjectTasks,
  getProjectMembers,
  getUsers,
} from '../../../lib/api';
import { formatDateShort } from '../../../lib/date';
import {
  getStoredRole,
  getStoredUserId,
  isAdminRole,
} from '../../../lib/auth';

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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  async function loadProjectDetail(
    currentRole: string | null,
    currentUserId: string | null,
  ) {
    try {
      setError('');

      const [projectData, tasksData, usersData, membersData] = await Promise.all([
        getProjectById(projectId),
        getProjectTasks(projectId),
        getUsers(),
        getProjectMembers(projectId),
      ]);

      const projectDetail = projectData.project;
      const memberList = membersData.members ?? [];

      const isAllowed =
        isAdminRole(currentRole) ||
        currentRole === 'gestor' ||
        projectDetail.main_responsible_id === currentUserId ||
        memberList.some(
          (member: { user_id?: string }) => member.user_id === currentUserId,
        );

      if (!isAllowed) {
        setError('No tienes acceso a este proyecto');
        setProject(null);
        setTasks([]);
        setUsers([]);
        return;
      }

      setProject(projectDetail);
      setTasks(tasksData.tasks ?? []);

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

  useEffect(() => {
    const currentRole = getStoredRole();
    const currentUserId = getStoredUserId();

    setRole(currentRole);

    if (projectId) {
      loadProjectDetail(currentRole, currentUserId);
    }
  }, [projectId]);

  useEffect(() => {
    if (role === 'admin' && projectId) {
      router.replace(`/admin/projects/${projectId}`);
    }
  }, [projectId, router, role]);

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

  const progress = Math.min(Math.max(project.progress, 0), 100);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push('/projects')}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow transition hover:bg-slate-50"
          >
            Volver a proyectos
          </button>
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
                {formatDateShort(project.start_date)}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Fecha de término</p>
              <p className="font-medium text-slate-900">{formatDateShort(project.end_date)}</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Responsable principal</p>
              <p className="font-medium text-slate-900">
                {getUserName(project.main_responsible_id)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-1 flex justify-between text-sm text-slate-700">
              <span>Avance general</span>
              <span>{progress}%</span>
            </div>

            <div className="h-3 rounded-full bg-slate-200">
              <div
                className="h-3 rounded-full bg-slate-900"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div>
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
              <section
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
              </section>
            );
          })}
        </div>
      </section>

    </main>
  );
}