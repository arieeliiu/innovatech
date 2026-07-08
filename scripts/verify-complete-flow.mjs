import { readFile } from 'node:fs/promises';

const env = Object.fromEntries(
  (await readFile(new URL('../services/project-service/.env', import.meta.url), 'utf8'))
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const separator = line.indexOf('=');
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
);

const headers = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
};

async function get(path) {
  const response = await fetch(`${env.SUPABASE_URL}${path}`, { headers });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

const projects = await get(
  '/rest/v1/projects?select=id,name,status&name=like.Flujo%20Integral*',
);
const projectIds = projects.map((project) => project.id);
const tasks = projectIds.length
  ? await get(
      `/rest/v1/project_tasks?select=id,project_id,status,progress&project_id=in.(${projectIds.join(',')})`,
    )
  : [];
const taskIds = tasks.map((task) => task.id);
const comments = taskIds.length
  ? await get(
      `/rest/v1/task_comments?select=id,task_id&task_id=in.(${taskIds.join(',')})`,
    )
  : [];
const members = projectIds.length
  ? await get(
      `/rest/v1/project_members?select=id,project_id,user_id&project_id=in.(${projectIds.join(',')})`,
    )
  : [];
const authResponse = await get('/auth/v1/admin/users?per_page=1000&page=1');
const users = (authResponse.users ?? []).filter((user) =>
  user.email?.startsWith('flujo.'),
);

process.stdout.write(
  JSON.stringify({
    users: users.length,
    projects: projects.length,
    finalizedProjects: projects.filter((project) => project.status === 'DONE').length,
    members: members.length,
    tasks: tasks.length,
    taskStatuses: {
      TODO: tasks.filter((task) => task.status === 'TODO').length,
      IN_PROGRESS: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
      DONE: tasks.filter((task) => task.status === 'DONE').length,
    },
    comments: comments.length,
  }, null, 2),
);
