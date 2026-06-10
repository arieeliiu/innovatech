import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.constants';

const MAX_ACTIVE_PROJECTS = 3;
const PROFESSIONAL_ROLES = ['ARCHITECT', 'DEVELOPER', 'CONSULTANT'] as const;
type ProfessionalRole = (typeof PROFESSIONAL_ROLES)[number];
type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE';

interface ResourceAssignment {
  id: string;
  user_id: string;
  project_id: string;
  role_in_project: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProjectRecord {
  id: string;
  name: string | null;
  status: string;
}

interface ProfessionalUser {
  id: string;
  email: string | null;
  role: ProfessionalRole;
  user_metadata: Record<string, unknown> | null;
  app_metadata: Record<string, unknown> | null;
}

export interface ResourceProjectSummary {
  id: string;
  name: string | null;
  status: string;
  roleInProject: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface ResourceSummary {
  userId: string;
  name: string;
  email: string | null;
  role: ProfessionalRole;
  activeProjects: number;
  maximumProjects: number;
  availabilityStatus: AvailabilityStatus;
  canReceiveNewProjects: boolean;
  projects: ResourceProjectSummary[];
}

@Injectable()
export class ResourcesService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  private normalizeRole(role: string | null | undefined): ProfessionalRole | null {
    const normalizedRole = role?.trim().toUpperCase();

    if (!normalizedRole) {
      return null;
    }

    return (PROFESSIONAL_ROLES as readonly string[]).includes(normalizedRole)
      ? (normalizedRole as ProfessionalRole)
      : null;
  }

  private getMetadataString(
    metadata: Record<string, unknown> | null | undefined,
    key: string,
  ): string | undefined {
    const value = metadata?.[key];

    return typeof value === 'string' && value.trim() !== ''
      ? value.trim()
      : undefined;
  }

  private resolveName(user: {
    email: string | null;
    user_metadata: Record<string, unknown> | null;
  }): string {
    return (
      this.getMetadataString(
        user.user_metadata as Record<string, unknown> | null,
        'name',
      ) ??
      this.getMetadataString(
        user.user_metadata as Record<string, unknown> | null,
        'full_name',
      ) ??
      user.email ??
      'Usuario sin nombre'
    );
  }

  private getUserRole(user: User): ProfessionalRole | null {
    return this.normalizeRole(
      this.getMetadataString(
        user.user_metadata as Record<string, unknown> | null,
        'role',
      ) ??
        this.getMetadataString(
          user.app_metadata as Record<string, unknown> | null,
          'role',
        ),
    );
  }

  private isProfessionalUser(user: User): boolean {
    return this.getUserRole(user) !== null;
  }

  private async getProfessionalUsers(): Promise<ProfessionalUser[]> {
    const professionalUsers: ProfessionalUser[] = [];
    const perPage = 100;
    let page = 1;

    while (true) {
      const { data, error } = await this.supabase.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        throw new InternalServerErrorException(error.message);
      }

      const users = data.users ?? [];

      for (const user of users) {
        const role = this.getUserRole(user);

        if (!role) {
          continue;
        }

        professionalUsers.push({
          id: user.id,
          email: user.email ?? null,
          role,
          user_metadata:
            (user.user_metadata as Record<string, unknown> | null) ?? null,
          app_metadata:
            (user.app_metadata as Record<string, unknown> | null) ?? null,
        });
      }

      if (users.length < perPage) {
        break;
      }

      page += 1;
    }

    return professionalUsers;
  }

