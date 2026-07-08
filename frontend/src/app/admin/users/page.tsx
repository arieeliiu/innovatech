'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, UserRound } from 'lucide-react';
import { deleteUser, getUsers, updateUser } from '../../../lib/api';
import { getStoredUserId } from '../../../lib/auth';
import { takeFlashNotice } from '../../../lib/flashNotice';
import {
  getUserRoleLabel,
  hasValidPasswordLength,
  USER_PASSWORD_MIN_LENGTH,
  USER_ROLE_OPTIONS,
} from '../../../lib/userRules';
import { Card } from '../../../components/ui/Card';
import { CreateUserModal } from '../../../components/users/CreateUserModal';
import {
  PageTitle,
  primaryPageActionButtonClassName,
} from '../../../components/ui/PageTitle';

type User = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  active?: boolean;
};

const USERS_PER_PAGE = 15;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('es');

    return users.filter((user) => {
      const matchesRole =
        roleFilter === 'ALL' ||
        (user.role || '').toUpperCase() === roleFilter;
      const matchesQuery =
        !normalizedQuery ||
        (user.name || '').toLocaleLowerCase('es').includes(normalizedQuery) ||
        (user.email || '').toLocaleLowerCase('es').includes(normalizedQuery);

      return matchesRole && matchesQuery;
    });
  }, [roleFilter, searchQuery, users]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedUsers = useMemo(
    () =>
      filteredUsers.slice(
        (safeCurrentPage - 1) * USERS_PER_PAGE,
        safeCurrentPage * USERS_PER_PAGE,
      ),
    [filteredUsers, safeCurrentPage],
  );

  async function loadUsers() {
    try {
      setLoading(true);
      setError('');

      const data = await getUsers();
      const list = data.users ?? data.data ?? [];

      setUsers(
        Array.isArray(list)
          ? list.filter((user: User) => user.active !== false)
          : [],
      );
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
    void Promise.resolve().then(loadUsers);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => {
      const flashMessage = takeFlashNotice();
      if (flashMessage) setMessage(flashMessage);
    });
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

      setMessage('Usuario desactivado correctamente');
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
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <PageTitle>Usuarios registrados</PageTitle>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className={primaryPageActionButtonClassName}
        >
          Registrar usuario
        </button>
      </div>

      <div className="mt-8 flex min-h-12 flex-col overflow-hidden rounded-[14px] border border-theme-border bg-surface shadow-card sm:flex-row sm:items-stretch">
        <label className="flex min-w-0 flex-1 items-center gap-3 px-4">
          <Search size={18} className="shrink-0 text-content-muted" />
          <span className="sr-only">Buscar usuario</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por nombre o correo"
            className="min-h-12 w-full bg-transparent text-content-strong outline-none placeholder:text-content-muted/70"
          />
        </label>

        <label className="flex min-h-12 items-center border-t border-theme-border px-4 sm:border-t-0 sm:border-l">
          <span className="sr-only">Filtrar por rol</span>
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="calendar-themed min-w-[190px] rounded-[10px] border border-theme-border bg-surface px-3 py-2 text-sm font-normal text-content outline-none transition focus:border-theme-border-strong"
          >
            <option value="ALL">Todos los roles</option>
            {USER_ROLE_OPTIONS.map((roleOption) => (
              <option key={roleOption.value} value={roleOption.value}>
                {roleOption.label}
              </option>
            ))}
          </select>
        </label>

        <span className="flex min-h-12 items-center border-t border-theme-border px-4 text-sm text-content-muted sm:border-t-0 sm:border-l">
          {filteredUsers.length}{' '}
          {filteredUsers.length === 1 ? 'usuario' : 'usuarios'}
        </span>
      </div>

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

      {loading && (
        <Card className="mt-8 p-6 text-center text-content-muted">
          Cargando usuarios...
        </Card>
      )}

      {!loading && filteredUsers.length === 0 && (
        <Card className="mt-8 p-6 text-center text-content-muted">
          {users.length === 0
            ? 'No hay usuarios registrados.'
            : 'No hay usuarios con el rol seleccionado.'}
        </Card>
      )}

      {!loading && filteredUsers.length > 0 && (
        <>
          <Card className="mt-6 overflow-hidden">
            <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(150px,0.8fr)_190px] items-center gap-4 border-b border-theme-border bg-surface-alt px-5 py-3 text-xs font-semibold uppercase tracking-wide text-content-muted md:grid">
              <span>Usuario</span>
              <span>Rol</span>
              <span>Acciones</span>
            </div>

            <div className="divide-y divide-theme-border">
              {paginatedUsers.map((user) => {
                const isCurrentUser = user.id === currentUserId;

                return (
                  <article
                    key={user.id}
                    className="grid gap-4 px-5 py-4 transition hover:bg-surface-hover md:grid-cols-[minmax(0,1.6fr)_minmax(150px,0.8fr)_190px] md:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-feature-icon-border bg-feature-icon-background text-feature-icon shadow-sm">
                        <UserRound size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate font-semibold text-content-strong">
                            {user.name || 'Usuario sin nombre'}
                          </h2>
                          {isCurrentUser && (
                            <span className="shrink-0 rounded-full border border-success/30 bg-success-surface px-2 py-0.5 text-xs font-medium text-success">
                              Tú
                            </span>
                          )}
                        </div>
                        <p className="truncate text-sm text-content-muted">
                          {user.email || 'Sin correo'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="inline-flex rounded-full border border-theme-border bg-surface-alt px-3 py-1 text-sm text-content">
                        {getUserRoleLabel(user.role)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(user)}
                        className="border border-theme-border bg-surface-alt px-4 py-2 text-content-strong transition hover:bg-surface-hover"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(user)}
                        disabled={isCurrentUser}
                        className="bg-danger px-4 py-2 text-danger-foreground transition hover:bg-danger-hover disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isCurrentUser ? 'Tu cuenta' : 'Eliminar'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </Card>

          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-content-muted">
              Mostrando {(safeCurrentPage - 1) * USERS_PER_PAGE + 1}–
              {Math.min(safeCurrentPage * USERS_PER_PAGE, filteredUsers.length)} de{' '}
              {filteredUsers.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safeCurrentPage === 1}
                className="border border-theme-border bg-surface px-4 py-2 text-content-strong transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="min-w-24 text-center text-sm text-content-muted">
                {safeCurrentPage} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={safeCurrentPage === totalPages}
                className="border border-theme-border bg-surface px-4 py-2 text-content-strong transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 shadow-floating">
            <h2 className="font-heading text-xl font-bold text-content-strong">
              Desactivar usuario
            </h2>

            <p className="mt-3 text-sm text-content-muted">
              Para desactivar al usuario{' '}
              <strong className="text-content-strong">
                {selectedUser.name || selectedUser.email || selectedUser.id}
              </strong>
              , impedir su acceso y conservar su historial, escribe{' '}
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
                {deleting ? 'Desactivando...' : 'Confirmar desactivación'}
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

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreated={async () => {
            await loadUsers();
            setMessage('Usuario creado correctamente.');
          }}
        />
      )}
    </section>
  );
}
