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

  const activeProjects = projects.filter((p) => (p.status || '').toUpperCase() !== 'DONE').length;
  const completedProjects = projects.filter((p) => (p.status || '').toUpperCase() === 'DONE').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Panel de Administrador</h1>
        <p className="mt-2 text-slate-600">Bienvenido al panel de administración de Innovatech Solutions</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-slate-600">Total de Proyectos</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{projects.length}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-slate-600">Proyectos Activos</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{activeProjects}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-slate-600">Proyectos Completados</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{completedProjects}</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-slate-600">Total de Usuarios</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{users.length}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Gestión de Proyectos</h2>
              <p className="mt-1 text-sm text-slate-600">Ver y administrar todos los proyectos</p>
            </div>
            <Link
              href="/admin/projects"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Ver proyectos
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Crear Nuevo Proyecto</h2>
              <p className="mt-1 text-sm text-slate-600">Registrar un nuevo proyecto en el sistema</p>
            </div>
            <Link
              href="/admin/projects/create"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Crear
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Gestión de Tareas</h2>
              <p className="mt-1 text-sm text-slate-600">Ver y administrar todas las tareas</p>
            </div>
            <Link
              href="/admin/tasks"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Ver tareas
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Registrar Usuario</h2>
              <p className="mt-1 text-sm text-slate-600">Agregar nuevos usuarios al sistema</p>
            </div>
            <Link
              href="/admin/users/create"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Registrar
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Usuarios registrados</h2>
              <p className="mt-1 text-sm text-slate-600">Ver y eliminar usuarios existentes</p>
            </div>
            <Link
              href="/admin/users"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Ver usuarios
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