  private async getUserById(userId: string): Promise<User> {
    const { data, error } = await this.supabase.auth.admin.getUserById(userId);

    if (error || !data.user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return data.user;
  }

  private async getProjectById(projectId: string): Promise<ProjectRecord> {
    const { data, error } = await this.supabase
      .schema('public')
      .from('projects')
      .select('id, name, status')
      .eq('id', projectId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return data as ProjectRecord;
  }

  private async getAssignmentsByUserId(
    userId: string,
  ): Promise<ResourceAssignment[]> {
    const { data, error } = await this.supabase
      .schema('resource_service')
      .from('resource_assignments')
      .select(
        'id, user_id, project_id, role_in_project, start_date, end_date, status, created_at, updated_at',
      )
      .eq('user_id', userId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as ResourceAssignment[];
  }

  private async getAssignmentsByProjectId(
    projectId: string,
  ): Promise<ResourceAssignment[]> {
    const { data, error } = await this.supabase
      .schema('resource_service')
      .from('resource_assignments')
      .select(
        'id, user_id, project_id, role_in_project, start_date, end_date, status, created_at, updated_at',
      )
      .eq('project_id', projectId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as ResourceAssignment[];
  }

  private async getAssignmentsByUserIds(
    userIds: string[],
  ): Promise<ResourceAssignment[]> {
    if (userIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .schema('resource_service')
      .from('resource_assignments')
      .select(
        'id, user_id, project_id, role_in_project, start_date, end_date, status, created_at, updated_at',
      )
      .eq('status', 'ACTIVE')
      .in('user_id', userIds)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as ResourceAssignment[];
  }

  private async getProjectsByIds(projectIds: string[]): Promise<ProjectRecord[]> {
    if (projectIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .schema('public')
      .from('projects')
      .select('id, name, status')
      .in('id', projectIds);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as ProjectRecord[];
  }

  private getActiveProjects(projects: ProjectRecord[]): ProjectRecord[] {
    return projects.filter((project) => project.status.trim().toUpperCase() !== 'DONE');
  }

  private countActiveProjects(projects: ProjectRecord[]): number {
    return this.getActiveProjects(projects).length;
  }

  private getAvailabilityStatus(activeProjects: number): AvailabilityStatus {
    return activeProjects < MAX_ACTIVE_PROJECTS ? 'AVAILABLE' : 'UNAVAILABLE';
  }

  private buildResourceSummary(
    user: ProfessionalUser,
    assignments: ResourceAssignment[],
    projectsById: Map<string, ProjectRecord>,
  ): ResourceSummary {
    const activeProjectRows = assignments
      .map((assignment) => {
        const project = projectsById.get(assignment.project_id);

        if (!project || project.status.trim().toUpperCase() === 'DONE') {
          return null;
        }

        return {
          id: project.id,
          name: project.name,
          status: project.status,
          roleInProject: assignment.role_in_project,
          startDate: assignment.start_date,
          endDate: assignment.end_date,
        };
      })
      .filter((project): project is ResourceProjectSummary => project !== null);

    const activeProjects = activeProjectRows.length;

    return {
      userId: user.id,
      name: this.resolveName({
        email: user.email ?? null,
        user_metadata:
          (user.user_metadata as Record<string, unknown> | null) ?? null,
      }),
      email: user.email,
      role: user.role,
      activeProjects,
      maximumProjects: MAX_ACTIVE_PROJECTS,
      availabilityStatus: this.getAvailabilityStatus(activeProjects),
      canReceiveNewProjects: activeProjects < MAX_ACTIVE_PROJECTS,
      projects: activeProjectRows,
    };
  }

  private sortResources(resources: ResourceSummary[]): ResourceSummary[] {
    return [...resources].sort((left, right) => {
      const leftAvailable = left.availabilityStatus === 'AVAILABLE' ? 0 : 1;
      const rightAvailable = right.availabilityStatus === 'AVAILABLE' ? 0 : 1;

      if (leftAvailable !== rightAvailable) {
        return leftAvailable - rightAvailable;
      }

      if (left.activeProjects !== right.activeProjects) {
        return left.activeProjects - right.activeProjects;
      }

      return left.name.localeCompare(right.name, 'es', { sensitivity: 'base' });
    });
  }

  async findAll() {
    const professionalUsers = await this.getProfessionalUsers();
    const userIds = professionalUsers.map((user) => user.id);
    const assignments = await this.getAssignmentsByUserIds(userIds);
    const projectIds = [...new Set(assignments.map((assignment) => assignment.project_id))];
    const projects = await this.getProjectsByIds(projectIds);
    const projectsById = new Map(projects.map((project) => [project.id, project]));
    const assignmentsByUserId = new Map<string, ResourceAssignment[]>();

    for (const assignment of assignments) {
      const currentAssignments = assignmentsByUserId.get(assignment.user_id) ?? [];
      currentAssignments.push(assignment);
      assignmentsByUserId.set(assignment.user_id, currentAssignments);
    }

    const resources = this.sortResources(
      professionalUsers.map((user) =>
        this.buildResourceSummary(
          user,
          assignmentsByUserId.get(user.id) ?? [],
          projectsById,
        ),
      ),
    );

    return {
      success: true,
      total: resources.length,
      available: resources.filter((resource) => resource.availabilityStatus === 'AVAILABLE').length,
      unavailable: resources.filter((resource) => resource.availabilityStatus === 'UNAVAILABLE').length,
      resources,
    };
  }

  async findByUserId(userId: string) {
    const user = await this.getUserById(userId);
    const role = this.getUserRole(user);

    if (!role) {
      throw new BadRequestException(
        'El usuario no corresponde a un profesional',
      );
    }

    const assignments = await this.getAssignmentsByUserId(userId);
    const projectIds = assignments.map((assignment) => assignment.project_id);
    const projects = await this.getProjectsByIds(projectIds);
    const projectsById = new Map(projects.map((project) => [project.id, project]));
    const professionalUser: ProfessionalUser = {
      id: user.id,
      email: user.email ?? null,
      role,
      user_metadata:
        (user.user_metadata as Record<string, unknown> | null) ?? null,
      app_metadata:
        (user.app_metadata as Record<string, unknown> | null) ?? null,
    };

    return {
      success: true,
      resource: this.buildResourceSummary(
        professionalUser,
        assignments,
        projectsById,
      ),
    };
  }

  async findByProjectId(projectId: string) {
    const project = await this.getProjectById(projectId);
    const assignments = await this.getAssignmentsByProjectId(projectId);
    const users = await this.getProfessionalUsers();
    const usersById = new Map(users.map((user) => [user.id, user]));
    const resources = assignments
      .map((assignment) => {
        const user = usersById.get(assignment.user_id);

        if (!user) {
          return null;
        }

        return {
          userId: user.id,
          name: this.resolveName({
            email: user.email ?? null,
            user_metadata:
              (user.user_metadata as Record<string, unknown> | null) ?? null,
          }),
          email: user.email,
          role: user.role,
          roleInProject: assignment.role_in_project,
          startDate: assignment.start_date,
          endDate: assignment.end_date,
        };
      })
      .filter(
        (
          resource,
        ): resource is {
          userId: string;
          name: string;
          email: string | null;
          role: ProfessionalRole;
          roleInProject: string | null;
          startDate: string | null;
          endDate: string | null;
        } => resource !== null,
      );

    return {
      success: true,
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
      },
      totalResources: resources.length,
      resources,
    };
  }
}
