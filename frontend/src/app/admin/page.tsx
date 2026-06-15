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
    <div className="space-y-8 text-[#F5F7FA]">
      <div>
        <h1 className="text-3xl font-bold text-[#F5F7FA]">
          Panel de Administrador
        </h1>
        <p className="mt-2 text-[#AAB4C0]">
          Bienvenido al panel de administración de Innovatech Solutions
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[#2A3B55] bg-[#162233] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
            <p className="text-sm text-[#AAB4C0]">Total de Proyectos</p>
            <p className="mt-2 text-3xl font-bold text-[#52e0dc]">
              {projects.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#2A3B55] bg-[#162233] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
            <p className="text-sm text-[#AAB4C0]">Proyectos Activos</p>
            <p className="mt-2 text-3xl font-bold text-[#52e0dc]">
              {activeProjects}
            </p>
          </div>

          <div className="rounded-2xl border border-[#2A3B55] bg-[#162233] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
            <p className="text-sm text-[#AAB4C0]">Proyectos Completados</p>
            <p className="mt-2 text-3xl font-bold text-[#52e0dc]">
              {completedProjects}
            </p>
          </div>

          <div className="rounded-2xl border border-[#2A3B55] bg-[#162233] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
            <p className="text-sm text-[#AAB4C0]">Total de Usuarios</p>
            <p className="mt-2 text-3xl font-bold text-[#52e0dc]">
              {users.length}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#2A3B55] bg-[#171C22] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#F5F7FA]">
                Gestión de Proyectos
              </h2>
              <p className="mt-1 text-sm text-[#AAB4C0]">
                Ver y administrar todos los proyectos
              </p>
            </div>
            <Link
              href="/admin/projects"
              className="rounded-full bg-[#52e0dc] px-4 py-2 text-sm font-semibold text-[#05070A] transition hover:bg-[#43c3cf]"
            >
              Ver proyectos
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2A3B55] bg-[#171C22] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#F5F7FA]">
                Crear Nuevo Proyecto
              </h2>
              <p className="mt-1 text-sm text-[#AAB4C0]">
                Registrar un nuevo proyecto en el sistema
              </p>
            </div>
            <Link
              href="/admin/projects/create"
              className="rounded-full bg-[#52e0dc] px-4 py-2 text-sm font-semibold text-[#05070A] transition hover:bg-[#43c3cf]"
            >
              Crear
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2A3B55] bg-[#171C22] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#F5F7FA]">
                Gestión de Tareas
              </h2>
              <p className="mt-1 text-sm text-[#AAB4C0]">
                Ver y administrar todas las tareas
              </p>
            </div>
            <Link
              href="/admin/tasks"
              className="rounded-full bg-[#52e0dc] px-4 py-2 text-sm font-semibold text-[#05070A] transition hover:bg-[#43c3cf]"
            >
              Ver tareas
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2A3B55] bg-[#171C22] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#F5F7FA]">
                Registrar Usuario
              </h2>
              <p className="mt-1 text-sm text-[#AAB4C0]">
                Agregar nuevos usuarios al sistema
              </p>
            </div>
            <Link
              href="/admin/users/create"
              className="rounded-full bg-[#52e0dc] px-4 py-2 text-sm font-semibold text-[#05070A] transition hover:bg-[#43c3cf]"
            >
              Registrar
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2A3B55] bg-[#171C22] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.22)] md:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#F5F7FA]">
                Usuarios registrados
              </h2>
              <p className="mt-1 text-sm text-[#AAB4C0]">
                Ver y eliminar usuarios existentes
              </p>
            </div>
            <Link
              href="/admin/users"
              className="rounded-full bg-[#52e0dc] px-4 py-2 text-sm font-semibold text-[#05070A] transition hover:bg-[#43c3cf]"
            >
              Ver usuarios
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}