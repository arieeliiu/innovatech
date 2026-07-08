export type AppRole =
  | 'admin'
  | 'gestor'
  | 'arquitecto'
  | 'desarrollo'
  | 'consultor'
  | null;

type ProjectAccessScope = 'all' | 'associated' | 'none';
type TaskStatusScope = 'all' | 'own_assigned' | 'none';
type MembersScope = 'manage' | 'readonly' | 'none';

export type RolePermissions = {
  canRegisterUsers: boolean;

  projectAccess: ProjectAccessScope;
  canCreateProject: boolean;
  canDeleteProject: boolean;
  canFinalizeProject: boolean;
  canViewFinishedProjects: boolean;

  projectDetailAccess: ProjectAccessScope;
  taskBoardAccess: ProjectAccessScope;

  createTaskAccess: ProjectAccessScope;
  changeTaskStatusAccess: TaskStatusScope;

  projectMembersAccess: MembersScope;
};

export function normalizeAppRole(role?: string | null): AppRole {
  const normalized = role?.trim().toLowerCase();

  if (!normalized) return null;

  if (normalized === 'admin') return 'admin';

  if (
    normalized === 'gestor' ||
    normalized === 'manager' ||
    normalized === 'project_manager'
  ) {
    return 'gestor';
  }

  if (
    normalized === 'arquitecto' ||
    normalized === 'architect'
  ) {
    return 'arquitecto';
  }

  if (
    normalized === 'desarrollo' ||
    normalized === 'developer' ||
    normalized === 'software_dev' ||
    normalized === 'software_developer' ||
    normalized === 'dev'
  ) {
    return 'desarrollo';
  }

  if (
    normalized === 'consultor' ||
    normalized === 'consultant'
  ) {
    return 'consultor';
  }

  return null;
}

const permissionsByRole: Record<Exclude<AppRole, null>, RolePermissions> = {
  admin: {
    canRegisterUsers: true,

    projectAccess: 'all',
    canCreateProject: true,
    canDeleteProject: true,
    canFinalizeProject: true,
    canViewFinishedProjects: true,

    projectDetailAccess: 'all',
    taskBoardAccess: 'all',

    createTaskAccess: 'all',
    changeTaskStatusAccess: 'all',

    projectMembersAccess: 'manage',
  },

  gestor: {
    canRegisterUsers: false,

    projectAccess: 'all',
    canCreateProject: true,
    canDeleteProject: true,
    canFinalizeProject: true,
    canViewFinishedProjects: true,

    projectDetailAccess: 'all',
    taskBoardAccess: 'all',

    createTaskAccess: 'all',
    changeTaskStatusAccess: 'all',

    projectMembersAccess: 'manage',
  },

  arquitecto: {
    canRegisterUsers: false,

    projectAccess: 'associated',
    canCreateProject: false,
    canDeleteProject: false,
    canFinalizeProject: false,
    canViewFinishedProjects: false,

    projectDetailAccess: 'associated',
    taskBoardAccess: 'associated',

    createTaskAccess: 'associated',
    changeTaskStatusAccess: 'own_assigned',

    projectMembersAccess: 'readonly',
  },

  desarrollo: {
    canRegisterUsers: false,

    projectAccess: 'associated',
    canCreateProject: false,
    canDeleteProject: false,
    canFinalizeProject: false,
    canViewFinishedProjects: false,

    projectDetailAccess: 'associated',
    taskBoardAccess: 'associated',

    createTaskAccess: 'associated',
    changeTaskStatusAccess: 'own_assigned',

    projectMembersAccess: 'readonly',
  },

  consultor: {
    canRegisterUsers: false,

    projectAccess: 'associated',
    canCreateProject: false,
    canDeleteProject: false,
    canFinalizeProject: false,
    canViewFinishedProjects: false,

    projectDetailAccess: 'associated',
    taskBoardAccess: 'associated',

    createTaskAccess: 'none',
    changeTaskStatusAccess: 'own_assigned',

    projectMembersAccess: 'readonly',
  },
};

const emptyPermissions: RolePermissions = {
  canRegisterUsers: false,

  projectAccess: 'none',
  canCreateProject: false,
  canDeleteProject: false,
  canFinalizeProject: false,
  canViewFinishedProjects: false,

  projectDetailAccess: 'none',
  taskBoardAccess: 'none',

  createTaskAccess: 'none',
  changeTaskStatusAccess: 'none',

  projectMembersAccess: 'none',
};

export function getPermissions(role?: string | null): RolePermissions {
  const appRole = normalizeAppRole(role);

  if (!appRole) {
    return emptyPermissions;
  }

  return permissionsByRole[appRole];
}

function canAccessByScope(
  scope: ProjectAccessScope,
  isAssociatedProject: boolean,
) {
  if (scope === 'all') return true;
  if (scope === 'associated') return isAssociatedProject;
  return false;
}

export function canViewProjects(role?: string | null) {
  return getPermissions(role).projectAccess !== 'none';
}

export function canViewProject(
  role?: string | null,
  isAssociatedProject = false,
) {
  return canAccessByScope(
    getPermissions(role).projectAccess,
    isAssociatedProject,
  );
}

export function canCreateProject(role?: string | null) {
  return getPermissions(role).canCreateProject;
}

export function canDeleteProject(role?: string | null) {
  return getPermissions(role).canDeleteProject;
}

export function canFinalizeProject(role?: string | null) {
  return getPermissions(role).canFinalizeProject;
}

export function canViewProjectDetail(
  role?: string | null,
  isAssociatedProject = false,
) {
  return canAccessByScope(
    getPermissions(role).projectDetailAccess,
    isAssociatedProject,
  );
}

export function canViewTaskBoard(
  role?: string | null,
  isAssociatedProject = false,
) {
  return canAccessByScope(
    getPermissions(role).taskBoardAccess,
    isAssociatedProject,
  );
}

export function canCreateTask(
  role?: string | null,
  isAssociatedProject = false,
) {
  return canAccessByScope(
    getPermissions(role).createTaskAccess,
    isAssociatedProject,
  );
}

export function canChangeTaskStatus(
  role?: string | null,
  isTaskAssignedToCurrentUser = false,
) {
  const scope = getPermissions(role).changeTaskStatusAccess;

  if (scope === 'all') return true;
  if (scope === 'own_assigned') return isTaskAssignedToCurrentUser;

  return false;
}

export function canViewProjectMembers(
  role?: string | null,
  isAssociatedProject = false,
) {
  const permissions = getPermissions(role);

  if (permissions.projectMembersAccess === 'none') return false;

  return canViewProject(role, isAssociatedProject);
}

export function canManageProjectMembers(role?: string | null) {
  return getPermissions(role).projectMembersAccess === 'manage';
}

export function canRegisterUsers(role?: string | null) {
  return getPermissions(role).canRegisterUsers;
}

export function canViewFinishedProjects(role?: string | null) {
  return getPermissions(role).canViewFinishedProjects;
}
