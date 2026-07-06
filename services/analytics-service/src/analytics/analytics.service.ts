import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseClient, type User } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.constants';

interface ProjectRecord {
  id: string;
  status: string;
}

interface TaskRecord {
  id: string;
  status: string;
  project_id: string;
  progress: number | null;
}

interface ProjectMemberRecord {
  user_id: string;
  project_id: string;
}

interface ResourceAssignmentRecord {
  user_id: string;
  project_id: string;
  status: string;
}

@Injectable()
export class AnalyticsService {
  private readonly maxActiveProjects = 3;

  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  private async getAllUsers(): Promise<User[]> {
    const users: User[] = [];
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

      users.push(...(data.users ?? []));

      if ((data.users ?? []).length < perPage) {
        return users;
      }

      page += 1;
    }
  }

  async getOverview() {
    const [
      projectsResult,
      tasksResult,
      membersResult,
      assignmentsResult,
      users,
    ] = await Promise.all([
      this.supabase.schema('public').from('projects').select('id, status'),

      this.supabase
        .schema('public')
        .from('project_tasks')
        .select('id, status, project_id, progress'),

      this.supabase
        .schema('public')
        .from('project_members')
        .select('user_id, project_id'),

      this.supabase
        .schema('resource_service')
        .from('resource_assignments')
        .select('user_id, project_id, status')
        .eq('status', 'ACTIVE'),

      this.getAllUsers(),
    ]);

    if (projectsResult.error) {
      throw new InternalServerErrorException(projectsResult.error.message);
    }

    if (tasksResult.error) {
      throw new InternalServerErrorException(tasksResult.error.message);
    }

    if (membersResult.error) {
      throw new InternalServerErrorException(membersResult.error.message);
    }

    if (assignmentsResult.error) {
      throw new InternalServerErrorException(assignmentsResult.error.message);
    }

    const projects = (projectsResult.data ?? []) as ProjectRecord[];
    const tasks = (tasksResult.data ?? []) as TaskRecord[];
    const members = (membersResult.data ?? []) as ProjectMemberRecord[];
    const assignments = (assignmentsResult.data ??
      []) as ResourceAssignmentRecord[];

    const activeProjects = projects.filter(
      (project) => project.status?.toUpperCase() !== 'DONE',
    );

    const completedProjects = projects.filter(
      (project) => project.status?.toUpperCase() === 'DONE',
    );

    const tasksByProject = new Map<string, TaskRecord[]>();

    for (const task of tasks) {
      const projectTasks = tasksByProject.get(task.project_id) ?? [];
      projectTasks.push(task);
      tasksByProject.set(task.project_id, projectTasks);
    }

    const projectProgress = projects.map((project) => {
      if (project.status?.toUpperCase() === 'DONE') {
        return 100;
      }

      const projectTasks = tasksByProject.get(project.id) ?? [];

      if (projectTasks.length === 0) {
        return 0;
      }

      return Math.round(
        projectTasks.reduce(
          (sum, task) => sum + Number(task.progress ?? 0),
          0,
        ) / projectTasks.length,
      );
    });

    const averageProgress =
      projects.length === 0
        ? 0
        : Math.round(
            projectProgress.reduce((sum, progress) => sum + progress, 0) /
              projects.length,
          );

    const todoTasks = tasks.filter(
      (task) => task.status?.toUpperCase() === 'TODO',
    );

    const inProgressTasks = tasks.filter(
      (task) => task.status?.toUpperCase() === 'IN_PROGRESS',
    );

    const completedTasks = tasks.filter(
      (task) => task.status?.toUpperCase() === 'DONE',
    );

    const professionalUsers = users.filter((user) => {
      if (
        user.app_metadata?.is_active === false ||
        user.app_metadata?.deleted_at
      ) {
        return false;
      }

      const role = String(
        user.user_metadata?.role ?? user.app_metadata?.role ?? '',
      )
        .trim()
        .toUpperCase();

      return ['MANAGER', 'ARCHITECT', 'DEVELOPER', 'CONSULTANT'].includes(role);
    });

    const activeProjectIds = new Set(
      activeProjects.map((project) => project.id),
    );

    const activeProjectsByUser = new Map<string, Set<string>>();

    for (const member of members) {
      if (!activeProjectIds.has(member.project_id)) {
        continue;
      }

      const projectIds =
        activeProjectsByUser.get(member.user_id) ?? new Set<string>();

      projectIds.add(member.project_id);
      activeProjectsByUser.set(member.user_id, projectIds);
    }

    for (const assignment of assignments) {
      if (
        assignment.status?.trim().toUpperCase() !== 'ACTIVE' ||
        !activeProjectIds.has(assignment.project_id)
      ) {
        continue;
      }

      const projectIds =
        activeProjectsByUser.get(assignment.user_id) ?? new Set<string>();

      projectIds.add(assignment.project_id);
      activeProjectsByUser.set(assignment.user_id, projectIds);
    }

    const unavailableResources = professionalUsers.filter(
      (user) =>
        (activeProjectsByUser.get(user.id)?.size ?? 0) >=
        this.maxActiveProjects,
    ).length;

    const availableResources = professionalUsers.length - unavailableResources;

    return {
      success: true,
      projects: {
        total: projects.length,
        active: activeProjects.length,
        completed: completedProjects.length,
        averageProgress,
      },
      tasks: {
        total: tasks.length,
        todo: todoTasks.length,
        inProgress: inProgressTasks.length,
        completed: completedTasks.length,
      },
      resources: {
        total: professionalUsers.length,
        available: availableResources,
        unavailable: unavailableResources,
      },
    };
  }
}
