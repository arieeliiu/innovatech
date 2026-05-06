const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl() {
  if (!API_URL) {
    throw new Error('Falta configurar NEXT_PUBLIC_API_URL');
  }

  return API_URL;
}

function getToken() {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');

  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }

  return token;
}
async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const apiUrl = getApiUrl();

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la solicitud');
  }

  return data;
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
) {
  return request(endpoint, options);
}

export async function getProjects() {
  return request('/projects');
}

export async function createProject(project: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  managerId: string;
}) {
  return request('/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  });
}

export async function getProjectById(projectId: string) {
  return request(`/projects/${projectId}`);
}

export async function getProjectTasks(projectId: string) {
  return request(`/projects/${projectId}/tasks`);
}

export async function createTask(
  projectId: string,
  task: {
    projectId: string;
    title: string;
    description: string;
    responsibleId: string;
    startDate: string;
    endDate: string;
  },
) {
  return request(`/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

export async function getTaskById(taskId: string) {
  return request(`/projects/tasks/${taskId}`);
}

export async function updateTaskStatus(
  taskId: string,
  body: {
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    progress: number;
    comment?: string;
  },
) {
  return request(`/projects/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function getTaskHistory(taskId: string) {
  return request(`/projects/tasks/${taskId}/history`);
}

export async function addProjectMember(
  projectId: string,
  member: {
    userId: string;
    projectRole: string;
  },
) {
  return request(`/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify(member),
  });
}

export async function getProjectMembers(projectId: string) {
  return request(`/projects/${projectId}/members`);
}

export async function removeProjectMember(projectId: string, userId: string) {
  return request(`/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
  });
}

export async function getUsers() {
  return request('/users');
}

export async function deleteProject(projectId: string) {
  return request(`/projects/${projectId}`, {
    method: 'DELETE',
  });
}

export async function createUser(user: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

export async function deleteUser(userId: string) {
  return request(`/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function updateUser(
  userId: string,
  body: {
    name?: string;
    email?: string;
    role?: string;
    password?: string;
  },
) {
  return request(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}