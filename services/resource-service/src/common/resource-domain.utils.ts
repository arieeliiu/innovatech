export const MAX_ACTIVE_PROJECTS = 3;

export const PROFESSIONAL_ROLES = [
  'ARCHITECT',
  'DEVELOPER',
  'CONSULTANT',
] as const;

export type ProfessionalRole = (typeof PROFESSIONAL_ROLES)[number];

export type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE';

export interface ProjectAssignmentLike {
  project_id: string;
  status: string;
}

export interface ProjectStatusLike {
  status: string;
}

export function normalizeProfessionalRole(
  role: string | null | undefined,
): ProfessionalRole | null {
  const normalizedRole = role?.trim().toUpperCase();

  if (!normalizedRole) {
    return null;
  }

  return (PROFESSIONAL_ROLES as readonly string[]).includes(normalizedRole)
    ? (normalizedRole as ProfessionalRole)
    : null;
}

export function getAvailabilityStatus(
  activeProjects: number,
): AvailabilityStatus {
  return activeProjects < MAX_ACTIVE_PROJECTS ? 'AVAILABLE' : 'UNAVAILABLE';
}

export function getUniqueValues<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function isDoneProjectStatus(status: string | null | undefined): boolean {
  return status?.trim().toUpperCase() === 'DONE';
}

export function getUniqueActiveProjectIds(
  assignments: ProjectAssignmentLike[],
): string[] {
  const activeProjectIds = assignments
    .filter((assignment) => assignment.status === 'ACTIVE')
    .map((assignment) => assignment.project_id);

  return getUniqueValues(activeProjectIds);
}