import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.constants';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

const MAX_ACTIVE_PROJECTS = 3;
const PROFESSIONAL_ROLES = ['ARCHITECT', 'DEVELOPER', 'CONSULTANT'] as const;
type ProfessionalRole = (typeof PROFESSIONAL_ROLES)[number];

interface AssignmentRecord {
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

@Injectable()
export class AssignmentsService {
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
  ): Promise<AssignmentRecord[]> {
    const { data, error } = await this.supabase
      .schema('resource_service')
      .from('resource_assignments')
      .select(
        'id, user_id, project_id, role_in_project, start_date, end_date, status, created_at, updated_at',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as AssignmentRecord[];
  }

  private async getActiveAssignmentsByUserId(
    userId: string,
  ): Promise<AssignmentRecord[]> {
    const assignments = await this.getAssignmentsByUserId(userId);

    return assignments.filter((assignment) => assignment.status === 'ACTIVE');
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
    return projects.filter(
      (project) => project.status.trim().toUpperCase() !== 'DONE',
    );
  }

  private countActiveProjects(projects: ProjectRecord[]): number {
    return this.getActiveProjects(projects).length;
  }

  async create(createAssignmentDto: CreateAssignmentDto) {
    const { userId, projectId, roleInProject, startDate, endDate } =
      createAssignmentDto;

    const user = await this.getUserById(userId);

    if (!this.getUserRole(user)) {
      throw new BadRequestException(
        'El usuario no corresponde a un profesional asignable',
      );
    }

    const project = await this.getProjectById(projectId);

    if (project.status.trim().toUpperCase() === 'DONE') {
      throw new BadRequestException(
        'No se puede asignar un profesional a un proyecto finalizado',
      );
    }

    const activeAssignments = await this.getActiveAssignmentsByUserId(userId);

    if (
      activeAssignments.some(
        (assignment) => assignment.project_id === projectId,
      )
    ) {
      throw new ConflictException(
        'El usuario ya está asignado activamente a este proyecto',
      );
    }

    const activeProjects = this.countActiveProjects(
      await this.getProjectsByIds(
        activeAssignments.map((assignment) => assignment.project_id),
      ),
    );

    if (activeProjects >= MAX_ACTIVE_PROJECTS) {
      throw new BadRequestException(
        'El usuario ya alcanzó el máximo de 3 proyectos activos',
      );
    }

    const { data, error } = await this.supabase
      .schema('resource_service')
      .from('resource_assignments')
      .insert({
        user_id: userId,
        project_id: projectId,
        role_in_project: roleInProject ?? null,
        start_date: startDate ?? null,
        end_date: endDate ?? null,
        status: 'ACTIVE',
      })
      .select(
        'id, user_id, project_id, role_in_project, start_date, end_date, status',
      )
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const nextActiveProjects = activeProjects + 1;

    return {
      success: true,
      message: 'Profesional asignado correctamente',
      assignment: data,
      resourceStatus: {
        activeProjects: nextActiveProjects,
        maximumProjects: MAX_ACTIVE_PROJECTS,
        availabilityStatus:
          nextActiveProjects < MAX_ACTIVE_PROJECTS
            ? 'AVAILABLE'
            : 'UNAVAILABLE',
        canReceiveNewProjects: nextActiveProjects < MAX_ACTIVE_PROJECTS,
      },
    };
  }

  async findByUserId(userId: string) {
    const assignments = await this.getAssignmentsByUserId(userId);
    const projectIds = [
      ...new Set(assignments.map((assignment) => assignment.project_id)),
    ];
    const projects = await this.getProjectsByIds(projectIds);
    const projectMap = new Map(projects.map((project) => [project.id, project]));

    return {
      success: true,
      userId,
      assignments: assignments.map((assignment) => {
        const project = projectMap.get(assignment.project_id);

        return {
          assignmentId: assignment.id,
          projectId: assignment.project_id,
          projectName: project?.name ?? null,
          projectStatus: project?.status ?? null,
          roleInProject: assignment.role_in_project,
          assignmentStatus: assignment.status,
          startDate: assignment.start_date,
          endDate: assignment.end_date,
        };
      }),
    };
  }
}
