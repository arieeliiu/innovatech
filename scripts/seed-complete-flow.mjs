import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const TEST_PASSWORD = 'Innovatech2026!';

async function readEnv(path) {
  const content = await readFile(resolve(ROOT, path), 'utf8');
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

const projectEnv = await readEnv('services/project-service/.env');
const frontendEnv = await readEnv('frontend/.env.local');
const supabaseUrl = projectEnv.SUPABASE_URL;
const serviceRoleKey = projectEnv.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = projectEnv.SUPABASE_ANON_KEY;
const authUrl = frontendEnv.NEXT_PUBLIC_AUTH_SERVICE_URL ?? 'http://localhost:3002';
const projectUrl = frontendEnv.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  throw new Error('Faltan credenciales de Supabase en project-service/.env');
}

async function jsonRequest(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || data.error_description || data.error || `HTTP ${response.status}`;
    throw new Error(`${response.status}: ${message}`);
  }

  return data;
}

const adminUser = {
  name: 'Administrador Flujo QA',
  email: 'flujo.admin@example.com',
  role: 'ADMIN',
};

async function login(email, password) {
  const data = await jsonRequest(`${authUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return data.access_token ?? data.session?.access_token ?? data.token;
}

let token;
try {
  token = await login(adminUser.email, TEST_PASSWORD);
} catch {
  await jsonRequest(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: adminUser.email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { name: adminUser.name, role: adminUser.role },
      app_metadata: { is_active: true },
    }),
  });
  token = await login(adminUser.email, TEST_PASSWORD);
}

if (!token) throw new Error('No se obtuvo un token para ejecutar el flujo');

const apiHeaders = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

async function authApi(path, options = {}) {
  return jsonRequest(`${authUrl}${path}`, {
    ...options,
    headers: { ...apiHeaders, ...(options.headers ?? {}) },
  });
}

async function projectsApi(path, options = {}) {
  return jsonRequest(`${projectUrl}${path}`, {
    ...options,
    headers: { ...apiHeaders, ...(options.headers ?? {}) },
  });
}

async function databaseApi(path, options = {}) {
  return jsonRequest(`${supabaseUrl}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers ?? {}),
    },
  });
}

const userDefinitions = [
  adminUser,
  { name: 'Valentina Rojas', email: 'flujo.manager01@example.com', role: 'MANAGER' },
  { name: 'Tomás Herrera', email: 'flujo.manager02@example.com', role: 'MANAGER' },
  { name: 'Camila Soto', email: 'flujo.manager03@example.com', role: 'MANAGER' },
  { name: 'Diego Morales', email: 'flujo.manager04@example.com', role: 'MANAGER' },
  { name: 'Sofía Castillo', email: 'flujo.dev01@example.com', role: 'DEVELOPER' },
  { name: 'Matías Vega', email: 'flujo.dev02@example.com', role: 'DEVELOPER' },
  { name: 'Isidora Fuentes', email: 'flujo.arch01@example.com', role: 'ARCHITECT' },
  { name: 'Benjamín Silva', email: 'flujo.arch02@example.com', role: 'ARCHITECT' },
  { name: 'Antonia Reyes', email: 'flujo.consult01@example.com', role: 'CONSULTANT' },
];

const existingUsersResponse = await authApi('/users');
const existingUsers = existingUsersResponse.users ?? existingUsersResponse.data ?? [];
const users = [];

for (const definition of userDefinitions) {
  let user = existingUsers.find(
    (item) => item.email?.toLowerCase() === definition.email.toLowerCase(),
  );

  if (!user) {
    const response = await authApi('/users', {
      method: 'POST',
      body: JSON.stringify({ ...definition, password: TEST_PASSWORD }),
    });
    user = response.user;
  }

  users.push(user);
}
process.stderr.write(`Usuarios preparados: ${users.length}\n`);

const managers = users.filter((user) => user.role === 'MANAGER');
const professionals = users.filter((user) => user.role !== 'ADMIN');
const existingProjectsResponse = await projectsApi('/projects');
const existingProjects = existingProjectsResponse.projects ?? existingProjectsResponse.data ?? [];
const projects = [];

for (let index = 0; index < 10; index += 1) {
  const number = String(index + 1).padStart(2, '0');
  const name = `Flujo Integral ${number}`;
  let project = existingProjects.find((item) => item.name === name);

  if (!project) {
    const manager = managers[index % managers.length];
    const response = await projectsApi('/projects', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description: `Proyecto de demostración ${number} para validar el flujo completo de Innovatech.`,
        startDate: `2026-${index < 5 ? '07' : '08'}-${String((index % 5) + 6).padStart(2, '0')}`,
        endDate: `2026-12-${String(index + 10).padStart(2, '0')}`,
        managerId: manager.id,
      }),
    });
    project = response.project;
  }

  projects.push(project);
}
process.stderr.write(`Proyectos preparados: ${projects.length}\n`);

