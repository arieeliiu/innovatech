import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient, User } from '@supabase/supabase-js';
import {
  getAvailabilityStatus,
  getUniqueActiveProjectIds,
  getUniqueValues,
  isDoneProjectStatus,
  MAX_ACTIVE_PROJECTS,
  normalizeProfessionalRole,
  ProfessionalRole,
} from '../common/resource-domain.utils';
import { SUPABASE_CLIENT } from '../supabase/supabase.constants';

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
  availabilityStatus: 'AVAILABLE' | 'UNAVAILABLE';
  canReceiveNewProjects: boolean;
  projects: ResourceProjectSummary[];
}

@Injectable()
export class ResourcesService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  private throwDatabaseError(message: string): never {
    throw new InternalServerErrorException('No se pudo consultar la información de recursos');
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
      this.getMetadataString(user.user_metadata, 'name') ??
      this.getMetadataString(user.user_metadata, 'full_name') ??
      user.email ??
      'Usuario sin nombre'
    );
  }

  private getUserRole(user: User): ProfessionalRole | null {
    return normalizeProfessionalRole(
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
        this.throwDatabaseError(error.message);
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
      this.throwDatabaseError(error.message);
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
      this.throwDatabaseError(error.message);
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
      this.throwDatabaseError(error.message);
    }

    return (data ?? []) as ResourceAssignment[];
  }

  private async getAssignmentsByUserIds(
    userIds: string[],
  ): Promise<ResourceAssignment[]> {
    const uniqueUserIds = getUniqueValues(userIds);

    if (uniqueUserIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .schema('resource_service')
      .from('resource_assignments')
      .select(
        'id, user_id, project_id, role_in_project, start_date, end_date, status, created_at, updated_at',
      )
      .eq('status', 'ACTIVE')
      .in('user_id', uniqueUserIds)
      .order('created_at', { ascending: false });

    if (error) {
      this.throwDatabaseError(error.message);
    }

    return (data ?? []) as ResourceAssignment[];
  }

  private async getProjectsByIds(projectIds: string[]): Promise<ProjectRecord[]> {
    const uniqueProjectIds = getUniqueValues(projectIds);

    if (uniqueProjectIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .schema('public')
      .from('projects')
      .select('id, name, status')
      .in('id', uniqueProjectIds);

    if (error) {
      this.throwDatabaseError(error.message);
    }

    return (data ?? []) as ProjectRecord[];
  }

  private buildResourceSummary(
    user: ProfessionalUser,
    assignments: ResourceAssignment[],
    projectsById: Map<string, ProjectRecord>,
  ): ResourceSummary {
    const projectsByIdUnique = new Map<string, ResourceProjectSummary>();

    for (const assignment of assignments) {
      const project = projectsById.get(assignment.project_id);

      if (!project || isDoneProjectStatus(project.status)) {
        continue;
      }

      if (projectsByIdUnique.has(project.id)) {
        continue;
      }

      projectsByIdUnique.set(project.id, {
        id: project.id,
        name: project.name,
        status: project.status,
        roleInProject: assignment.role_in_project,
        startDate: assignment.start_date,
        endDate: assignment.end_date,
      });
    }

    const projects = [...projectsByIdUnique.values()];
    const activeProjects = projects.length;

    return {
      userId: user.id,
      name: this.resolveName({
        email: user.email,
        user_metadata: user.user_metadata,
      }),
      email: user.email,
      role: user.role,
      activeProjects,
      maximumProjects: MAX_ACTIVE_PROJECTS,
      availabilityStatus: getAvailabilityStatus(activeProjects),
      canReceiveNewProjects: activeProjects < MAX_ACTIVE_PROJECTS,
      projects,
    };
  }

  private sortResources(resources: ResourceSummary[]): ResourceSummary[] {
    return [...resources].sort((left, right) => {
      const leftAvailability = left.availabilityStatus === 'AVAILABLE' ? 0 : 1;
      const rightAvailability = right.availabilityStatus === 'AVAILABLE' ? 0 : 1;

      if (leftAvailability !== rightAvailability) {
        return leftAvailability - rightAvailability;
      }

      if (left.activeProjects !== right.activeProjects) {
        return left.activeProjects - right.activeProjects;
      }

      return left.name.localeCompare(right.name, 'es', { sensitivity: 'base' });
    });
  }

  private toProfessionalUser(user: User): ProfessionalUser {
    const role = this.getUserRole(user);

    if (!role) {
      throw new BadRequestException('El usuario no corresponde a un profesional');
    }

    return {
      id: user.id,
      email: user.email ?? null,
      role,
      user_metadata:
        (user.user_metadata as Record<string, unknown> | null) ?? null,
      app_metadata:
        (user.app_metadata as Record<string, unknown> | null) ?? null,
    };
  }

  async findAll() {
    const professionalUsers = await this.getProfessionalUsers();
    const userIds = professionalUsers.map((user) => user.id);
    const assignments = await this.getAssignmentsByUserIds(userIds);
    const projectIds = getUniqueActiveProjectIds(assignments);
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
      available: resources.filter(
        (resource) => resource.availabilityStatus === 'AVAILABLE',
      ).length,
      unavailable: resources.filter(
        (resource) => resource.availabilityStatus === 'UNAVAILABLE',
      ).length,
      resources,
    };
  }

  async findByUserId(userId: string) {
    const user = await this.getUserById(userId);
    const professionalUser = this.toProfessionalUser(user);
    const assignments = await this.getAssignmentsByUserId(userId);
    const projectIds = getUniqueActiveProjectIds(assignments);
    const projects = await this.getProjectsByIds(projectIds);
    const projectsById = new Map(projects.map((project) => [project.id, project]));

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
    const professionalUsers = await this.getProfessionalUsers();
    const usersById = new Map(professionalUsers.map((user) => [user.id, user]));
    const resourcesByUserId = new Map<
      string,
      {
        userId: string;
        name: string;
        email: string | null;
        role: ProfessionalRole;
        roleInProject: string | null;
        startDate: string | null;
        endDate: string | null;
      }
    >();

    for (const assignment of assignments) {
      const user = usersById.get(assignment.user_id);

      if (!user || resourcesByUserId.has(user.id)) {
        continue;
      }

      resourcesByUserId.set(user.id, {
        userId: user.id,
        name: this.resolveName({
          email: user.email,
          user_metadata: user.user_metadata,
        }),
        email: user.email,
        role: user.role,
        roleInProject: assignment.role_in_project,
        startDate: assignment.start_date,
        endDate: assignment.end_date,
      });
    }

    return {
      success: true,
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
      },
      totalResources: resourcesByUserId.size,
      resources: [...resourcesByUserId.values()],
    };
  }
}
