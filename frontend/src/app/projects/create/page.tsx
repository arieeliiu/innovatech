'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject, getUsers } from '../../../lib/api';
import { canCreateProjects, getStoredRole } from '../../../lib/auth';

type User = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
};

function isManagerRole(role?: string) {
  const normalized = role?.trim().toUpperCase();
  return normalized === 'MANAGER' || normalized === 'PROJECT_MANAGER';
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    managerId: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);

  const managers = users.filter((user) => isManagerRole(user.role));

  function openDatePicker(event: React.MouseEvent<HTMLInputElement>) {
    const input = event.currentTarget as HTMLInputElement & {
      showPicker?: () => void;
    };

    try {
      input.showPicker?.();
    } catch {
      // Ignore when browser blocks picker APIs.
    }
  }

  function preventDateTextSelection(event: React.MouseEvent<HTMLInputElement>) {
    event.preventDefault();
  }

  async function loadUsers() {
    try {
      setLoadingUsers(true);
      setError('');

      const data = await getUsers();

      const usersList = Array.isArray(data)
        ? data
        : data.users ?? data.data ?? data.items ?? [];

      setUsers(usersList);
    } catch {
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    const currentRole = getStoredRole();
    setRole(currentRole);

    if (!canCreateProjects(currentRole)) {
      router.replace('/projects');
      return;
    }

    loadUsers();
  }, [router]);

  if (role && !canCreateProjects(role)) {
    return (
      <section>
        <p className="rounded-lg bg-red-100 p-4 text-red-700">
          No tienes permisos para crear proyectos.
        </p>
      </section>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.managerId) {
      setError('Debes seleccionar un responsable del proyecto');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      await createProject({
        name: form.name,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        managerId: form.managerId,
      });

      setMessage('Proyecto creado correctamente');

      router.push('/projects');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No se pudo crear el proyecto',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-bold text-slate-900">Crear proyecto</h1>

      <p className="mt-2 text-slate-600">
        Registra un nuevo proyecto en la plataforma.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-xl space-y-4 rounded-xl bg-white p-6 shadow"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nombre
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none focus:border-slate-900"
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Descripción
          </label>
          <textarea
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none focus:border-slate-900"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Fecha de inicio
          </label>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none focus:border-slate-900"
            value={form.startDate}
            onChange={(event) =>
              setForm({ ...form, startDate: event.target.value })
            }
            onMouseDown={preventDateTextSelection}
            onClick={openDatePicker}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Fecha de término
          </label>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none focus:border-slate-900"
            value={form.endDate}
            onChange={(event) =>
              setForm({ ...form, endDate: event.target.value })
            }
            onMouseDown={preventDateTextSelection}
            onClick={openDatePicker}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Responsable del proyecto
          </label>

          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none focus:border-slate-900"
            value={form.managerId}
            onChange={(event) =>
              setForm({ ...form, managerId: event.target.value })
            }
            required
            disabled={loadingUsers}
          >
            <option value="">
              {loadingUsers ? 'Cargando gestores...' : 'Selecciona un gestor'}
            </option>

            {managers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email || 'Usuario sin nombre'}
              </option>
            ))}
          </select>

          {!loadingUsers && managers.length === 0 && (
            <p className="mt-2 text-sm text-red-700">
              No hay gestores disponibles para asignar como responsable.
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || loadingUsers || managers.length === 0}
            className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? 'Creando...' : 'Crear proyecto'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/projects')}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>
        </div>

        {message && <p className="text-green-700">{message}</p>}
        {error && <p className="text-red-700">{error}</p>}
      </form>
    </section>
  );
}