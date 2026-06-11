import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.constants';

interface ProjectRecord {
  id: string;
  status: string;
  progress: number | null;
}

interface TaskRecord {
  id: string;
  status: string;
}

interface ProjectMemberRecord {
  user_id: string;
  project_id: string;
}

@Injectable()
export class AnalyticsService {
  private readonly maxActiveProjects = 3;

  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async getOverview() {
    const [
      projectsResult,
      tasksResult,
      membersResult,
      usersResult,
    ] = await Promise.all([
      this.supabase
        .schema('public')
        .from('projects')
        .select('id, status, progress'),

      this.supabase
        .schema('public')
        .from('project_tasks')
        .select('id, status'),

      this.supabase
        .schema('public')
        .from('project_members')
        .select('user_id, project_id'),

      this.supabase.auth.admin.listUsers(),
    ]);

    if (projectsResult.error) {
      throw new InternalServerErrorException(
        projectsResult.error.message,
      );
    }

    if (tasksResult.error) {
      throw new InternalServerErrorException(
        tasksResult.error.message,
      );
    }

    if (membersResult.error) {
      throw new InternalServerErrorException(
        membersResult.error.message,
      );
    }

    if (usersResult.error) {
      throw new InternalServerErrorException(
        usersResult.error.message,
      );
    }

    const projects = (projectsResult.data ?? []) as ProjectRecord[];
    const tasks = (tasksResult.data ?? []) as TaskRecord[];
    const members = (membersResult.data ?? []) as ProjectMemberRecord[];

    const activeProjects = projects.filter(
      (project) => project.status?.toUpperCase() !== 'DONE',
    );

    const completedProjects = projects.filter(
      (project) => project.status?.toUpperCase() === 'DONE',
    );

    const averageProgress =
      projects.length === 0
        ? 0
        : Math.round(
            projects.reduce(
              (sum, project) => sum + (project.progress ?? 0),
              0,
            ) / projects.length,
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

    const professionalUsers = usersResult.data.users.filter((user) => {
      const role = String(
        user.user_metadata?.role ??
          user.app_metadata?.role ??
          '',
      )
        .trim()
        .toUpperCase();

      return [
        'ARCHITECT',
        'ARQUITECTO',
        'DEVELOPER',
        'DESARROLLO',
        'CONSULTANT',
        'CONSULTOR',
      ].includes(role);
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
        activeProjectsByUser.get(member.user_id) ??
        new Set<string>();

      projectIds.add(member.project_id);
      activeProjectsByUser.set(member.user_id, projectIds);
    }

    const unavailableResources = professionalUsers.filter(
      (user) =>
        (activeProjectsByUser.get(user.id)?.size ?? 0) >=
        this.maxActiveProjects,
    ).length;

    const availableResources =
      professionalUsers.length - unavailableResources;

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