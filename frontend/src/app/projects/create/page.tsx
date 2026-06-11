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

  const labelClass = 'block text-sm font-medium text-[#F5F7FA]';

  const inputClass =
    'mt-1 w-full rounded-lg border border-[#2A3B55] bg-[#162233] p-2 text-[#F5F7FA] outline-none transition placeholder:text-[#AAB4C0]/60 focus:border-[#52E0DC]';

  if (role && !canCreateProjects(role)) {
    return (
      <section>
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
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
      <h1 className="text-3xl font-bold text-[#F5F7FA]">Crear proyecto</h1>

      <p className="mt-2 text-[#AAB4C0]">
        Registra un nuevo proyecto en la plataforma.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-xl space-y-4 rounded-2xl border border-[#2A3B55] bg-[#172235] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
      >
        <div>
          <label className={labelClass}>
            Nombre
          </label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
            required
          />
        </div>

        <div>
          <label className={labelClass}>
            Descripción
          </label>
          <textarea
            className={inputClass}
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            required
          />
        </div>

        <div>
          <label className={labelClass}>
            Fecha de inicio
          </label>
          <input
            type="date"
            className={inputClass}
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
          <label className={labelClass}>
            Fecha de término
          </label>
          <input
            type="date"
            className={inputClass}
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
          <label className={labelClass}>
            Responsable del proyecto
          </label>

          <select
            className={inputClass}
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
            <p className="mt-2 text-sm text-red-300">
              No hay gestores disponibles para asignar como responsable.
            </p>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {message && (
          <p className="rounded-lg border border-[#52E0DC]/30 bg-[#52E0DC]/10 p-3 text-sm text-[#7DEBE8]">
            {message}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || loadingUsers || managers.length === 0}
            className="rounded-lg bg-[#52E0DC] px-4 py-2 font-semibold text-[#171C22] transition hover:bg-[#43C3CF] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Creando...' : 'Crear proyecto'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/projects')}
            className="rounded-lg border border-white/10 bg-[#162233] px-4 py-2 font-medium text-[#F5F7FA] transition hover:border-[#52E0DC]/40 hover:bg-[#1D2B42]"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}