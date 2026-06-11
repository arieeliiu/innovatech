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

  if (!normalized) return 'USER';

  if (normalized === 'ADMIN') return 'ADMIN';

  if (normalized === 'MANAGER' || normalized === 'PROJECT_MANAGER') {
    return 'MANAGER';
  }

  if (
    normalized === 'DEVELOPER' ||
    normalized === 'DESARROLLO' ||
    normalized === 'SOFTWARE_DEVELOPER'
  ) {
    return 'DEVELOPER';
  }

  if (normalized === 'ARCHITECT' || normalized === 'ARQUITECTO') {
    return 'ARCHITECT';
  }

  if (normalized === 'CONSULTANT' || normalized === 'CONSULTOR') {
    return 'CONSULTANT';
  }

  return 'USER';
}

export function isAdmin(role?: string | null) {
  return normalizeRole(role) === 'ADMIN';
}

export function isManager(role?: string | null) {
  const normalizedRole = normalizeRole(role);

  return normalizedRole === 'ADMIN' || normalizedRole === 'MANAGER';
}

export function canManageUsers(role?: string | null) {
  return isAdmin(role);
}

export function canManageProjects(role?: string | null) {
  return isManager(role);
}

export function canManageProjectMembers(role?: string | null) {
  return isManager(role);
}

export function canCreateTasks(role?: string | null) {
  const normalizedRole = normalizeRole(role);

  return (
    normalizedRole === 'ADMIN' ||
    normalizedRole === 'MANAGER' ||
    normalizedRole === 'ARCHITECT' ||
    normalizedRole === 'DEVELOPER'
  );
}

export function canChangeTaskStatus(role?: string | null) {
  const normalizedRole = normalizeRole(role);

  return (
    normalizedRole === 'ADMIN' ||
    normalizedRole === 'MANAGER' ||
    normalizedRole === 'ARCHITECT' ||
    normalizedRole === 'DEVELOPER'
  );
}