import { useState } from 'react';
import type { ProjectMember, User } from '../../types';
import type { ResourceSummary } from '../../lib/api';
import { Card } from '../ui/Card';
import { getUserRoleLabel } from '../../lib/userRules';
import { formatDateShort } from '../../lib/date';

type ProjectMembersPanelProps = {
  members: ProjectMember[];
  users: User[];
  resources?: ResourceSummary[];
  canManageMembers: boolean;
  showAddMemberForm: boolean;
  selectedMemberId: string;
  loadingAddMember: boolean;
  memberError: string;
  onToggleAddMemberForm: () => void;
  onSelectedMemberChange: (userId: string) => void;
  onAddMember: () => void;
  onRemoveMember: (userId: string) => void;
  getUserName: (userId?: string | null) => string;
};

export function ProjectMembersPanel({
  members,
  users,
  resources = [],
  canManageMembers,
  showAddMemberForm,
  selectedMemberId,
  loadingAddMember,
  memberError,
  onToggleAddMemberForm,
  onSelectedMemberChange,
  onAddMember,
  onRemoveMember,
  getUserName,
}: ProjectMembersPanelProps) {
  const [hideUnavailable, setHideUnavailable] = useState(false);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const assignableProjectRoles = new Set([
    'MANAGER',
    'DEVELOPER',
    'ARCHITECT',
    'CONSULTANT',
  ]);

  const memberUserIds = new Set(members.map((member) => member.user_id));

  const resourceByUserId = new Map(
    resources.map((resource) => [resource.userId, resource]),
  );

  const candidateUsers = users.filter(
    (user) =>
      user.active !== false &&
      !memberUserIds.has(user.id) &&
      assignableProjectRoles.has(user.role),
  );
  const isUnavailable = (user: User) => {
    const resource = resourceByUserId.get(user.id);
    return resource ? !resource.canReceiveNewProjects : false;
  };
  const roleFilteredUsers = candidateUsers.filter(
    (user) => roleFilter === 'ALL' || user.role === roleFilter,
  );
  const unavailableUsers = roleFilteredUsers.filter(isUnavailable);
  const visibleUsers = roleFilteredUsers
    .filter((user) => !hideUnavailable || !isUnavailable(user))
    .sort((left, right) => {
      const availabilityDifference =
        Number(isUnavailable(left)) - Number(isUnavailable(right));
      if (availabilityDifference !== 0) return availabilityDifference;
      return (left.name || left.email).localeCompare(right.name || right.email, 'es');
    });
  const selectableUsersCount = roleFilteredUsers.length - unavailableUsers.length;

  return (
    <Card id="members-section" className="mt-8 p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-content-strong">
            Miembros del proyecto
          </h2>

          <p className="mt-1 text-content-muted">
            {canManageMembers
              ? 'Gestiona los miembros del equipo del proyecto.'
              : 'Consulta los miembros asociados al proyecto.'}
          </p>
        </div>

        {canManageMembers && (
          <button
            type="button"
            onClick={onToggleAddMemberForm}
            className="rounded-lg border border-theme-border-strong bg-surface-alt px-4 py-2 font-semibold text-content-strong transition hover:bg-surface-hover"
          >
            {showAddMemberForm ? 'Cancelar' : '+ Agregar miembro'}
          </button>
        )}
      </div>

      {memberError && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger-surface p-4 text-sm text-danger">
          {memberError}
        </div>
      )}

      {showAddMemberForm && canManageMembers && (
        <Card variant="subtle" className="mb-6 p-4">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <label className="block text-sm font-medium text-content-strong">
                  Profesional
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <label>
                    <span className="sr-only">Filtrar profesionales por rol</span>
                    <select
                      value={roleFilter}
                      onChange={(event) => {
                        setRoleFilter(event.target.value);
                        onSelectedMemberChange('');
                      }}
                      className="rounded-full border border-theme-border bg-surface px-3 py-1.5 text-xs text-content outline-none transition focus:border-theme-border-strong"
                    >
                      <option value="ALL">Todos los roles</option>
                      {[...assignableProjectRoles].map((role) => (
                        <option key={role} value={role}>
                          {getUserRoleLabel(role)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    disabled={unavailableUsers.length === 0}
                    onClick={() => {
                      const nextValue = !hideUnavailable;
                      setHideUnavailable(nextValue);
                      if (
                        nextValue &&
                        roleFilteredUsers.some(
                          (user) =>
                            user.id === selectedMemberId &&
                            isUnavailable(user),
                        )
                      ) {
                        onSelectedMemberChange('');
                      }
                    }}
                    className="border border-theme-border bg-surface px-3 py-1.5 text-xs text-content transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {hideUnavailable ? 'Mostrar' : 'Ocultar'} no disponibles (
                    {unavailableUsers.length})
                  </button>
                </div>
              </div>

              <select
                value={selectedMemberId}
                onChange={(event) => onSelectedMemberChange(event.target.value)}
                className="w-full rounded-lg border border-theme-border bg-surface px-3 py-2 text-content-strong outline-none transition focus:border-theme-border-strong"
              >
                <option value="">
                  {selectableUsersCount > 0
                    ? 'Selecciona un profesional'
                    : 'No hay profesionales disponibles para agregar'}
                </option>

                {visibleUsers.map((user) => {
                  const unavailable = isUnavailable(user);

                  return (
                    <option key={user.id} value={user.id} disabled={unavailable}>
                      {user.name || user.email} ({getUserRoleLabel(user.role)})
                      {unavailable ? ' · No disponible' : ''}
                    </option>
                  );
                })}
              </select>

              <p className="mt-2 text-xs text-content-muted">
                Los profesionales con 3 proyectos activos no pueden seleccionarse.
              </p>
            </div>

            <button
              type="button"
              onClick={onAddMember}
              disabled={
                loadingAddMember ||
                selectableUsersCount === 0 ||
                !selectedMemberId
              }
              className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingAddMember ? 'Agregando...' : 'Agregar miembro'}
            </button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="rounded-lg border border-dashed border-theme-border-strong bg-surface-alt p-4 text-content-muted">
            No hay miembros en este proyecto.
          </p>
        ) : (
          members.map((member) => (
            <Card
              variant="subtle"
              key={member.id}
              className="flex items-center justify-between p-4"
            >
              <div>
                <p className="font-semibold text-content-strong">
                  {getUserName(member.user_id)}
                </p>

                <p className="text-sm text-content-muted">
                  Rol: {getUserRoleLabel(member.project_role)} · Unido:{' '}
                  {formatDateShort(member.joined_at)}
                </p>
              </div>

              {canManageMembers && (
                <button
                  type="button"
                  onClick={() => onRemoveMember(member.user_id)}
                  className="text-sm font-semibold text-danger transition hover:text-danger-hover"
                >
                  Remover
                </button>
              )}
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}