const membershipCounts = new Map(professionals.map((user) => [user.id, 0]));
const taskTitles = [
  'Levantamiento de requerimientos',
  'Diseño de solución',
  'Implementación principal',
  'Pruebas y validación',
  'Documentación y entrega',
];

let tasksCreated = 0;
let commentsCreated = 0;
let statusUpdates = 0;

for (let projectIndex = 0; projectIndex < projects.length; projectIndex += 1) {
  const project = projects[projectIndex];
  const manager = managers[projectIndex % managers.length];
  const candidates = [...professionals].sort(
    (left, right) =>
      (membershipCounts.get(left.id) ?? 0) - (membershipCounts.get(right.id) ?? 0),
  );
  const secondMember = candidates.find(
    (candidate) => candidate.id !== manager.id && (membershipCounts.get(candidate.id) ?? 0) < 3,
  );
  const selectedMembers = [manager, secondMember].filter(Boolean);

  const membersResponse = await projectsApi(`/projects/${project.id}/members`);
  const currentMembers = membersResponse.members ?? [];

  for (const member of selectedMembers) {
    if (!currentMembers.some((item) => item.user_id === member.id)) {
      await databaseApi('/project_members', {
        method: 'POST',
        body: JSON.stringify({
          project_id: project.id,
          user_id: member.id,
          project_role: member.role,
        }),
      });
    }
    membershipCounts.set(member.id, (membershipCounts.get(member.id) ?? 0) + 1);
  }

  const tasksResponse = await projectsApi(`/projects/${project.id}/tasks`);
  const existingTasks = tasksResponse.tasks ?? [];

  for (let taskIndex = 0; taskIndex < taskTitles.length; taskIndex += 1) {
    const title = taskTitles[taskIndex];
    let task = existingTasks.find((item) => item.title === title);
    const responsible = selectedMembers[taskIndex % selectedMembers.length];

    if (!task) {
      const response = await projectsApi(`/projects/${project.id}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          projectId: project.id,
          title,
          description: `${title} para ${project.name}, incluyendo revisión y criterios de aceptación.`,
          responsibleId: responsible.id,
          startDate: `2026-08-${String(taskIndex + 3).padStart(2, '0')}`,
          endDate: `2026-11-${String(taskIndex + 10).padStart(2, '0')}`,
        }),
      });
      task = response.task;
      tasksCreated += 1;
    }

    const statusCases = [
      { status: 'DONE', progress: 100 },
      { status: 'IN_PROGRESS', progress: 65 },
      { status: 'IN_PROGRESS', progress: 30 },
      { status: 'TODO', progress: 0 },
      { status: 'DONE', progress: 100 },
    ];
    const nextStatus = statusCases[(taskIndex + projectIndex) % statusCases.length];

    if (task.status !== nextStatus.status || task.progress !== nextStatus.progress) {
      await projectsApi(`/projects/tasks/${task.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...nextStatus,
          comment: `Avance actualizado durante la validación integral de ${project.name}.`,
        }),
      });
      statusUpdates += 1;
    }

    const commentsResponse = await projectsApi(`/projects/tasks/${task.id}/comments`);
    const currentComments = commentsResponse.comments ?? [];
    const commentTitle = `Seguimiento ${projectIndex + 1}.${taskIndex + 1}`;
    if (!currentComments.some((comment) => comment.title === commentTitle)) {
      await projectsApi(`/projects/tasks/${task.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          title: commentTitle,
          description: `Se revisó “${title}”. El equipo dejó avances registrados y próximos pasos definidos.`,
        }),
      });
      commentsCreated += 1;
    }
  }
  process.stderr.write(`Proyecto procesado: ${projectIndex + 1}/10\n`);
}

for (const project of projects.slice(0, 2)) {
  if (project.status !== 'DONE') {
    await projectsApi(`/projects/${project.id}/finalize`, {
      method: 'PATCH',
      body: JSON.stringify({ comment: 'Proyecto finalizado como parte del flujo integral de validación.' }),
    });
  }
}

process.stdout.write(
  JSON.stringify(
    {
      users: users.length,
      projects: projects.length,
      tasksCreated,
      statusUpdates,
      commentsCreated,
      finalizedProjects: 2,
      testAccountsPassword: TEST_PASSWORD,
    },
    null,
    2,
  ),
);
