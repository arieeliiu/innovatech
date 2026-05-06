export const USER_PASSWORD_MIN_LENGTH = 6;

export const USER_ROLE_OPTIONS = [
  { value: 'DEVELOPER', label: 'Equipo de desarrollo de software' },
  { value: 'ARCHITECT', label: 'Arquitecto' },
  { value: 'MANAGER', label: 'Gestor de proyectos' },
  { value: 'CONSULTANT', label: 'Consultor' },
  { value: 'ADMIN', label: 'Administrador' },
] as const;

export function getUserRoleLabel(role?: string) {
  const normalized = role?.toUpperCase();
  const found = USER_ROLE_OPTIONS.find((item) => item.value === normalized);
  return found?.label || role || 'Sin rol';
}

export function hasValidPasswordLength(password: string) {
  return password.length >= USER_PASSWORD_MIN_LENGTH;
}
