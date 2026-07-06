'use client';

import { useRef, useState } from 'react';
import { createProject } from '../../lib/api';
import type { User } from '../../types';
import { Card } from '../ui/Card';

const PROJECT_NAME_MAX_LENGTH = 80;

type CreateProjectModalProps = {
  users: User[];
  loadingUsers?: boolean;
  onClose: () => void;
  onCreated: () => Promise<void> | void;
};

function isManagerRole(role?: string) {
  const normalized = role?.trim().toUpperCase();
  return normalized === 'MANAGER' || normalized === 'PROJECT_MANAGER';
}

export function CreateProjectModal({
  users,
  loadingUsers = false,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    managerId: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const managers = users.filter(
    (user) => user.active !== false && isManagerRole(user.role),
  );

  const labelClass = 'block text-sm font-medium text-content-strong';
  const inputClass =
    'mt-1 w-full rounded-lg border border-theme-border bg-surface-alt p-2 text-content-strong outline-none transition placeholder:text-content-muted/60 focus:border-theme-border-strong';

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
    if (savingRef.current) return;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.managerId) {
      setError('Debes seleccionar un responsable del proyecto');
      return;
    }

    try {
      savingRef.current = true;
      setSaving(true);
      setError('');

      await createProject(form);
      await onCreated();
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo crear el proyecto',
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <Card
        as="section"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto p-6 shadow-floating"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="create-project-title"
              className="font-heading text-2xl font-semibold text-content-strong"
            >
              Crear proyecto
            </h2>
            <p className="mt-1 text-sm text-content-muted">
              Registra un nuevo proyecto en la plataforma.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-theme-border bg-surface-alt text-xl text-content-muted transition hover:bg-surface-hover hover:text-content-strong disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className={labelClass}>Nombre</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              maxLength={PROJECT_NAME_MAX_LENGTH}
              required
              autoFocus
            />
            <p className="mt-1 text-right text-xs text-content-muted">
              {form.name.length}/{PROJECT_NAME_MAX_LENGTH}
            </p>
          </div>

          <div>
            <label className={labelClass}>Descripción</label>
            <textarea
              className={`${inputClass} h-28 resize-none`}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Fecha de inicio</label>
              <input
                type="date"
                className={`${inputClass} calendar-themed`}
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
                className={`${inputClass} calendar-themed`}
                value={form.endDate}
                onChange={(event) =>
                  setForm({ ...form, endDate: event.target.value })
                }
                onMouseDown={preventDateTextSelection}
                onClick={openDatePicker}
                required
              />
            </div>
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
              <p className="mt-2 text-sm text-danger">
                No hay gestores disponibles para asignar como responsable.
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-lg border border-danger/30 bg-danger-surface p-3 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-theme-border bg-surface-alt px-4 py-2 font-medium text-content-strong transition hover:border-theme-border-strong hover:bg-surface-hover disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || loadingUsers || managers.length === 0}
              className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Creando...' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
