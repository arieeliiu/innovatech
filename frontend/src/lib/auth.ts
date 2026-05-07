export type LoggedRole = string | null;

function normalizeRole(role?: string | null) {
  return role?.trim().toLowerCase() ?? null;
}

function isManagerRole(role?: string | null) {
  const normalized = normalizeRole(role);
  return normalized === 'manager' || normalized === 'project_manager' || normalized === 'gestor';
}

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

  return normalizeRole(
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
  return normalizeRole(role) === 'admin';
}

export function canCreateProjects(role?: string | null) {
  return isAdminRole(role) || isManagerRole(role);
}

export function canManageTasks(role?: string | null) {
  return isAdminRole(role) || isManagerRole(role);
}
