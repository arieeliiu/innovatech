'use client';

import { useRef, useState } from 'react';
import { createUser } from '../../lib/api';
import {
  hasValidPasswordLength,
  USER_PASSWORD_MIN_LENGTH,
  USER_ROLE_OPTIONS,
} from '../../lib/userRules';
import { Card } from '../ui/Card';
import { PasswordInput } from '../ui/PasswordInput';

type CreateUserModalProps = {
  onClose: () => void;
  onCreated: () => Promise<void> | void;
};

export function CreateUserModal({
  onClose,
  onCreated,
}: CreateUserModalProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CONSULTANT',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const creatingUserRef = useRef(false);

  const labelClass = 'block text-sm font-medium text-content-strong';
  const inputClass =
    'mt-1 w-full rounded-lg border border-theme-border bg-surface-alt p-2 text-content-strong outline-none transition placeholder:text-content-muted/60 focus:border-theme-border-strong';
  const passwordInputClass =
    'w-full rounded-lg border border-theme-border bg-surface-alt p-2 pr-11 text-content-strong outline-none transition placeholder:text-content-muted/60 focus:border-theme-border-strong';
  const iconButtonClass =
    'absolute right-3 top-1/2 -translate-y-1/2 text-content-muted transition hover:text-content-strong';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creatingUserRef.current) return;

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!hasValidPasswordLength(form.password)) {
      setError(
        `La contraseña debe tener al menos ${USER_PASSWORD_MIN_LENGTH} caracteres`,
      );
      return;
    }

    try {
      creatingUserRef.current = true;
      setCreatingUser(true);
      setError('');

      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      await onCreated();
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo crear el usuario',
      );
    } finally {
      creatingUserRef.current = false;
      setCreatingUser(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !creatingUser) onClose();
      }}
    >
      <Card
        as="section"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-user-title"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto p-6 shadow-floating"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="create-user-title"
              className="font-heading text-2xl font-semibold text-content-strong"
            >
              Registrar usuario
            </h2>
            <p className="mt-1 text-sm text-content-muted">
              Crear una cuenta para un colaborador de Innovatech Solutions.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creatingUser}
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
              required
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Correo electrónico</label>
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Contraseña</label>
              <PasswordInput
                visible={showPassword}
                onVisibleChange={setShowPassword}
                wrapperClassName="relative mt-1"
                inputClassName={passwordInputClass}
                toggleClassName={iconButtonClass}
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                minLength={USER_PASSWORD_MIN_LENGTH}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Confirmar contraseña</label>
              <PasswordInput
                visible={showPassword}
                onVisibleChange={setShowPassword}
                wrapperClassName="relative mt-1"
                inputClassName={passwordInputClass}
                toggleClassName={iconButtonClass}
                visibilityLabel="confirmación de contraseña"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm({ ...form, confirmPassword: event.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Rol</label>
            <select
              className={inputClass}
              value={form.role}
              onChange={(event) =>
                setForm({ ...form, role: event.target.value })
              }
              required
            >
              {USER_ROLE_OPTIONS.map((roleOption) => (
                <option key={roleOption.value} value={roleOption.value}>
                  {roleOption.label}
                </option>
              ))}
            </select>
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
              disabled={creatingUser}
              className="rounded-lg border border-theme-border bg-surface-alt px-4 py-2 font-medium text-content-strong transition hover:border-theme-border-strong hover:bg-surface-hover disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creatingUser}
              className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creatingUser ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
