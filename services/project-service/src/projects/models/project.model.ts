export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  start_date: string;
  end_date?: string | null;
  main_responsible_id: string;
  created_at?: string;
  updated_at?: string;
}