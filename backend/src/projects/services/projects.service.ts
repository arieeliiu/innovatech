import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { CreateProjectDto } from '../dto/create-project.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { CreateTaskCommentDto } from '../dto/create-task-comment.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { AddProjectMemberDto } from '../dto/add-project-member.dto';
import { normalizeRole } from '../../auth/utils/role.utils';

@Injectable()
export class ProjectsService {
  private supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  );

  private canAccessAllProjects(role?: string | null) {
    const normalizedRole = normalizeRole(role);

    return normalizedRole === 'ADMIN' || normalizedRole === 'MANAGER';
  }

  private async getAssociatedProjectIds(userId: string) {
    const { data, error } = await this.supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', userId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []).map((member) => member.project_id);
  }

  private async ensureProjectAccess(
    projectId: string,
    userId: string,
    role?: string | null,
  ) {
    if (this.canAccessAllProjects(role)) {
      await this.ensureProjectExists(projectId);
      return;
    }

    const { data, error } = await this.supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }
  }

  private async ensureProjectExists(projectId: string) {
    const { data, error } = await this.supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return data;
  }

  private async ensureUserExists(userId: string) {
    const { data, error } = await this.supabase.auth.admin.getUserById(userId);

    if (error || !data.user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return data.user;
  }

  private ensureUserIsManager(user: { user_metadata?: { role?: string } }) {
    const role = user.user_metadata?.role?.trim().toUpperCase();

    if (role !== 'MANAGER' && role !== 'PROJECT_MANAGER') {
      throw new BadRequestException(
        'El responsable del proyecto debe tener rol de gestor',
      );
    }
  }

  private async ensureTaskAccess(
    taskId: string,
    userId: string,
    role?: string | null,
  ) {
    const { data: task, error } = await this.supabase
      .from('project_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error || !task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    await this.ensureProjectAccess(task.project_id, userId, role);

    return task;
  }

  private ensureUserCanUpdateTask(
    task: { responsible_id?: string | null },
    userId: string,
    role?: string | null,
  ) {
    if (this.canAccessAllProjects(role)) {
      return;
    }

    if (task.responsible_id !== userId) {
      throw new ForbiddenException(
        'Solo puedes actualizar tareas asignadas a tu usuario',
      );
    }
  }

  private async ensureProjectIsNotFinished(projectId: string) {
    const { data, error } = await this.supabase
      .from('projects')
      .select('id, status')
      .eq('id', projectId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (data.status === 'DONE') {
      throw new BadRequestException(
        'No se pueden modificar tareas de un proyecto finalizado',
      );
    }

    return data;
  }

  private async ensureUserIsProjectMember(projectId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      throw new BadRequestException(
        'El responsable debe pertenecer al proyecto',
      );
    }
  }

  async createProject(createProjectDto: CreateProjectDto) {
    const { name, description, startDate, endDate, managerId } =
      createProjectDto;

    const manager = await this.ensureUserExists(managerId);
    this.ensureUserIsManager(manager);

    const { data, error } = await this.supabase
      .from('projects')
      .insert({
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        main_responsible_id: managerId,
        status: 'TODO',
        progress: 0,
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      message: 'Proyecto creado correctamente',
      project: data,
    };
  }

  async findAll(userId: string, role?: string | null) {
    let query = this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    const normalizedRole = normalizeRole(role);
    const canSeeFinishedProjects =
      normalizedRole === 'ADMIN' || normalizedRole === 'MANAGER';

    if (!canSeeFinishedProjects) {
      query = query.neq('status', 'DONE');
    }

    if (!this.canAccessAllProjects(role)) {
      const associatedProjectIds = await this.getAssociatedProjectIds(userId);

      if (associatedProjectIds.length === 0) {
        return {
          success: true,
          projects: [],
        };
      }

      query = query.in('id', associatedProjectIds);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      projects: data,
    };
  }

  async finalizeProject(projectId: string, userId: string, comment?: string) {
    await this.ensureProjectExists(projectId);
    await this.ensureUserExists(userId);

    const { data: projectData, error: projectErr } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectErr || !projectData) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (projectData.status === 'DONE') {
      throw new BadRequestException('El proyecto ya se encuentra finalizado');
    }

    const previousStatus = projectData.status;
    const currentDate = new Date().toISOString().split('T')[0];

    const { data: updatedProject, error: updateErr } = await this.supabase
      .from('projects')
      .update({
        status: 'DONE',
        progress: 100,
        end_date: currentDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateErr) {
      throw new InternalServerErrorException(updateErr.message);
    }

    const { error: historyErr } = await this.supabase
      .from('project_history')
      .insert({
        project_id: projectId,
        previous_status: previousStatus,
        new_status: 'DONE',
        changed_by: userId,
        comment: comment ?? 'Proyecto finalizado',
      });

    if (historyErr) {
      throw new InternalServerErrorException(historyErr.message);
    }

    return {
      success: true,
      message: 'Proyecto finalizado correctamente',
      project: updatedProject,
    };
  }

  async findById(id: string, userId: string, role?: string | null) {
    await this.ensureProjectAccess(id, userId, role);

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return {
      success: true,
      project: data,
    };
  }

  async deleteProject(projectId: string) {
    await this.ensureProjectExists(projectId);

    const { data: projectTasks, error: projectTasksError } = await this.supabase
      .from('project_tasks')
      .select('id')
      .eq('project_id', projectId);

    if (projectTasksError) {
      throw new InternalServerErrorException(projectTasksError.message);
    }

    const taskIds = (projectTasks ?? []).map((task) => task.id);

    if (taskIds.length > 0) {
      const { error: commentsError } = await this.supabase
        .from('task_comments')
        .delete()
        .in('task_id', taskIds);

      if (commentsError) {
        throw new InternalServerErrorException(commentsError.message);
      }
    }

    const { error: historyError } = await this.supabase
      .from('project_status_history')
      .delete()
      .eq('project_id', projectId);

    if (historyError) {
      throw new InternalServerErrorException(historyError.message);
    }

    const { error: membersError } = await this.supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId);

    if (membersError) {
      throw new InternalServerErrorException(membersError.message);
    }

    const { error: tasksError } = await this.supabase
      .from('project_tasks')
      .delete()
      .eq('project_id', projectId);

    if (tasksError) {
      throw new InternalServerErrorException(tasksError.message);
    }

    const { error: projectError } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (projectError) {
      throw new InternalServerErrorException(projectError.message);
    }

    return {
      success: true,
      message: 'Proyecto eliminado correctamente',
    };
  }

  async createTask(
    projectId: string,
    createTaskDto: CreateTaskDto,
    requestingUserId: string,
    role?: string | null,
  ) {
    const { title, description, responsibleId, startDate, endDate } =
      createTaskDto;

    await this.ensureProjectAccess(projectId, requestingUserId, role);

    const { data: projectData, error: projectError } = await this.supabase
      .from('projects')
      .select('id, status')
      .eq('id', projectId)
      .single();

    if (projectError || !projectData) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (projectData.status === 'DONE') {
      throw new BadRequestException(
        'No se pueden crear tareas en un proyecto finalizado',
      );
    }

    await this.ensureUserExists(responsibleId);
    await this.ensureUserIsProjectMember(projectId, responsibleId);

    const { data, error } = await this.supabase
      .from('project_tasks')
      .insert({
        project_id: projectId,
        title,
        description,
        responsible_id: responsibleId,
        start_date: startDate,
        end_date: endDate || null,
        status: 'TODO',
        progress: 0,
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      message: 'Tarea creada correctamente',
      task: data,
    };
  }

  async findTasksByProject(
    projectId: string,
    userId: string,
    role?: string | null,
  ) {
    await this.ensureProjectAccess(projectId, userId, role);

    const { data, error } = await this.supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      tasks: data,
    };
  }

  async findTaskById(taskId: string, userId: string, role?: string | null) {
    const task = await this.ensureTaskAccess(taskId, userId, role);

    return {
      success: true,
      task,
    };
  }

  async updateTaskStatus(
    taskId: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
    userId: string,
    role?: string | null,
  ) {
    const { status, progress, comment } = updateTaskStatusDto;

    await this.ensureUserExists(userId);

    const existingTask = await this.ensureTaskAccess(taskId, userId, role);
    await this.ensureProjectIsNotFinished(existingTask.project_id);
    this.ensureUserCanUpdateTask(existingTask, userId, role);

    let newProgress = progress;
    let endDate: string | null = null;

    if (status === 'DONE') {
      newProgress = 100;
      endDate =
        existingTask.status === 'DONE' && existingTask.end_date
          ? existingTask.end_date
          : new Date().toISOString();
    } else {
      if (newProgress >= 100) {
        newProgress = 0;
      }

      endDate = null;
    }

    const existingEndDate = existingTask.end_date ?? null;
    const hasRealChanges =
      existingTask.status !== status ||
      existingTask.progress !== newProgress ||
      existingEndDate !== endDate;

    if (!hasRealChanges) {
      return {
        success: true,
        message: 'No hay cambios para guardar',
        task: existingTask,
      };
    }

    const { data: updatedTask, error: updateError } = await this.supabase
      .from('project_tasks')
      .update({
        status,
        progress: newProgress,
        end_date: endDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()
      .single();

    if (updateError) {
      throw new InternalServerErrorException(updateError.message);
    }

    const { error: historyError } = await this.supabase
      .from('project_status_history')
      .insert({
        project_id: existingTask.project_id,
        task_id: taskId,
        previous_status: existingTask.status,
        new_status: status,
        changed_by: userId,
        comment: comment ?? null,
      });

    if (historyError) {
      throw new InternalServerErrorException(historyError.message);
    }

    return {
      success: true,
      message: 'Estado de la tarea actualizado correctamente',
      task: updatedTask,
    };
  }

  async findTaskHistory(taskId: string, userId: string, role?: string | null) {
    await this.ensureTaskAccess(taskId, userId, role);

    const { data, error } = await this.supabase
      .from('project_status_history')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      history: data,
    };
  }

  async addTaskComment(
    taskId: string,
    userId: string,
    role: string | null,
    createTaskCommentDto: CreateTaskCommentDto,
  ) {
    const { title, description } = createTaskCommentDto;

    await this.ensureUserExists(userId);

    const task = await this.ensureTaskAccess(taskId, userId, role);

    await this.ensureProjectIsNotFinished(task.project_id);

    const { data, error } = await this.supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        user_id: userId,
        title,
        description,
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      message: 'Comentario agregado correctamente',
      comment: data,
    };
  }

  async findTaskComments(taskId: string, userId: string, role?: string | null) {
    await this.ensureTaskAccess(taskId, userId, role);

    const { data, error } = await this.supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      comments: data,
    };
  }

  async addProjectMember(
    projectId: string,
    addProjectMemberDto: AddProjectMemberDto,
  ) {
    const { userId, projectRole } = addProjectMemberDto;

    await this.ensureProjectExists(projectId);
    await this.ensureUserExists(userId);

    const { data, error } = await this.supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        project_role: projectRole,
      })
      .select()
      .single();

    if (error) {
      if (
        error.code === '23505' ||
        error.message.includes('project_members_project_id_user_id_key')
      ) {
        throw new BadRequestException('Este usuario ya pertenece al proyecto');
      }

      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      message: 'Miembro agregado correctamente al proyecto',
      member: data,
    };
  }

  async findProjectMembers(
    projectId: string,
    userId: string,
    role?: string | null,
  ) {
    await this.ensureProjectAccess(projectId, userId, role);

    const { data, error } = await this.supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .order('joined_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      members: data,
    };
  }

  async removeProjectMember(projectId: string, userId: string) {
    await this.ensureProjectExists(projectId);
    await this.ensureUserExists(userId);

    const { data, error } = await this.supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data || data.length === 0) {
      throw new NotFoundException('Miembro no encontrado en el proyecto');
    }

    return {
      success: true,
      message: 'Miembro eliminado correctamente del proyecto',
    };
  }
}
