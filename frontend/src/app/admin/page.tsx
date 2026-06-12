'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProjects, getUsers } from '../../lib/api';

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

type User = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
};

const statCardClass =
  'rounded-2xl border border-theme-border bg-surface p-6 shadow-card';

const actionCardClass =
  'rounded-2xl border border-theme-border bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:border-theme-border-strong hover:bg-surface-alt';

const actionButtonClass =
  'rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover';

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setError('');
        setIsLoading(true);

        const projectsData = await getProjects();
        const usersData = await getUsers();

        const loadedProjects = projectsData.projects ?? projectsData.data ?? [];
        const loadedUsers = usersData.users ?? usersData.data ?? [];

        setProjects(Array.isArray(loadedProjects) ? loadedProjects : []);
        setUsers(Array.isArray(loadedUsers) ? loadedUsers : []);
      } catch {
        setError('No se pudieron cargar los datos');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const activeProjects = projects.filter(
    (project) => (project.status || '').toUpperCase() !== 'DONE',
  ).length;

  const completedProjects = projects.filter(
    (project) => (project.status || '').toUpperCase() === 'DONE',
  ).length;

  return (
    <div className="space-y-8 text-content">
      <div>
        <h1 className="text-3xl font-bold text-content">
          Panel de Administrador
        </h1>
        <p className="mt-2 text-content-muted">
          Bienvenido al panel de administración de Innovatech Solutions
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger-surface p-4 text-danger">
          {error}
        </div>
      )}

      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className={statCardClass}>
            <p className="text-sm text-content-muted">Total de Proyectos</p>
            <p className="mt-2 text-3xl font-bold text-highlight">
              {projects.length}
            </p>
          </div>

          <div className={statCardClass}>
            <p className="text-sm text-content-muted">Proyectos Activos</p>
            <p className="mt-2 text-3xl font-bold text-highlight">
              {activeProjects}
            </p>
          </div>

          <div className={statCardClass}>
            <p className="text-sm text-content-muted">
              Proyectos Completados
            </p>
            <p className="mt-2 text-3xl font-bold text-highlight">
              {completedProjects}
            </p>
          </div>

          <div className={statCardClass}>
            <p className="text-sm text-content-muted">Total de Usuarios</p>
            <p className="mt-2 text-3xl font-bold text-highlight">
              {users.length}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className={actionCardClass}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-content">
                Gestión de Proyectos
              </h2>
              <p className="mt-1 text-sm text-content-muted">
                Ver y administrar todos los proyectos
              </p>
            </div>
            <Link href="/admin/projects" className={actionButtonClass}>
              Ver proyectos
            </Link>
          </div>
        </div>

        <div className={actionCardClass}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-content">
                Crear Nuevo Proyecto
              </h2>
              <p className="mt-1 text-sm text-content-muted">
                Registrar un nuevo proyecto en el sistema
              </p>
            </div>
            <Link href="/admin/projects/create" className={actionButtonClass}>
              Crear
            </Link>
          </div>
        </div>

        <div className={actionCardClass}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-content">
                Gestión de Tareas
              </h2>
              <p className="mt-1 text-sm text-content-muted">
                Ver y administrar todas las tareas
              </p>
            </div>
            <Link href="/admin/tasks" className={actionButtonClass}>
              Ver tareas
            </Link>
          </div>
        </div>

        <div className={actionCardClass}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-content">
                Registrar Usuario
              </h2>
              <p className="mt-1 text-sm text-content-muted">
                Agregar nuevos usuarios al sistema
              </p>
            </div>
            <Link href="/admin/users/create" className={actionButtonClass}>
              Registrar
            </Link>
          </div>
        </div>

        <div className={`${actionCardClass} md:col-span-2`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-content">
                Usuarios registrados
              </h2>
              <p className="mt-1 text-sm text-content-muted">
                Ver y eliminar usuarios existentes
              </p>
            </div>
            <Link href="/admin/users" className={actionButtonClass}>
              Ver usuarios
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
