'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject, getUsers } from '../../../lib/api';
import { canCreateProjects, getStoredRole } from '../../../lib/auth';
import { PageTitle } from '../../../components/ui/PageTitle';

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
        : (data.users ?? data.data ?? data.items ?? []);

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

  const labelClass = 'block text-sm font-medium text-content-strong';

  const inputClass =
    'mt-1 w-full rounded-lg border border-theme-border bg-surface-alt p-2 text-content-strong outline-none transition placeholder:text-content-muted/60 focus:border-theme-border-strong';

  const dateInputClass = `${inputClass} calendar-themed`;

  if (role && !canCreateProjects(role)) {
    return (
      <section className="mx-auto w-full max-w-[1240px]">
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
        error instanceof Error ? error.message : 'No se pudo crear el proyecto',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1240px]">
      <PageTitle>Crear proyecto</PageTitle>

      <p className="mt-2 text-content-muted">
        Registra un nuevo proyecto en la plataforma.
      </p>

      <form
        onSubmit={handleSubmit}
        className="theme-card-interactive mt-8 max-w-xl space-y-4 rounded-[14px] border border-theme-border bg-surface p-6"
      >
        <div>
          <label className={labelClass}>Nombre</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Descripción</label>
          <textarea
            className={`${inputClass} h-32 resize-none`}
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            maxLength={500}
            required
          />
          <p className="mt-1 text-right text-xs text-content-muted">
            {form.description.length}/500
          </p>
        </div>

        <div>
          <label className={labelClass}>Fecha de inicio</label>
          <input
            type="date"
            className={dateInputClass}
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
          <label className={labelClass}>Fecha de término</label>
          <input
            type="date"
            className={dateInputClass}
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
          <label className={labelClass}>Responsable del proyecto</label>

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
          <p className="rounded-lg border border-danger/30 bg-danger-surface p-3 text-sm text-danger">
            {error}
          </p>
        )}

        {message && (
          <p className="rounded-lg border border-success/30 bg-success-surface p-3 text-sm text-success">
            {message}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || loadingUsers || managers.length === 0}
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Creando...' : 'Crear proyecto'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/projects')}
            className="rounded-lg border border-theme-border bg-surface-alt px-4 py-2 font-medium text-content-strong transition hover:border-theme-border-strong hover:bg-surface-hover"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
