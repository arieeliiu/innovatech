import type { ProjectMember, User } from '../../types';
import { Card } from '../ui/Card';
import { getUserRoleLabel } from '../../lib/userRules';

type ProjectMembersPanelProps = {
  members: ProjectMember[];
  users: User[];
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
  const assignableProjectRoles = new Set([
    'MANAGER',
    'DEVELOPER',
    'ARCHITECT',
    'CONSULTANT',
  ]);

  const memberUserIds = new Set(members.map((member) => member.user_id));

  const availableUsers = users.filter(
    (user) =>
      !memberUserIds.has(user.id) && assignableProjectRoles.has(user.role),
  );

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
              <label className="mb-2 block text-sm font-medium text-content-strong">
                Usuario
              </label>

              <select
                value={selectedMemberId}
                onChange={(event) => onSelectedMemberChange(event.target.value)}
                className="w-full rounded-lg border border-theme-border bg-surface px-3 py-2 text-content-strong outline-none transition focus:border-theme-border-strong"
              >
                <option value="">
                  {availableUsers.length > 0
                    ? 'Selecciona un usuario'
                    : 'No hay usuarios disponibles para agregar'}
                </option>

                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email} ({getUserRoleLabel(user.role)})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onAddMember}
              disabled={loadingAddMember || availableUsers.length === 0}
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
                  {new Date(member.joined_at).toLocaleDateString()}
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
