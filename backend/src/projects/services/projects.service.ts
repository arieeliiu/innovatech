import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { CreateProjectDto } from '../dto/create-project.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { AddProjectMemberDto } from '../dto/add-project-member.dto';

@Injectable()
export class ProjectsService {
  private supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  );

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

  async createProject(createProjectDto: CreateProjectDto) {
    const { name, description, startDate, endDate, managerId } =
      createProjectDto;

    await this.ensureUserExists(managerId);

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

  async findAll() {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      projects: data,
    };
  }

  async findById(id: string) {
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

  async createTask(projectId: string, createTaskDto: CreateTaskDto) {
    const { title, description, responsibleId, startDate, endDate } =
      createTaskDto;

    await this.ensureProjectExists(projectId);
    await this.ensureUserExists(responsibleId);

    const { data, error } = await this.supabase
      .from('project_tasks')
      .insert({
        project_id: projectId,
        title,
        description,
        responsible_id: responsibleId,
        start_date: startDate,
        end_date: endDate,
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

  async findTasksByProject(projectId: string) {
    await this.ensureProjectExists(projectId);

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

  async findTaskById(taskId: string) {
    const { data, error } = await this.supabase
      .from('project_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Tarea no encontrada');
    }

    return {
      success: true,
      task: data,
    };
  }

  async updateTaskStatus(
    taskId: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
    userId: string,
  ) {
    const { status, progress, comment } = updateTaskStatusDto;

    await this.ensureUserExists(userId);

    const { data: existingTask, error: findError } = await this.supabase
      .from('project_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (findError || !existingTask) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const { data: updatedTask, error: updateError } = await this.supabase
      .from('project_tasks')
      .update({
        status,
        progress,
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

  async findTaskHistory(taskId: string) {
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
      throw new InternalServerErrorException(error.message);
    }

    return {
      success: true,
      message: 'Miembro agregado correctamente al proyecto',
      member: data,
    };
  }

  async findProjectMembers(projectId: string) {
    await this.ensureProjectExists(projectId);

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