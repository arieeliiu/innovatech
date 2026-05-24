import {
  canCreateProject,
  getPermissions,
  normalizeAppRole,
} from './permissions';

export type LoggedRole = string | null;

export function getDecodedToken(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function getRoleFromToken(token?: string | null): LoggedRole {
  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }

  const payload = getDecodedToken(token);

  return normalizeAppRole(
    payload?.user_metadata?.role || payload?.role || payload?.user?.role,
  );
}

export function getUserIdFromToken(token?: string | null) {
  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }

  const payload = getDecodedToken(token);

  return payload?.id || payload?.sub || null;
}

export function getStoredRole() {
  if (typeof window === 'undefined') return null;

  return getRoleFromToken(localStorage.getItem('token'));
}

export function getStoredUserId() {
  if (typeof window === 'undefined') return null;

  return getUserIdFromToken(localStorage.getItem('token'));
}

export function isAdminRole(role?: string | null) {
  return normalizeAppRole(role) === 'admin';
}

// Se mantiene este nombre porque ya está siendo usado por las vistas actuales.
export function canCreateProjects(role?: string | null) {
  return canCreateProject(role);
}

// Se mantiene este nombre para no romper código existente.
// Ahora considera también arquitecto/desarrollo, pero según su alcance.
export function canManageTasks(role?: string | null) {
  const permissions = getPermissions(role);

  return (
    permissions.createTaskAccess !== 'none' ||
    permissions.changeTaskStatusAccess !== 'none'
  );
}

// Función útil para diferenciar admin/gestor de roles operativos.
export function isProjectManagerRole(role?: string | null) {
  const normalizedRole = normalizeAppRole(role);

  return normalizedRole === 'admin' || normalizedRole === 'gestor';
}

// Función útil para roles que solo trabajan en proyectos asociados.
export function isAssociatedProjectRole(role?: string | null) {
  const normalizedRole = normalizeAppRole(role);

  return (
    normalizedRole === 'arquitecto' ||
    normalizedRole === 'desarrollo' ||
    normalizedRole === 'consultor'
  );
}