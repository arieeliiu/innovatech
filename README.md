# Innovatech Solutions

Desarrollo de una plataforma centralizada para la gestión de proyectos, recursos y analítica organizacional para Innovatech Solutions.

## Microservicios actuales

- `auth-service` (`3002`): login y administración de usuarios.
- `project-service` (`3000`): proyectos, tareas y miembros.
- `resource-service` (`3003`): recursos y asignaciones.
- `analytics-service` (`3004`): métricas y reportes.

Cada servicio protege sus rutas validando el JWT de Supabase localmente.

## Estructura inicial del proyecto

```txt
innovatech/
├── frontend/
├── backend/
├── docs/
├── README.md
└── .gitignore
```

## Tecnologías principales

- Next.js
- NestJS
- Supabase
- PostgreSQL
- Metabase

## Estado del proyecto

Proyecto en etapa inicial de configuración.
