export type ProjectStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus | string;
  progress: number;
  start_date: string;
  end_date: string | null;
  main_responsible_id: string;
  created_at?: string;
  updated_at?: string;
};

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  responsible_id: string;
  status: TaskStatus;
  progress: number;
  start_date: string;
  end_date: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProjectMember = {
  id: string;
  project_id: string;
  user_id: string;
  project_role: string;
  joined_at: string;
};