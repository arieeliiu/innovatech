import type { ProjectMember, User } from '../../types';

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
      !memberUserIds.has(user.id) &&
      assignableProjectRoles.has(user.role),
  );

  return (
    <div
      id="members-section"
      className="mt-8 rounded-xl bg-white p-6 shadow"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Miembros del proyecto
          </h2>

          <p className="mt-1 text-slate-600">
            {canManageMembers
              ? 'Gestiona los miembros del equipo del proyecto.'
              : 'Consulta los miembros asociados al proyecto.'}
          </p>
        </div>

        {canManageMembers && (
          <button
            type="button"
            onClick={onToggleAddMemberForm}
            className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
          >
            {showAddMemberForm ? 'Cancelar' : '+ Agregar miembro'}
          </button>
        )}
      </div>

      {memberError && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700">
          {memberError}
        </div>
      )}

      {showAddMemberForm && canManageMembers && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">
                Usuario
              </label>

              <select
                value={selectedMemberId}
                onChange={(event) => onSelectedMemberChange(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                <option value="">
                  {availableUsers.length > 0
                    ? 'Selecciona un usuario'
                    : 'No hay usuarios disponibles para agregar'}
                </option>

                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onAddMember}
              disabled={loadingAddMember || availableUsers.length === 0}
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {loadingAddMember ? 'Agregando...' : 'Agregar miembro'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-slate-500">
            No hay miembros en este proyecto.
          </p>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {getUserName(member.user_id)}
                </p>

                <p className="text-sm text-slate-500">
                  Rol: {member.project_role} · Unido:{' '}
                  {new Date(member.joined_at).toLocaleDateString()}
                </p>
              </div>

              {canManageMembers && (
                <button
                  type="button"
                  onClick={() => onRemoveMember(member.user_id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remover
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}