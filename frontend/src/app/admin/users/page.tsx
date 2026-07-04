'use client';

import { useEffect, useMemo, useState } from 'react';
import { deleteUser, getUsers, updateUser } from '../../../lib/api';
import { getStoredUserId } from '../../../lib/auth';
import {
  getUserRoleLabel,
  hasValidPasswordLength,
  USER_PASSWORD_MIN_LENGTH,
  USER_ROLE_OPTIONS,
} from '../../../lib/userRules';
import { Card } from '../../../components/ui/Card';
import { PageTitle } from '../../../components/ui/PageTitle';

type User = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'CONSULTANT',
    password: '',
  });
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const currentUserId = useMemo(() => getStoredUserId(), []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError('');

      const data = await getUsers();
      const list = data.users ?? data.data ?? [];

      setUsers(Array.isArray(list) ? list : []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudieron cargar los usuarios',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openDeleteModal(user: User) {
    setSelectedUser(user);
    setConfirmText('');
    setDeleteError('');
    setMessage('');
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: (user.role || 'CONSULTANT').toUpperCase(),
      password: '',
    });
    setEditError('');
    setMessage('');
  }

  function closeEditModal() {
    setEditingUser(null);
    setEditForm({
      name: '',
      email: '',
      role: 'CONSULTANT',
      password: '',
    });
    setEditError('');
  }

  function closeDeleteModal() {
    setSelectedUser(null);
    setConfirmText('');
    setDeleteError('');
  }

  async function handleDeleteUser() {
    if (!selectedUser) return;

    if (confirmText.trim().toLowerCase() !== 'eliminar') {
      setDeleteError('Debes escribir "eliminar" para confirmar.');
      return;
    }

    try {
      setDeleting(true);
      setDeleteError('');
      setError('');
      setMessage('');

      await deleteUser(selectedUser.id);

      setMessage('Usuario eliminado correctamente');
      closeDeleteModal();
      await loadUsers();
    } catch (requestError) {
      setDeleteError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo eliminar el usuario',
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleUpdateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingUser) return;

    if (!editForm.name.trim()) {
      setEditError('El nombre es obligatorio');
      return;
    }

    if (!editForm.email.trim()) {
      setEditError('El correo es obligatorio');
      return;
    }

    if (editForm.password && !hasValidPasswordLength(editForm.password)) {
      setEditError(
        `La contraseña debe tener al menos ${USER_PASSWORD_MIN_LENGTH} caracteres`,
      );
      return;
    }

    try {
      setSavingEdit(true);
      setEditError('');
      setError('');
      setMessage('');

      await updateUser(editingUser.id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        ...(editForm.password ? { password: editForm.password } : {}),
      });

      setMessage('Usuario actualizado correctamente');
      closeEditModal();
      await loadUsers();
    } catch (requestError) {
      setEditError(
        requestError instanceof Error
          ? requestError.message
          : 'No se pudo actualizar el usuario',
      );
    } finally {
      setSavingEdit(false);
    }
  }

  const labelClass = 'block text-sm font-medium text-content-strong';

  const inputClass =
    'mt-1 w-full rounded-lg border border-theme-border bg-surface-alt p-2 text-content-strong outline-none transition placeholder:text-content-muted/60 focus:border-theme-border-strong';

  const secondaryButtonClass =
    'rounded-lg border border-theme-border bg-surface-alt px-4 py-2 text-sm font-medium text-content-strong transition hover:border-theme-border-strong hover:bg-surface-hover';

  return (
    <section className="mx-auto w-full max-w-[1240px]">
      <PageTitle>Usuarios registrados</PageTitle>
      <p className="mt-2 text-content-muted">
        Listado completo de cuentas registradas en la plataforma.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger-surface p-3 text-danger">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-4 rounded-lg border border-success/30 bg-success-surface p-3 text-success">
          {message}
        </p>
      )}

      <Card className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-theme-border bg-surface-alt text-content-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {!loading && users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-content-muted"
                >
                  No hay usuarios registrados.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-content-muted"
                >
                  Cargando usuarios...
                </td>
              </tr>
            )}

            {!loading &&
              users.map((user) => {
                const isCurrentUser = user.id === currentUserId;

                return (
                  <tr
                    key={user.id}
                    className="border-b border-theme-border transition hover:bg-surface-hover"
                  >
                    <td className="px-4 py-3 text-content-muted">{user.id}</td>
                    <td className="px-4 py-3 font-medium text-content-strong">
                      {user.name || 'Usuario sin nombre'}
                    </td>
                    <td className="px-4 py-3 text-content-muted">
                      {user.email || 'Sin correo'}
                    </td>
                    <td className="px-4 py-3 text-content-muted">
                      {getUserRoleLabel(user.role)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(user)}
                        className="mr-2 rounded-lg border border-theme-border bg-surface-alt px-3 py-1.5 text-xs font-semibold text-content-strong transition hover:bg-surface-hover"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(user)}
                        disabled={isCurrentUser}
                        className="rounded-lg bg-danger px-3 py-1.5 text-xs font-medium text-danger-foreground transition hover:bg-danger-hover disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isCurrentUser ? 'Tu cuenta' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </Card>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 shadow-floating">
            <h2 className="font-heading text-xl font-bold text-content-strong">
              Eliminar usuario
            </h2>

            <p className="mt-3 text-sm text-content-muted">
              Para eliminar al usuario{' '}
              <strong className="text-content-strong">
                {selectedUser.name || selectedUser.email || selectedUser.id}
              </strong>
              , escribe{' '}
              <strong className="text-content-strong">eliminar</strong>.
            </p>

            <input
              className={inputClass}
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="Escribe eliminar"
            />

            {deleteError && (
              <p className="mt-3 rounded-lg border border-danger/30 bg-danger-surface p-3 text-sm text-danger">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className={secondaryButtonClass}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={
                  deleting || confirmText.trim().toLowerCase() !== 'eliminar'
                }
                className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-danger-foreground transition hover:bg-danger-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Confirmar eliminación'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 shadow-floating">
            <h2 className="font-heading text-xl font-bold text-content-strong">
              Editar usuario
            </h2>

            <p className="mt-2 text-sm text-content-muted">
              Actualiza los datos de{' '}
              <strong className="text-content-strong">
                {editingUser.name || editingUser.email || editingUser.id}
              </strong>
              .
            </p>

            <form onSubmit={handleUpdateUser} className="mt-4 space-y-4">
              <div>
                <label className={labelClass}>Nombre</label>
                <input
                  className={inputClass}
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm({ ...editForm, name: event.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Correo</label>
                <input
                  type="email"
                  className={inputClass}
                  value={editForm.email}
                  onChange={(event) =>
                    setEditForm({ ...editForm, email: event.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Rol</label>
                <select
                  className={inputClass}
                  value={editForm.role}
                  onChange={(event) =>
                    setEditForm({ ...editForm, role: event.target.value })
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

              <div>
                <label className={labelClass}>
                  Nueva contraseña (opcional)
                </label>
                <input
                  type="password"
                  className={inputClass}
                  value={editForm.password}
                  onChange={(event) =>
                    setEditForm({ ...editForm, password: event.target.value })
                  }
                  minLength={USER_PASSWORD_MIN_LENGTH}
                  placeholder="Dejar vacío para no cambiar"
                />
              </div>

              {editError && (
                <p className="rounded-lg border border-danger/30 bg-danger-surface p-3 text-sm text-danger">
                  {editError}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className={secondaryButtonClass}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </section>
  );
}
