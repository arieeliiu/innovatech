const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;

const RESOURCE_SERVICE_URL = process.env.NEXT_PUBLIC_RESOURCE_SERVICE_URL;

const ANALYTICS_SERVICE_URL = process.env.NEXT_PUBLIC_ANALYTICS_SERVICE_URL;

function getApiUrl() {
  if (!API_URL) {
    throw new Error('Falta configurar NEXT_PUBLIC_API_URL');
  }

  return API_URL;
}

function buildServiceApiUrl(baseUrl: string, endpoint: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const apiBaseUrl = normalizedBaseUrl.endsWith('/api')
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api`;

  return `${apiBaseUrl}${endpoint}`;
}

function getToken() {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');

  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }

  return token;
}

function handleExpiredSession(response: Response, token: string | null) {
  if (response.status !== 401 || !token || typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('profilePhoto');
  window.location.replace('/');
}

function getApiErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== 'object') return fallback;

  const payload = data as { message?: unknown; error?: unknown };
  const candidate = payload.message ?? payload.error;

  if (
    typeof candidate === 'string' &&
    candidate.trim() &&
    candidate.trim() !== '{}'
  ) {
    return candidate;
  }
  if (Array.isArray(candidate)) return candidate.join(', ');

  return fallback;
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

  handleExpiredSession(response, token);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Error en la solicitud'));
  }

  return data;
}

async function authRequest(endpoint: string, options: RequestInit = {}) {
  if (!AUTH_SERVICE_URL) {
    throw new Error('Falta configurar NEXT_PUBLIC_AUTH_SERVICE_URL');
  }

  const token = getToken();
  const response = await fetch(`${AUTH_SERVICE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  handleExpiredSession(response, token);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, 'Error en el servicio de autenticación'),
    );
  }

  return data;
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  return request(endpoint, options);
}

export async function authenticate(email: string, password: string) {
  return authRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
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
    endDate?: string;
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

export async function deleteTask(taskId: string) {
  return request(`/projects/tasks/${taskId}`, {
    method: 'DELETE',
  });
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

export async function getTaskComments(taskId: string) {
  return request(`/projects/tasks/${taskId}/comments`);
}

export async function createTaskComment(
  taskId: string,
  body: { title: string; description: string },
) {
  return request(`/projects/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
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
  return authRequest('/users');
}

export async function deleteProject(projectId: string) {
  return request(`/projects/${projectId}`, {
    method: 'DELETE',
  });
}

export async function finalizeProject(
  projectId: string,
  body?: { comment?: string },
) {
  return request(`/projects/${projectId}/finalize`, {
    method: 'PATCH',
    body: JSON.stringify(body ?? {}),
  });
}

export async function createUser(user: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  return authRequest('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

export async function deleteUser(userId: string) {
  return authRequest(`/users/${userId}`, {
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
  return authRequest(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function changeOwnPassword(
  currentPassword: string,
  password: string,
) {
  return authRequest('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, password }),
  });
}

export type ResourceProject = {
  id: string;
  name: string | null;
  status: string;
  roleInProject: string | null;
  startDate: string | null;
  endDate: string | null;
};

export type ResourceSummary = {
  userId: string;
  name: string;
  email: string | null;
  role: 'MANAGER' | 'ARCHITECT' | 'DEVELOPER' | 'CONSULTANT';
  activeProjects: number;
  maximumProjects: number;
  availabilityStatus: 'AVAILABLE' | 'UNAVAILABLE';
  canReceiveNewProjects: boolean;
  projects: ResourceProject[];
};

export async function getResources(): Promise<{
  success: boolean;
  total: number;
  available: number;
  unavailable: number;
  resources: ResourceSummary[];
}> {
  if (!RESOURCE_SERVICE_URL) {
    throw new Error('Falta configurar NEXT_PUBLIC_RESOURCE_SERVICE_URL');
  }

  const token = getToken();
  const response = await fetch(`${RESOURCE_SERVICE_URL}/resources`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  handleExpiredSession(response, token);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, 'No se pudieron cargar los recursos'),
    );
  }

  return data;
}

export type AnalyticsOverview = {
  success: boolean;
  projects: {
    total: number;
    active: number;
    completed: number;
    averageProgress: number;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
  };
  resources: {
    total: number;
    available: number;
    unavailable: number;
  };
};

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  if (!ANALYTICS_SERVICE_URL) {
    throw new Error('Falta configurar NEXT_PUBLIC_ANALYTICS_SERVICE_URL');
  }

  const token = getToken();
  const response = await fetch(`${ANALYTICS_SERVICE_URL}/analytics/overview`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  handleExpiredSession(response, token);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, 'No se pudo cargar la analítica'),
    );
  }

  return data;
}
