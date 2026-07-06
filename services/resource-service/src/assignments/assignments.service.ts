import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient, User } from '@supabase/supabase-js';
import {
  getAvailabilityStatus,
  getUniqueActiveProjectIds,
  isDoneProjectStatus,
  MAX_ACTIVE_PROJECTS,
  normalizeProfessionalRole,
  ProfessionalRole,
} from '../common/resource-domain.utils';
import { SUPABASE_CLIENT } from '../supabase/supabase.constants';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

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

interface ProjectMemberRecord {
  id: string;
  project_id: string;
  user_id: string;
  project_role: string;
  joined_at: string | null;
}

@Injectable()
export class AssignmentsService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  private throwDatabaseError(message: string): never {
    console.error('[Resource Service - Supabase]:', message);

    const normalizedMessage = message.toLowerCase();

    if (
      normalizedMessage.includes('23505') ||
      normalizedMessage.includes('duplicate') ||
      normalizedMessage.includes('unique')
    ) {
      throw new ConflictException('Ya existe un registro con esos datos');
    }

    if (
      normalizedMessage.includes('23503') ||
      normalizedMessage.includes('foreign key')
    ) {
      throw new BadRequestException('La referencia enviada no es válida');
    }

    if (normalizedMessage.includes('not found') || normalizedMessage.includes('no rows')) {
      throw new NotFoundException('Registro no encontrado');
    }

    throw new InternalServerErrorException('No se pudo completar la operación');
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

  private resolveAssignmentRole(
    user: User,
    roleInProject?: string,
  ): ProfessionalRole {
    const userRole = this.getUserRole(user);

    if (!userRole) {
      throw new BadRequestException(
        'El usuario no corresponde a un profesional asignable',
      );
    }

    if (!roleInProject) {
      return userRole;
    }

    const normalizedRole = normalizeProfessionalRole(roleInProject);

    if (!normalizedRole) {
      throw new BadRequestException(
        'El rol operativo de la asignación no es válido',
      );
    }

    return normalizedRole;
  }

  private async getUserById(userId: string): Promise<User> {
    const { data, error } = await this.supabase.auth.admin.getUserById(userId);

    if (error || !data.user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return data.user;
  }

  private async getProfessionalUserById(userId: string): Promise<User> {
    const user = await this.getUserById(userId);

    if (
      user.app_metadata?.is_active === false ||
      user.app_metadata?.deleted_at
    ) {
      throw new BadRequestException('El usuario está desactivado');
    }

    const role = this.getUserRole(user);

    if (!role) {
      throw new BadRequestException('El usuario no corresponde a un profesional');
    }

    return user;
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

  private async getAssignmentById(
    assignmentId: string,
  ): Promise<AssignmentRecord> {
    const { data, error } = await this.supabase
      .schema('resource_service')
      .from('resource_assignments')
      .select(
        'id, user_id, project_id, role_in_project, start_date, end_date, status, created_at, updated_at',
      )
      .eq('id', assignmentId)
      .maybeSingle();

    if (error) {
      this.throwDatabaseError(error.message);
    }

    if (!data) {
      throw new NotFoundException('Asignación no encontrada');
    }

    return data as AssignmentRecord;
  }

  private async getAssignmentByUserAndProject(
    userId: string,
    projectId: string,
  ): Promise<AssignmentRecord | null> {
    const { data, error } = await this.supabase
      .schema('resource_service')
      .from('resource_assignments')
      .select(
        'id, user_id, project_id, role_in_project, start_date, end_date, status, created_at, updated_at',
      )
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      this.throwDatabaseError(error.message);
    }

    return (data as AssignmentRecord | null) ?? null;
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
      this.throwDatabaseError(error.message);
    }

    return (data ?? []) as AssignmentRecord[];
  }

  private async getActiveAssignmentsByUserId(
    userId: string,
  ): Promise<AssignmentRecord[]> {
    const assignments = await this.getAssignmentsByUserId(userId);
    return assignments.filter((assignment) => assignment.status === 'ACTIVE');
  }

  private async getAssignmentsByProjectId(
    projectId: string,
  ): Promise<AssignmentRecord[]> {
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

    return (data ?? []) as AssignmentRecord[];
  }

