export type AppRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'PROJECT_MANAGER'
  | 'DEVELOPER'
  | 'ARCHITECT'
  | 'CONSULTANT'
  | 'USER';

export function normalizeRole(role?: string | null): AppRole {
  const normalized = role?.trim().toUpperCase();

  if (normalized === 'ADMIN') return 'ADMIN';
  if (normalized === 'MANAGER' || normalized === 'PROJECT_MANAGER')
    return 'MANAGER';
  if (
    ['DEVELOPER', 'DESARROLLO', 'SOFTWARE_DEVELOPER'].includes(normalized ?? '')
  )
    return 'DEVELOPER';
  if (normalized === 'ARCHITECT' || normalized === 'ARQUITECTO')
    return 'ARCHITECT';
  if (normalized === 'CONSULTANT' || normalized === 'CONSULTOR')
    return 'CONSULTANT';
  return 'USER';
}

export const isAdmin = (role?: string | null) =>
  normalizeRole(role) === 'ADMIN';
export const isManager = (role?: string | null) =>
  ['ADMIN', 'MANAGER'].includes(normalizeRole(role));
export const canManageUsers = isAdmin;
export const canManageProjects = isManager;
export const canManageProjectMembers = isManager;

export function canCreateTasks(role?: string | null) {
  return ['ADMIN', 'MANAGER', 'ARCHITECT', 'DEVELOPER'].includes(
    normalizeRole(role),
  );
}

export const canChangeTaskStatus = canCreateTasks;
