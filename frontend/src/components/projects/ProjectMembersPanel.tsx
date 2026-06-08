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
      !memberUserIds.has(user.id) && assignableProjectRoles.has(user.role),
  );

  return (
    <div
      id="members-section"
      className="mt-8 rounded-2xl border border-[#2A3B55] bg-[#172235] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F7FA]">
            Miembros del proyecto
          </h2>

          <p className="mt-1 text-[#AAB4C0]">
            {canManageMembers
              ? 'Gestiona los miembros del equipo del proyecto.'
              : 'Consulta los miembros asociados al proyecto.'}
          </p>
        </div>

        {canManageMembers && (
          <button
            type="button"
            onClick={onToggleAddMemberForm}
            className="rounded-lg border border-[#52E0DC]/40 bg-[#52E0DC]/10 px-4 py-2 font-semibold text-[#52E0DC] transition hover:bg-[#52E0DC] hover:text-[#171C22]"
          >
            {showAddMemberForm ? 'Cancelar' : '+ Agregar miembro'}
          </button>
        )}
      </div>

      {memberError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {memberError}
        </div>
      )}

      {showAddMemberForm && canManageMembers && (
        <div className="mb-6 rounded-xl border border-[#2A3B55] bg-[#1D2B42] p-4">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#F5F7FA]">
                Usuario
              </label>

              <select
                value={selectedMemberId}
                onChange={(event) => onSelectedMemberChange(event.target.value)}
                className="w-full rounded-lg border border-[#2A3B55] bg-[#162233] px-3 py-2 text-[#F5F7FA] outline-none transition focus:border-[#52E0DC]"
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
              className="w-full rounded-lg bg-[#52E0DC] px-4 py-2 font-semibold text-[#171C22] transition hover:bg-[#43C3CF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingAddMember ? 'Agregando...' : 'Agregar miembro'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#3A4A63] bg-[#1D2B42] p-4 text-[#AAB4C0]">
            No hay miembros en este proyecto.
          </p>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-xl border border-[#2A3B55] bg-[#1D2B42] p-4"
            >
              <div>
                <p className="font-semibold text-[#F5F7FA]">
                  {getUserName(member.user_id)}
                </p>

                <p className="text-sm text-[#AAB4C0]">
                  Rol: {member.project_role} · Unido:{' '}
                  {new Date(member.joined_at).toLocaleDateString()}
                </p>
              </div>

              {canManageMembers && (
                <button
                  type="button"
                  onClick={() => onRemoveMember(member.user_id)}
                  className="text-sm font-semibold text-red-300 transition hover:text-red-200"
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