  private async getProjectsByIds(projectIds: string[]): Promise<ProjectRecord[]> {
    const uniqueProjectIds = [...new Set(projectIds)];

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

  private getActiveProjectIds(assignments: AssignmentRecord[]): string[] {
    return getUniqueActiveProjectIds(assignments);
  }

  private countActiveProjects(projects: ProjectRecord[]): number {
    return projects.filter((project) => !isDoneProjectStatus(project.status)).length;
  }

  private getAssignmentProjection(assignment: AssignmentRecord) {
    return {
      id: assignment.id,
      user_id: assignment.user_id,
      project_id: assignment.project_id,
      role_in_project: assignment.role_in_project,
      start_date: assignment.start_date,
      end_date: assignment.end_date,
      status: assignment.status,
    };
  }

  private async getProjectMember(
    projectId: string,
    userId: string,
  ): Promise<ProjectMemberRecord | null> {
    const { data, error } = await this.supabase
      .schema('public')
      .from('project_members')
      .select('id, project_id, user_id, project_role, joined_at')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      this.throwDatabaseError(error.message);
    }

    return (data as ProjectMemberRecord | null) ?? null;
  }

  private async ensureProjectMemberSynced(
    projectId: string,
    userId: string,
    projectRole: ProfessionalRole,
  ): Promise<{ created: boolean; previousRole: string | null }> {
    const existingMember = await this.getProjectMember(projectId, userId);

    if (!existingMember) {
      const { error } = await this.supabase
        .schema('public')
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          project_role: projectRole,
        });

      if (error) {
        this.throwDatabaseError(error.message);
      }

