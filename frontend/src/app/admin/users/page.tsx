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

  const labelClass = 'block text-sm font-medium text-[#F5F7FA]';

  const inputClass =
    'mt-1 w-full rounded-lg border border-[#2A3B55] bg-[#162233] p-2 text-[#F5F7FA] outline-none transition placeholder:text-[#AAB4C0]/60 focus:border-[#52E0DC]';

  const secondaryButtonClass =
    'rounded-lg border border-white/10 bg-[#162233] px-4 py-2 text-sm font-medium text-[#F5F7FA] transition hover:border-[#52E0DC]/40 hover:bg-[#1D2B42]';

  return (
    <section>
      <h1 className="text-3xl font-bold text-[#F5F7FA]">Usuarios registrados</h1>
      <p className="mt-2 text-[#AAB4C0]">Listado completo de cuentas registradas en la plataforma.</p>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-300">{error}</p>
      )}

      {message && (
        <p className="mt-4 rounded-lg border border-[#52E0DC]/30 bg-[#52E0DC]/10 p-3 text-[#7DEBE8]">{message}</p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#2A3B55] bg-[#172235] shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#2A3B55] bg-[#162233] text-[#AAB4C0]">
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
                <td colSpan={5} className="px-4 py-6 text-center text-[#AAB4C0]">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#AAB4C0]">
                  Cargando usuarios...
                </td>
              </tr>
            )}

            {!loading &&
              users.map((user) => {
                const isCurrentUser = user.id === currentUserId;

                return (
                  <tr key={user.id} className="border-b border-[#2A3B55] transition hover:bg-[#1D2B42]">
                    <td className="px-4 py-3 text-[#AAB4C0]">{user.id}</td>
                    <td className="px-4 py-3 font-medium text-[#F5F7FA]">
                      {user.name || 'Usuario sin nombre'}
                    </td>
                    <td className="px-4 py-3 text-[#AAB4C0]">{user.email || 'Sin correo'}</td>
                    <td className="px-4 py-3 text-[#AAB4C0]">{getUserRoleLabel(user.role)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(user)}
                        className="mr-2 rounded-lg border border-[#52E0DC]/30 bg-[#52E0DC]/10 px-3 py-1.5 text-xs font-semibold text-[#52E0DC] transition hover:bg-[#52E0DC] hover:text-[#171C22]"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(user)}
                        disabled={isCurrentUser}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isCurrentUser ? 'Tu cuenta' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2A3B55] bg-[#172235] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-bold text-[#F5F7FA]">Eliminar usuario</h2>

            <p className="mt-3 text-sm text-[#AAB4C0]">
              Para eliminar al usuario{' '}
              <strong className="text-[#F5F7FA]">
                {selectedUser.name || selectedUser.email || selectedUser.id}
              </strong>
              , escribe <strong className="text-[#F5F7FA]">eliminar</strong>.
            </p>

            <input
              className={inputClass}
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="Escribe eliminar"
            />

            {deleteError && (
              <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
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
                disabled={deleting || confirmText.trim().toLowerCase() !== 'eliminar'}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Confirmar eliminación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2A3B55] bg-[#172235] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
            <h2 className="text-xl font-bold text-[#F5F7FA]">Editar usuario</h2>

            <p className="mt-2 text-sm text-[#AAB4C0]">
              Actualiza los datos de{' '}
              <strong className="text-[#F5F7FA]">
                {editingUser.name || editingUser.email || editingUser.id}
              </strong>
              .
            </p>

            <form onSubmit={handleUpdateUser} className="mt-4 space-y-4">
              <div>
                <label className={labelClass}>
                  Nombre
                </label>
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
                <label className={labelClass}>
                  Correo
                </label>
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
                <label className={labelClass}>
                  Rol
                </label>
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
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
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
                  className="rounded-lg bg-[#52E0DC] px-4 py-2 text-sm font-semibold text-[#171C22] transition hover:bg-[#43C3CF] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