      return { created: true, previousRole: null };
    }

    if (existingMember.project_role !== projectRole) {
      const { error } = await this.supabase
        .schema('public')
        .from('project_members')
        .update({ project_role: projectRole })
        .eq('id', existingMember.id);

      if (error) {
        this.throwDatabaseError(error.message);
      }
    }

    return { created: false, previousRole: existingMember.project_role };
  }

  private async revertProjectMemberSync(
    projectId: string,
    userId: string,
    syncState: { created: boolean; previousRole: string | null },
  ): Promise<void> {
    if (syncState.created) {
      const { error } = await this.supabase
        .schema('public')
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) {
        this.throwDatabaseError(error.message);
      }

      return;
    }

    if (syncState.previousRole !== null) {
      const { error } = await this.supabase
        .schema('public')
        .from('project_members')
        .update({ project_role: syncState.previousRole })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) {
        this.throwDatabaseError(error.message);
      }
    }
  }

  private async removeProjectMemberIfOrphaned(
    projectId: string,
    userId: string,
  ): Promise<void> {
    const stillActiveAssignments = await this.getActiveAssignmentsByUserId(userId);
    const stillLinkedToProject = stillActiveAssignments.some(
      (assignment) => assignment.project_id === projectId,
    );

    if (stillLinkedToProject) {
      return;
    }

    const { error } = await this.supabase
      .schema('public')
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (error) {
      this.throwDatabaseError(error.message);
    }
  }

  async create(createAssignmentDto: CreateAssignmentDto) {
    const { userId, projectId, roleInProject, startDate, endDate } =
      createAssignmentDto;

    const user = await this.getProfessionalUserById(userId);
    const project = await this.getProjectById(projectId);

    if (isDoneProjectStatus(project.status)) {
      throw new BadRequestException(
        'No se puede asignar un profesional a un proyecto finalizado',
      );
    }

    const effectiveRole = this.resolveAssignmentRole(user, roleInProject);
    const activeAssignments = await this.getActiveAssignmentsByUserId(userId);
    const activeProjects = this.countActiveProjects(
      await this.getProjectsByIds(
        this.getActiveProjectIds(activeAssignments),
      ),
    );
    const existingAssignment = await this.getAssignmentByUserAndProject(
      userId,
      projectId,
    );

    if (existingAssignment?.status === 'ACTIVE') {
      throw new ConflictException(
        'El usuario ya está asignado activamente a este proyecto',
      );
    }

    if (activeProjects >= MAX_ACTIVE_PROJECTS) {
      throw new BadRequestException(
        'El usuario ya alcanzó el máximo de 3 proyectos activos',
      );
    }

    const syncState = await this.ensureProjectMemberSynced(
      projectId,
      userId,
      effectiveRole,
    );

    try {
      if (existingAssignment) {
        const { data, error } = await this.supabase
          .schema('resource_service')
          .from('resource_assignments')
          .update({
            role_in_project: effectiveRole,
            start_date: startDate ?? null,
            end_date: endDate ?? null,
            status: 'ACTIVE',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingAssignment.id)
          .select(
            'id, user_id, project_id, role_in_project, start_date, end_date, status, created_at, updated_at',
          )
          .single();

        if (error || !data) {
          if (error) {
            this.throwDatabaseError(error.message);
          }

          throw new InternalServerErrorException('No se pudo reactivar la asignación');
        }

        return {
          success: true,
          message: 'Profesional asignado correctamente',
          assignment: this.getAssignmentProjection(data as AssignmentRecord),
          resourceStatus: {
            activeProjects: activeProjects + 1,
            maximumProjects: MAX_ACTIVE_PROJECTS,
            availabilityStatus: getAvailabilityStatus(activeProjects + 1),
            canReceiveNewProjects: activeProjects + 1 < MAX_ACTIVE_PROJECTS,
          },
        };
      }

      const { data, error } = await this.supabase
        .schema('resource_service')
        .from('resource_assignments')
        .insert({
          user_id: userId,
          project_id: projectId,
          role_in_project: effectiveRole,
          start_date: startDate ?? null,
          end_date: endDate ?? null,
          status: 'ACTIVE',
        })
        .select(
          'id, user_id, project_id, role_in_project, start_date, end_date, status, created_at, updated_at',
        )
        .single();

      if (error || !data) {
        if (error) {
          this.throwDatabaseError(error.message);
        }

        throw new InternalServerErrorException('No se pudo crear la asignación');
      }

      return {
        success: true,
        message: 'Profesional asignado correctamente',
        assignment: this.getAssignmentProjection(data as AssignmentRecord),
        resourceStatus: {
          activeProjects: activeProjects + 1,
          maximumProjects: MAX_ACTIVE_PROJECTS,
          availabilityStatus: getAvailabilityStatus(activeProjects + 1),
          canReceiveNewProjects: activeProjects + 1 < MAX_ACTIVE_PROJECTS,
        },
      };
    } catch (error) {
      await this.revertProjectMemberSync(projectId, userId, syncState);
      throw error;
    }
  }

  async deactivate(assignmentId: string) {
    const assignment = await this.getAssignmentById(assignmentId);

    if (assignment.status !== 'ACTIVE') {
      return {
        success: true,
        message: 'La asignación ya se encontraba inactiva',
        assignment: this.getAssignmentProjection(assignment),
      };
    }

    const { data, error } = await this.supabase
      .schema('resource_service')
      .from('resource_assignments')
      .update({
        status: 'INACTIVE',
        updated_at: new Date().toISOString(),
      })
      .eq('id', assignmentId)
      .select(
        'id, user_id, project_id, role_in_project, start_date, end_date, status, created_at, updated_at',
      )
      .single();

    if (error || !data) {
      if (error) {
        this.throwDatabaseError(error.message);
      }

      throw new InternalServerErrorException('No se pudo desactivar la asignación');
    }

    await this.removeProjectMemberIfOrphaned(assignment.project_id, assignment.user_id);

    return {
      success: true,
      message: 'Asignación desactivada correctamente',
      assignment: this.getAssignmentProjection(data as AssignmentRecord),
    };
  }

  async findByUserId(userId: string) {
    const user = await this.getProfessionalUserById(userId);
    const assignments = await this.getAssignmentsByUserId(userId);
    const projectIds = [...new Set(assignments.map((assignment) => assignment.project_id))];
    const projects = await this.getProjectsByIds(projectIds);
    const projectMap = new Map(projects.map((project) => [project.id, project]));
    const role = this.getUserRole(user);

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
          roleInProject: assignment.role_in_project ?? role,
          assignmentStatus: assignment.status,
          startDate: assignment.start_date,
          endDate: assignment.end_date,
        };
      }),
    };
  }
}
